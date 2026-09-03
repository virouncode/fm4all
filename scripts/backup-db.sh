#!/usr/bin/env bash
#
# Sauvegarde manuelle d'une base Neon vers un fichier local.
#
#   ./scripts/backup-db.sh                  # utilise .env.local
#   ./scripts/backup-db.sh .env.prod        # utilise un autre fichier
#   DATABASE_URL="postgres://..." ./scripts/backup-db.sh -
#
# Produit un fichier au format custom (-Fc) dans backups/, restaurable
# integralement ou table par table avec pg_restore.

set -euo pipefail

# libpq n'est pas dans le PATH par defaut avec Homebrew.
if command -v pg_dump >/dev/null 2>&1; then
  PG_BIN="$(dirname "$(command -v pg_dump)")"
elif [ -x /opt/homebrew/opt/libpq/bin/pg_dump ]; then
  PG_BIN="/opt/homebrew/opt/libpq/bin"
else
  echo "pg_dump introuvable. Installer libpq : brew install libpq" >&2
  exit 1
fi
OUT_DIR="backups"
KEEP=10  # nombre de sauvegardes conservees par branche

ENV_FILE="${1:-.env.local}"

if [ "$ENV_FILE" != "-" ]; then
  [ -f "$ENV_FILE" ] || { echo "Fichier introuvable : $ENV_FILE" >&2; exit 1; }
  DATABASE_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
fi
[ -n "${DATABASE_URL:-}" ] || { echo "DATABASE_URL absente" >&2; exit 1; }

# pg_dump doit passer par l'endpoint direct, pas par le pooler PgBouncer.
DIRECT_URL="${DATABASE_URL/-pooler./.}"

# Etiquette lisible pour le nom de fichier : ep-calm-boat-xxxx -> calm-boat
HOST=$(printf '%s' "$DIRECT_URL" | sed -E 's#^.*@([^./]+).*#\1#')
LABEL=$(printf '%s' "$HOST" | sed -E 's/^ep-//; s/-[a-z0-9]+$//')
STAMP=$(date +%Y-%m-%d_%H%M%S)
FILE="$OUT_DIR/${LABEL}_${STAMP}.dump"

mkdir -p "$OUT_DIR"
echo "Branche : $LABEL"
echo "Cible   : $FILE"

"$PG_BIN/pg_dump" "$DIRECT_URL" --format=custom --no-owner --no-privileges --file="$FILE"

echo "OK — $(du -h "$FILE" | cut -f1)"

# Purge : ne garder que les KEEP plus recentes de cette branche
ls -1t "$OUT_DIR/${LABEL}_"*.dump 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  echo "purge : $old"
  rm -f "$old"
done
