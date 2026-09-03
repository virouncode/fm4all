# Sauvegarde et restauration de la base

> Notice du script `scripts/backup-db.sh`.
> Sauvegarde manuelle d'une branche Neon vers un fichier local, en complément
> du point-in-time restore de Neon.

---

## 1. Utilisation

```bash
./scripts/backup-db.sh              # sauvegarde la base de .env.local
./scripts/backup-db.sh .env.prod    # sauvegarde la base d'un autre fichier d'env

DATABASE_URL="postgresql://..." ./scripts/backup-db.sh -   # URL passée directement
```

Le fichier produit atterrit dans `backups/`, nommé par branche et horodaté :

```
backups/calm-boat_2026-09-01_152622.dump
backups/small-base_2026-09-01_152844.dump
```

`backups/` et `*.dump` sont dans le `.gitignore`. Ces fichiers contiennent des
données réelles : ne jamais les versionner, ne jamais les envoyer par email.

---

## 2. Ce que le script fait

| Étape                   | Détail                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Lecture de l'URL        | Extrait `DATABASE_URL` du fichier d'env, guillemets retirés                                      |
| Contournement du pooler | Réécrit `-pooler.` en `.` — `pg_dump` doit passer par l'endpoint direct, pas par PgBouncer       |
| Étiquetage              | `ep-calm-boat-agmpxcap` → `calm-boat`, pour ne pas confondre un dump de prod avec un dump de dev |
| Dump                    | `pg_dump --format=custom --no-owner --no-privileges`                                             |
| Purge                   | Ne conserve que les `KEEP` sauvegardes les plus récentes **par branche** (10 par défaut)         |

`--no-owner` et `--no-privileges` évitent que la restauration échoue sur des rôles
Postgres qui n'existent pas dans la base cible — utile pour restaurer un dump de
prod dans une branche de dev.

---

## 3. Restauration

Toujours restaurer vers l'**endpoint direct** (URL sans `-pooler`).

```bash
# Restauration complète, en écrasant l'existant
pg_restore --clean --if-exists --no-owner -d "<URL_directe>" backups/calm-boat_....dump

# Une seule table, données uniquement
pg_restore --data-only --table=nettoyage_tarifs --no-owner \
  -d "<URL_directe>" backups/calm-boat_....dump

# Inspecter le contenu d'une archive sans rien restaurer
pg_restore -l backups/calm-boat_....dump
```

⚠️ `--clean --if-exists` **supprime** les objets existants avant de les recréer.
Sur la branche de prod, préférer d'abord une restauration dans une branche Neon
jetable, vérifier, puis basculer.

---

## 4. Prérequis

Le script cherche `pg_dump` dans le `PATH`, puis dans `/opt/homebrew/opt/libpq/bin`.

```bash
brew install libpq
```

La version majeure du client doit être ≥ celle du serveur. Vérification :

```bash
pg_dump --version                              # client
psql "$DATABASE_URL" -A -t -c "show server_version;"   # serveur Neon
```

Testé avec un client 17.2 contre un serveur Neon 17.11.

---

## 5. Quand lancer une sauvegarde

- **Avant toute migration de schéma** (les migrations sont pilotées depuis le projet portail)
- **Avant toute manipulation de données en masse** (`UPDATE` ou `DELETE` sans filtre étroit)
- Périodiquement sur la branche de prod, selon la tolérance à la perte

---

## 6. Articulation avec le PITR de Neon

Les deux mécanismes couvrent des risques différents et ne se remplacent pas.

|                     | PITR Neon                        | `backup-db.sh`                                      |
| ------------------- | -------------------------------- | --------------------------------------------------- |
| Granularité         | à la seconde près                | instant du dernier lancement                        |
| Fenêtre (plan Free) | 6 h, max 1 Go                    | illimitée, sur ton disque                           |
| Localisation        | chez Neon                        | hors de Neon                                        |
| Coût                | inclus                           | gratuit                                             |
| Couvre              | l'erreur remarquée tout de suite | le sinistre découvert tard, la perte du compte Neon |

Le PITR rattrape le `DELETE` sans `WHERE` constaté dans la minute. Le dump manuel
couvre ce qui dépasse la fenêtre de 6 h et garde une copie indépendante du
fournisseur.

**Aucun des deux ne protège d'une panne de connexion** : une `DATABASE_URL`
corrompue rend la base injoignable sans que les données soient touchées. Ce cas
est couvert par les `console.error` des queries (`src/server/queries/`), qui font
apparaître l'erreur réelle dans les logs Vercel.
