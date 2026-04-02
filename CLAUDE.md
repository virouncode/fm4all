# FM4ALL - Guide de Développement pour Claude

> **Périmètre de ce projet** : Ce dépôt contient le **site vitrine marketing** (www.fm4all.com) et le **comparateur / générateur de devis** (parcours public, sans authentification). La plateforme de gestion opérationnelle (portail back-office : tickets, prestations, utilisateurs, etc.) a été extraite dans un projet séparé.

> **Stack principale** : Next.js 14+ App Router · Sanity CMS · next-intl (FR/EN) · Tailwind CSS · shadcn/ui · Drizzle ORM (pour le devis)

---

## 🔴 PROTOCOLE D'AUDIT OBLIGATOIRE

**À exécuter systématiquement avant de déclarer un audit ou une implémentation terminés. Aucune exception.**

### Étape 1 — Lire tous les fichiers concernés EN ENTIER

Ne pas scanner, ne pas supposer. Lire ligne par ligne :

- Le schéma DB (`db/schema/`)
- Le schéma Zod (`zod-schemas/`)
- L'action serveur (`server/actions/`)
- La query (`server/queries/`)
- Le composant parent + tous les composants enfants consommateurs

### Étape 2 — Tracer le flux complet dans les deux sens

**Sens descendant** : requête → action → query → DB
**Sens montant** : DB → type retourné → prop passée → rendu UI

Pour chaque prop passée d'un parent à un enfant : vérifier qu'elle est bien utilisée et que son type est correct.

### Étape 3 — Vérifier chaque posture séparément

Pour chaque fichier modifié, simuler mentalement :

- Posture **client** : quel `entrepriseId` ? quels droits ? quel rendu ?
- Posture **prestataire** : idem — attention aux tables différentes (`userPrestataireSiteAttributions` ≠ `userClientSiteAttributions`)
- Posture **plateforme** : bypass actif ? cookie vérifié ?

### Étape 4 — Vérifier les états React

- Tous les `useState` sont-ils réinitialisés quand l'entité change (ex: changement d'utilisateur sélectionné) ?
- Les `useEffect` ont-ils toutes leurs dépendances ?
- L'objet `searchParams` entier est-il dans le `useEffect` (pas les propriétés individuelles) ?

### Étape 5 — TypeScript

```bash
pnpm tsc --noEmit
```

Zéro erreur. Zéro `any`. Zéro `@ts-ignore` sans justification.

### Étape 6 — Audit frontend obligatoire

Pour chaque composant modifié ou créé, vérifier ligne par ligne :

**Rendu conditionnel**

- Chaque `{condition && <Composant />}` : la condition est-elle correcte pour toutes les postures ?
- Chaque `{condition ? <A /> : <B />}` : les deux branches sont-elles cohérentes avec les permissions réelles ?
- Un composant jamais rendu parce que sa condition est toujours `false` = bug silencieux

**Cohérence posture / permissions**

- Chaque bouton d'action (Modifier, Supprimer, Attribuer...) : est-il conditionné par `canEdit` / `canManage` ?
- `canEdit` est-il calculé avec le bon rôle selon la posture (`roleClientAdhesion` vs `rolePrestataireAdhesion`) ?
- Un utilisateur en posture prestataire ne doit pas voir les contrôles basés sur `roleClientAdhesion`
- Les permissions sont-elles vérifiées aussi côté serveur (action) et pas seulement côté UI ?

**Données affichées**

- Les données affichées correspondent-elles à l'entité sélectionnée (pas à l'utilisateur connecté) ?
- Si l'utilisateur change d'entité sélectionnée (ex: autre utilisateur, autre client), le composant se vide-t-il et se recharge-t-il correctement ?
- Une liste vide affiche-t-elle "Aucun X" alors que la DB contient des données = bug de fetch ou de condition

**Props passées aux composants enfants**

- Tracer chaque prop du parent vers l'enfant : est-elle bien reçue, bien utilisée, et du bon type ?
- Une prop `undefined` ou `""` passée silencieusement à un enfant = comportement incorrect invisible

### Étape 7 — Simulation parcours utilisateur

Pour chaque rôle (admin, manager, collaborateur) et chaque posture :

1. **Ouverture** : quels éléments sont visibles / masqués / désactivés / pré-remplis ?
2. **Action** : que se passe-t-il quand l'utilisateur clique sur X ?
3. **Erreur** : que voit-il si la requête échoue ?
4. **Succès** : le store est-il mis à jour ? Le composant se rafraîchit-il ?

---

## ⛔ RÈGLE ABSOLUE — NE JAMAIS RÉINVENTER LA ROUE

**Cette règle prime sur tout le reste. Le non-respect de cette règle est la source principale des bugs et divergences.**

Avant d'écrire **la moindre ligne de code**, pour toute nouvelle feature ou sous-composant :

1. **Identifier le module existant le plus proche** (ex: `/app/devis` ressemble à `/app/tickets`)
2. **Lire le code de ce module** — table, dialogs de filtres, dialog de tri, colonnes, actions
3. **Copier-coller le pattern exact**, adapter uniquement ce qui est strictement nécessaire
4. **Ne rien inventer** : pas d'objet intermédiaire, pas de logique alternative, pas de "ça devrait marcher aussi"

### Modules de référence par type de feature

| Feature                             | Module de référence à lire EN PREMIER                            |
| ----------------------------------- | ---------------------------------------------------------------- |
| Page dynamique Sanity avec metadata | `/services/[slug]/page.tsx` ou `/blog/[slug]/[subSlug]/page.tsx` |
| Formulaire create/edit (RHF + Zod)  | Tout composant `*Form.tsx` dans `/devis/`                        |
| Store Zustand multi-étapes          | `stores/` du module devis                                        |
| Redirections SEO / slugs            | `redirects/handleRedirects.ts`                                   |

### Exemples de divergences à ne JAMAIS faire

- ❌ Construire un objet `sortSearchParams = { serviceId: searchParams.serviceId }` au lieu de passer `searchParams` directement → bug string `"undefined"` dans l'URL
- ❌ Utiliser `form.watch()` dans le render body au lieu de `useWatch()` → "Maximum update depth exceeded"
- ❌ Utiliser `next/navigation` au lieu de `@/i18n/navigation` → pathname contient la locale
- ❌ Appeler `getLocale()` dans un layout au lieu d'extraire depuis `params` → moins fiable

**En cas de doute** : lire le fichier existant le plus proche et copier sa structure exacte.

---

## Vue d'Ensemble du Projet

### Contexte Métier

**FM4ALL** est une société de courtage en **facility management / office management** pour les TPE/PME de Paris et Île-de-France. Positionnement clé : **"1 contact, 1 contrat, 1 facture"** — toutes les prestations externalisées consolidées en un seul interlocuteur.

**Problème résolu** : Les petites structures (< 3 000 m²) ont du mal à accéder à des tarifs FM compétitifs. FM4ALL agrège la demande de ses clients pour négocier des remises volumes (−10% en moyenne) et automatise la génération de devis multi-services en quelques minutes.

**Cibles clients** : TPE/PME, start-ups, cabinets médicaux, espaces de coworking, locaux commerciaux, entrepôts logistiques.

**Modèle économique** : FM4ALL joue un rôle d'intermédiaire — il porte le contrat, facture le client final, reverse aux prestataires et prend une marge. Le client n'a qu'une seule facture et un seul interlocuteur.

### Services Proposés

9 domaines, chacun disponible en 3 niveaux (Essentiel / Confort / Excellence) :

1. Nettoyage & propreté
2. Maintenance multitechnique
3. Sécurité incendie
4. Machines à café
5. Fontaines à eau
6. Fruits & Snacks
7. Boissons variées
8. Office Manager externalisé (HOF Manager, à partir d'une demi-journée/semaine)
9. Pilotage FM4ALL (gestion déléguée complète)

---

## Ce que contient CE projet

### 1 — Site Vitrine Marketing (`/(site-vitrine)/`)

Le site public www.fm4all.com géré via **Sanity CMS** :

- Pages de présentation des services (nettoyage, maintenance, etc.) avec contenu riche (blocs, images, FAQ)
- Pages par secteur d'activité (bureaux, cabinet médical, coworking…)
- Blog d'articles (catégorisés, multi-langue)
- Pages statiques (engagements, partenaires, FAQ, CGV, mentions légales, etc.)
- Pages service × ville (SEO local, ex: nettoyage-paris, maintenance-lyon)
- Internationalisation FR/EN via next-intl avec pathnames localisés

**Architecture** : Server Components statiques + `generateStaticParams()` pour les pages dynamiques Sanity. Pas de Client Components sauf exceptions (cookies banner, etc.).

### 2 — Comparateur & Générateur de Devis (`/(application)/devis/`)

Le parcours public de configuration de devis multi-services :

- Accessible sans compte (parcours 100% public)
- Multi-étapes : locaux → services (nettoyage, café, fontaines, snacks, etc.) → propositions prestataires → récapitulatif
- Tarification temps réel depuis la DB (catalogue partenaires)
- Sauvegarde de devis et envoi par email
- Intégration avec le back-office (le devis signé devient des prestations dans l'autre projet)

**Architecture** : Client Components avec état global (Zustand) pour le parcours multi-étapes + Server Actions pour les mutations (save devis, envoyer email).

> ⚠️ **Le portail back-office** (tickets, prestations, utilisateurs, sites, entreprises, facturation, etc.) a été **extrait dans un projet séparé**. Les changelogs ci-dessous font référence à cet historique mais ces modules ne sont **plus dans ce dépôt**.

---

## Stack Technique

### Frontend

- **Next.js 14+** avec App Router
- **TypeScript** (strict mode)
- **React 18** avec Server & Client Components
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **next-intl** pour l'internationalisation (FR/EN)

### Backend

- **Drizzle ORM** avec PostgreSQL (utilisé par le module devis : tarifs, sauvegarde devis)
- **next-safe-action** pour les Server Actions sécurisées
- **Zod** pour la validation de schémas
- **Sanity CMS** pour le contenu du site vitrine (services, articles, secteurs)

### Outils de Développement

- **pnpm** comme gestionnaire de paquets
- **Vitest** pour les tests
- **ESLint** + **Prettier** pour le linting

---

## Architecture du Projet

### Structure des Dossiers

```
src/
├── app/[locale]/(main)/
│   ├── (site-vitrine)/                     # Site marketing public
│   │   ├── (home)/                         # Page d'accueil
│   │   ├── services/[slug]/[subSlug]/      # Pages service × ville
│   │   ├── secteurs/[slug]/                # Pages secteur d'activité
│   │   ├── blog/[slug]/[subSlug]/          # Articles de blog
│   │   └── layout.tsx                      # Header + Footer + CookieBanner
│   │
│   └── (application)/devis/               # Comparateur/générateur de devis
│       ├── (etapes)/                       # Étapes du parcours
│       │   ├── locaux/                     # Config des locaux
│       │   ├── nettoyage/                  # Service nettoyage
│       │   ├── food-beverage/              # Café, fontaines, snacks
│       │   └── ...                         # Autres services
│       ├── layout.tsx                      # Layout devis (sidebar, total)
│       └── sauvegarder/                    # Sauvegarde/envoi devis
│
├── sanity/                                 # CMS Sanity
│   ├── lib/
│   │   ├── client.ts                       # Client Sanity
│   │   ├── image.ts                        # urlFor() helper
│   │   └── live.ts                         # Live content (définition)
│   ├── queries.ts                          # Toutes les GROQ queries
│   └── schemaTypes/                        # Schémas Sanity (article, service, etc.)
│
├── i18n/
│   ├── routing.ts                          # Config next-intl (locales, pathnames)
│   └── navigation.ts                       # Link, useRouter, usePathname typés
│
├── server/
│   ├── actions/                            # Server Actions (devis, emails)
│   └── queries/                            # Queries DB pour le devis
│
├── db/
│   └── schema/                             # Schéma Drizzle (devis, tarifs partenaires)
│
├── zod-schemas/                            # Schemas Zod pour le devis
│
├── redirects/                              # Mappings SEO (slugs FR↔EN, legacy URLs)
│   ├── handleRedirects.ts
│   ├── urls.ts
│   ├── articlesSlugMappings.ts
│   ├── servicesSlugMappings.ts
│   └── secteursSlugMappings.ts
│
├── lib/
│   └── metadata/
│       └── metadata-helpers.ts             # generateAlternates(), getLocaleFromPathname()
│
└── components/
    ├── blocs/                              # Composants PortableText (Bloc, TltrCard)
    ├── header/, footer/                    # Navigation site
    ├── banners/                            # CookieBanner
    └── ui/                                 # Composants shadcn/ui
```

### Modules de référence — Site Vitrine

| Feature                         | Module de référence                               |
| ------------------------------- | ------------------------------------------------- |
| Page dynamique Sanity (service) | `/services/[slug]/page.tsx`                       |
| Page dynamique Sanity (article) | `/blog/[slug]/[subSlug]/page.tsx`                 |
| Page liste avec données Sanity  | `/services/page.tsx`                              |
| Metadata + hreflang             | `generateAlternates()` dans `metadata-helpers.ts` |
| Redirections SEO slug           | `redirects/handleRedirects.ts`                    |

### Modules de référence — Devis (si back-office extrait)

| Feature                            | Module de référence                  |
| ---------------------------------- | ------------------------------------ |
| Formulaire create/edit (RHF + Zod) | Patterns dans ce CLAUDE.md §Patterns |
| Server Action avec validation      | `server/actions/*.ts`                |
| Store Zustand multi-étapes         | `stores/`                            |

---

## Patterns et Conventions

### 1. Normalisation et Nettoyage des Données (Stratégie à 2 niveaux)

**RÈGLE CRITIQUE** : Séparer la validation/nettoyage (schema) de la normalisation/transformation (action serveur).

#### Niveau 1 : Schema Zod (validation + nettoyage)

**✅ FAIRE** : Utiliser `.transform()` pour le **nettoyage** qui préserve le type

```typescript
import { capitalizeWords, lower, upper } from "@/zod-helpers/normalize";

export const insertSiteFormSchema = z.object({
  nom: z
    .string()
    .min(1, "Nom obligatoire")
    .transform((v) => capitalizeWords(v)), // ✅ string → string (nettoyage)

  email: z.email().transform((v) => lower(v)), // ✅ string → string (nettoyage)

  nomEntreprise: z.string().transform((v) => upper(v)), // ✅ string → string (nettoyage)

  // Champs optionnels : accepter "" SANS transformer
  description: z.string().optional(), // ✅ Accepte "" ou undefined
  assigneId: z.uuid().or(z.literal("")).optional(), // ✅ Accepte UUID, "", ou undefined
});
```

**❌ NE PAS FAIRE** : Transformer le type dans le schema (évite bugs React Hook Form)

```typescript
// ❌ FAUX - Transforme string → null (cause value={null} dans input)
description: z.string().optional().transform(v => v || null),

// ❌ FAUX - Transforme string → number (change le type)
surface: z.string().transform(v => Number(v)),
```

**Pourquoi ?** React Hook Form expect des strings pour les inputs. Si le schema transforme `""` en `null`, l'input reçoit `value={null}` ce qui cause des warnings React.

#### Niveau 2 : Action Serveur (normalisation avant DB)

**✅ FAIRE** : Utiliser `normalizeForSubmit()` pour transformer avant insertion DB

```typescript
import { normalizeForSubmit } from "@/zod-helpers/normalize";

export const insertSiteAction = actionClient.action(async ({ parsedInput }) => {
  // Normaliser AVANT insertion DB
  const normalized = normalizeForSubmit(parsedInput, {
    optionalNumbers: ["surface", "effectif"] as const, // string → number | null
    optionalStrings: ["description", "adresseLigne2"] as const, // "" → null
  });

  await db.insert(sites).values({
    nom: normalized.nom, // Déjà nettoyé (capitalizeWords) par schema
    description: normalized.description, // "" transformé en null
    surface: normalized.surface, // string "150" transformé en number 150
    // ...
  });
});
```

**Pattern pour champs UUID optionnels** :

```typescript
// Schema : accepte UUID ou ""
assigneEntrepriseId: z.uuid().or(z.literal("")).optional(),

// Action : transforme "" en null
const normalized = normalizeForSubmit(parsedInput, {
  optionalStrings: ["assigneEntrepriseId"] as const,
});
// Résultat : "" → null, UUID → UUID, undefined → null
```

#### Fonctions de nettoyage disponibles (`/zod-helpers/normalize.ts`)

```typescript
import {
  capitalizeWords, // "jean DUPONT" → "Jean Dupont"
  capitalizeFirstWord, // "bonjour monde" → "Bonjour monde"
  upper, // "acme corp" → "ACME CORP"
  lower, // "Email@EXAMPLE.COM" → "email@example.com"
  normalizeString, // Trim + collapse espaces multiples
} from "@/zod-helpers/normalize";
```

#### Résumé de la stratégie

| Où         | Quoi                                                   | Exemple                       |
| ---------- | ------------------------------------------------------ | ----------------------------- |
| **Schema** | Validation + Nettoyage (string → string)               | `.transform(capitalizeWords)` |
| **Action** | Normalisation de type (string → null, string → number) | `normalizeForSubmit()`        |

### 2. Schemas Zod

**Toujours créer 3 types de schemas**:

```typescript
// src/zod-schemas/sites.schema.ts

// 1. Schema SELECT (depuis DB)
export const selectSiteSchema = createSelectSchema(sites);
export type SelectSiteType = z.infer<typeof selectSiteSchema>;

// 2. Schema INSERT (création)
export const insertSiteFormSchema = z.object({
  nom: z.string().min(1),
  adresseLigne1: z.string().min(1),
  surface: z.string().min(1), // String dans le form, Number dans l'action
  // ...
});
export type InsertSiteFormType = z.infer<typeof insertSiteFormSchema>;

// 3. Schema UPDATE (modification)
export const updateSiteFormSchema = insertSiteFormSchema.extend({
  id: z.string(),
  surface: z.string().optional(), // Champs optionnels en update
});
export type UpdateSiteFormType = z.infer<typeof updateSiteFormSchema>;
```

**Conventions importantes**:

- Les champs `number` dans la DB sont souvent `string` dans les forms (pour les inputs)
- La conversion `Number()` se fait dans les Server Actions
- **JAMAIS de `.default()` dans les schemas Zod** : Cela crée des conflits de types avec React Hook Form (input vs output types). Gérer les defaults dans `defaultValues` du `useForm` à la place.

### 2. Server Actions

**Fichier**: `src/server/actions/[feature]Actions.ts`

```typescript
import { createSafeActionClient } from "@/lib/safe-action-client";
import { insertSiteFormSchema } from "@/zod-schemas/sites.schema";

const action = createSafeActionClient();

export const insertSiteAction = action
  .schema(
    insertSiteFormSchema.extend({
      entrepriseId: z.string(),
      parentId: z.string().nullable(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { currentUser } = ctx;

    // TOUJOURS utiliser des transactions pour les mutations multi-tables
    const insertedSite = await db.transaction(async (tx) => {
      // 1. INSERT principal
      const [site] = await tx
        .insert(sites)
        .values({
          nom: parsedInput.nom,
          surface: Number(parsedInput.surface), // Conversion ici
          entrepriseId: parsedInput.entrepriseId,
          createdById: currentUser.id,
          updatedById: currentUser.id,
        })
        .returning();

      // 2. INSERT relations (ex: closure table)
      await insertSiteArborescence({
        entrepriseId: parsedInput.entrepriseId,
        siteId: site.id,
        parentId: parsedInput.parentId,
        userId: currentUser.id,
        tx, // Passer la transaction
      });

      return site;
    });

    // 3. Valider le retour avec Zod
    const parsedSite = selectSiteSchema.parse(insertedSite);

    return { site: parsedSite };
  });
```

**Points Critiques**:

- ✅ **Transactions atomiques** pour toutes les mutations multi-tables
- ✅ **Validation Zod** des entrées ET sorties
- ✅ **Gestion des erreurs** via `createSafeActionClient`
- ✅ Passer `tx` aux fonctions utilitaires pour utiliser la même transaction
- ✅ Toujours inclure `createdById` et `updatedById`

### 3. Queries (Lecture Seule)

**Fichier**: `src/server/queries/[feature]Queries.ts`

```typescript
import "server-only";
import { db } from "@/db";
import { sites } from "@/db/schema/sites";
import { eq } from "drizzle-orm";

export async function getSitesByEntreprise(entrepriseId: string) {
  return await db
    .select()
    .from(sites)
    .where(eq(sites.entrepriseId, entrepriseId))
    .orderBy(sites.nom);
}
```

**Convention**:

- Toujours ajouter `import "server-only"` en haut
- Pas de logique métier complexe (utiliser `/utils/` pour ça)

### 4. Utilitaires Métier

**Fichier**: `src/server/utils/[feature].utils.ts`

```typescript
import "server-only";
import { db } from "@/db";

type DbOrTransaction =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function insertSiteArborescence({
  entrepriseId,
  siteId,
  parentId,
  userId,
  tx,
}: {
  entrepriseId: string;
  siteId: string;
  parentId: string | null;
  userId: string;
  tx?: DbOrTransaction; // Optionnel mais recommandé
}) {
  const dbClient = tx || db; // Utiliser tx si fourni

  // Logique métier complexe ici
  await dbClient.insert(sitesArborescence).values({
    // ...
  });
}
```

**Convention**:

- Accepter `tx?: DbOrTransaction` pour permettre l'usage dans des transactions
- Toujours utiliser `const dbClient = tx || db;`

### 5. React Hook Form (RHF) avec Zod

```typescript
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function SiteFormDialog({ mode, site }: Props) {
  const schema = mode === "create"
    ? insertSiteFormSchema
    : updateSiteFormSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: mode === "edit" && site
      ? {
          id: site.id,
          nom: site.nom,
          surface: String(site.surface),  // DB number → form string
          // ...
        }
      : {
          nom: "",
          surface: "",
          typeBatiment: "bureaux" as const,  // Type les defaults
          // ...
        },
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  const onSubmit = async (data: InsertSiteFormType | UpdateSiteFormType) => {
    if (mode === "create") {
      const createData = data as InsertSiteFormType;
      const result = await insertSiteAction({
        nom: createData.nom,
        surface: Number(createData.surface),  // Conversion form → DB
        // ...
      });

      // Gestion d'erreur next-safe-action
      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.site) {
        toast.success("Site créé avec succès");
        onSuccess(result.data.site);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <RhfInput<InsertSiteFormType | UpdateSiteFormType>
          name="nom"
          label="Nom du site"
          requiredMark
        />
        {/* ... */}
      </form>
    </Form>
  );
}
```

**Composants RHF Disponibles**:

- `RhfInput` - Input texte, number, email, etc.
- `RhfControlledSelect` - Select avec Radix UI (prend des `<SelectItem>` en children) — **toujours ajouter `selectClassName="w-full"`** pour que le trigger occupe toute la largeur disponible
- `RhfTextArea` - Textarea
- `RhfCheckbox` - Checkbox booléen
- `RhfDatePicker` - Sélecteur de date (stocke ISO `"YYYY-MM-DD"`, vide = `""`)
- `RhfSwitch`, `RhfRadioGroup`, `RhfOTP`, `RhfDateTimePicker`, etc.

**RÈGLE CRITIQUE — Toujours utiliser les composants RHF** :

**TOUJOURS** utiliser les composants RHF (`RhfInput`, `RhfControlledSelect`, `RhfTextArea`, etc.) dans les formulaires. Ne jamais utiliser les composants shadcn bruts (`Input`, `Select`, `Textarea`) directement dans un form RHF.

**Convention**:

- Typer les composants RHF: `RhfInput<FormType>`
- Utiliser `useFormState` pour `isSubmitting` et `isDirty`
- Désactiver submit si `isSubmitting || !isDirty`
- Reset le form dans un `useEffect` quand le dialog s'ouvre
- **Preview live** : utiliser `useWatch({ control: form.control })` — jamais `form.watch()` dans le render body

**Pattern useFieldArray (listes dynamiques)** :

```typescript
// 1. useFieldArray au niveau du composant parent
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "lignes",
});

// 2. Composant accordéon par item — accède au form via useFormContext
function LigneAccordion({ index }: { index: number }) {
  const { control, setValue } = useFormContext<FormType>();

  // useWatch pour lire les valeurs sans déclencher de re-render global
  const designation = useWatch({ control, name: `lignes.${index}.designation` as Path<FormType> });

  return (
    <>
      {/* Inputs texte : utiliser RhfInput avec cast Path<FormType> */}
      <RhfInput<FormType>
        name={`lignes.${index}.designation` as Path<FormType>}
        label="Titre"
      />

      {/* Selects dans array : RhfControlledSelect avec cast "as never" sur le name */}
      {/* RhfControlledSelect a une contrainte StringFieldPath — contournée avec "as never" */}
      <RhfControlledSelect<FormType>
        name={`lignes.${index}.tauxTva` as never}
        label="TVA"
      >
        {/* options */}
      </RhfControlledSelect>

      {/* setValue pour les booléens dans array */}
      <button onClick={() => setValue(`lignes.${index}.hasRemise` as Path<FormType>, true as never)}>
        Ajouter remise
      </button>
    </>
  );
}

// 3. Bouton ajout / suppression
<Button onClick={() => append({ ...DEFAULT_ITEM })}>Ajouter</Button>
<Button onClick={() => remove(index)}>Supprimer</Button>
```

**Type pour useWatch avec preview live** :

```typescript
// useWatch retourne DeepPartial (tous les champs optionnels y compris imbriqués)
// Définir un type PreviewValues permissif pour la fonction de construction du preview
type PreviewValues = {
  titre?: string;
  lignes?: Array<{
    designation?: string;
    prixUnitaireHtEur?: string /* ... */;
  }>;
  // ...
};

// Construire le preview depuis les valeurs watchées
const watchedValues = useWatch({ control: form.control });
const preview = buildPreview(emetteur, client, site, watchedValues);
```

### 6. Internationalisation (next-intl)

**RÈGLE CRITIQUE**:

```typescript
// ✅ TOUJOURS utiliser
import { Link, usePathname, useRouter } from "@/i18n/navigation";

// ❌ JAMAIS utiliser
import { usePathname } from "next/navigation"; // Retourne pathname avec locale!
import Link from "next/link"; // Ne gère pas l'i18n!
```

**Traductions**:

```typescript
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("DevisPage.locaux");

  return <h1>{t("title")}</h1>;
}
```

**Fichiers de traduction**: `/messages/[locale]/[namespace].json`

### 7. Composants Client vs Server

```typescript
// ✅ Server Component (par défaut)
export default async function SitesPage() {
  // Peut faire des queries directes
  const sites = await getSitesByEntreprise(entrepriseId);

  return <SitesClient initialSites={sites} />;
}

// ✅ Client Component (avec "use client")
"use client";

export function SitesClient({ initialSites }) {
  const [sites, setSites] = useState(initialSites);
  // Logique interactive ici
}
```

**Convention**:

- Pages = Server Components qui font les queries initiales
- Composants interactifs = Client Components (`"use client"`)
- Passer les données via props du Server au Client

### 8. Filtrage et Tri Côté Serveur avec URL Sync

**PATTERN CRITIQUE** : Quand on implémente du filtrage/tri/pagination côté serveur avec Next.js, il faut TOUJOURS inclure TOUS les paramètres dans la chaîne complète.

**Checklist OBLIGATOIRE** (ne jamais oublier) :

#### ✅ 1. Définir SearchParams COMPLET dans page.tsx

```typescript
// ❌ FAUX - Paramètres manquants
type SearchParams = {
  search?: string;
  statut?: string;
};

// ✅ CORRECT - TOUS les paramètres (filtres + tri + pagination)
type SearchParams = {
  // Filtres
  search?: string;
  statut?: string;
  priorite?: string;
  type?: string;
  siteId?: string;
  demandeurEntrepriseId?: string;
  assigneEntrepriseId?: string;

  // Tri (NE PAS OUBLIER!)
  orderBy?: string;
  orderDir?: string;

  // Pagination (si applicable)
  page?: string;
  pageSize?: string;
};
```

#### ✅ 2. Dupliquer SearchParams dans le composant client

```typescript
// Dans TicketsTable.tsx - MÊME type que page.tsx
type SearchParams = {
  search?: string;
  statut?: string;
  priorite?: string;
  type?: string;
  siteId?: string;
  demandeurEntrepriseId?: string;
  assigneEntrepriseId?: string;
  orderBy?: string; // ⚠️ NE PAS OUBLIER
  orderDir?: string; // ⚠️ NE PAS OUBLIER
};
```

#### ✅ 3. Créer helpers type-safe pour conversion

```typescript
// Helper pour enums génériques
function toEnumOrUndefined<T extends string>(
  value: string | undefined,
): T | undefined {
  return value && value !== "" ? (value as T) : undefined;
}

// Helper pour orderBy avec validation
function toOrderBy(
  value: string | undefined,
): "createdAt" | "lastActivityAt" | "priorite" | "statut" | undefined {
  const validValues = ["createdAt", "lastActivityAt", "priorite", "statut"];
  return value && validValues.includes(value)
    ? (value as "createdAt" | "lastActivityAt" | "priorite" | "statut")
    : undefined;
}

// Helper pour orderDir
function toOrderDir(value: string | undefined): "asc" | "desc" | undefined {
  return value === "asc" || value === "desc" ? value : undefined;
}
```

#### ✅ 4. Passer TOUS les paramètres à l'action serveur

```typescript
const result = await getTicketsAction({
  entrepriseId: entreprise.id,

  // Filtres
  search: searchParams.search || undefined,
  statut: toEnumOrUndefined<TicketStatutType>(searchParams.statut),
  priorite: toEnumOrUndefined<TicketPrioriteType>(searchParams.priorite),
  type: toEnumOrUndefined<TicketTypeType>(searchParams.type),
  siteId: searchParams.siteId || undefined,
  demandeurEntrepriseId: searchParams.demandeurEntrepriseId || undefined,
  assigneEntrepriseId: searchParams.assigneEntrepriseId || undefined,

  // Tri (⚠️ NE PAS OUBLIER)
  orderBy: toOrderBy(searchParams.orderBy),
  orderDir: toOrderDir(searchParams.orderDir),

  // Pagination
  page: 1,
  pageSize,
});
```

#### ✅ 5. Ajouter TOUS les paramètres comme dépendances useEffect

```typescript
useEffect(() => {
  if (!entreprise?.id) return;
  loadTickets();
}, [
  entreprise?.id,

  // Filtres
  searchParams.search,
  searchParams.statut,
  searchParams.priorite,
  searchParams.type,
  searchParams.siteId,
  searchParams.demandeurEntrepriseId,
  searchParams.assigneEntrepriseId,

  // Tri (⚠️ NE PAS OUBLIER)
  searchParams.orderBy,
  searchParams.orderDir,
]);
```

#### ✅ 6. Inclure dans useCallback dependencies

```typescript
const loadTickets = useCallback(async () => {
  // ... logique
}, [
  entreprise?.id,
  searchParams.search,
  searchParams.statut,
  searchParams.priorite,
  searchParams.type,
  searchParams.siteId,
  searchParams.demandeurEntrepriseId,
  searchParams.assigneEntrepriseId,
  searchParams.orderBy, // ⚠️ NE PAS OUBLIER
  searchParams.orderDir, // ⚠️ NE PAS OUBLIER
  pageSize,
]);
```

#### ✅ 7. Passer aussi dans loadMore (infinite scroll)

```typescript
const loadMore = useCallback(
  async () => {
    const result = await getTicketsAction({
      entrepriseId: entreprise.id,
      // ... tous les filtres
      orderBy: toOrderBy(searchParams.orderBy), // ⚠️ NE PAS OUBLIER
      orderDir: toOrderDir(searchParams.orderDir), // ⚠️ NE PAS OUBLIER
      page: nextPage,
      pageSize,
    });
  },
  [
    /* ... toutes les dépendances incluant orderBy/orderDir */
  ],
);
```

#### ✅ 8. CRITIQUE : Utiliser l'OBJET searchParams dans useEffect (pas les propriétés individuelles)

**BUG RÉEL** : La page reste bloquée en chargement lors de la navigation client-side.

```typescript
// ❌ FAUX - Les propriétés individuelles (toutes undefined) ne changent pas de référence
// → useEffect ne se re-déclenche PAS lors de la navigation client-side
useEffect(() => {
  loadInitialData();
}, [
  entreprise?.id,
  searchParams.search, // undefined === undefined → pas de changement
  searchParams.statut, // undefined === undefined → pas de changement
  searchParams.orderBy, // undefined === undefined → pas de changement
  // ...
]);

// ✅ CORRECT - L'objet searchParams est une NOUVELLE RÉFÉRENCE à chaque navigation
// → useEffect se re-déclenche correctement
useEffect(() => {
  loadInitialData();
}, [entreprise?.id, posture, searchParams]);
```

**Explication** : Quand le parent (page.tsx) re-render lors d'une navigation client-side, il passe un NOUVEL objet `searchParams`. Avec les propriétés individuelles (toutes `undefined`), React ne détecte aucun changement (`undefined === undefined`). Avec l'objet entier, la nouvelle référence déclenche le useEffect.

**SYMPTÔMES d'oubli** :

- ❌ L'URL change mais les données ne se rechargent pas
- ❌ Le tri visuel ne change pas malgré le clic sur SortableHeader
- ❌ Les filtres fonctionnent mais pas le tri (ou vice-versa)
- ❌ La page reste bloquée en chargement (spinner infini) lors de la navigation client-side

**CAUSE** : Paramètres manquants dans SearchParams, useEffect, ou action call. Ou bien propriétés individuelles au lieu de l'objet `searchParams` dans les dépendances useEffect.

**SOLUTION** : Vérifier la checklist complète ci-dessus point par point. Pour le useEffect principal (loadInitialData), utiliser `searchParams` en tant qu'objet.

**Référence d'implémentation** : `/app/tickets` (implémentation complète)

---

## Patterns Spécifiques au Projet

### 1. Système de Posture (Multi-Rôles)

```typescript
import { useAppStore } from "@/stores/application/appStore";

function MyComponent() {
  const posture = useAppStore((state) => state.postureActive);
  const entreprise = useAppStore((state) => state.entreprise);

  // Afficher UI différente selon posture
  if (posture === "client") {
    // Vue client
  } else if (posture === "prestataire") {
    // Vue prestataire
  }
}
```

#### `postureActive` côté Frontend — Règle d'or

**✅ Autorisé** : Lire `postureActive` depuis le store (`useAppStore`) pour la **logique d'affichage conditionnel** (boutons visibles/masqués, labels, calcul de permissions UI, etc.).

```typescript
// ✅ CORRECT — lecture côté client pour affichage
const postureActive = useAppStore((s) => s.postureActive);
const activeRole =
  postureActive === "plateforme"
    ? rolePlateformeAdhesion
    : postureActive === "prestataire"
      ? rolePrestataireAdhesion
      : roleClientAdhesion;
const canEdit =
  postureActive === "plateforme" ? activeRole !== null : activeRole === "admin";
```

**❌ Interdit** : Envoyer la posture depuis le client vers une server action **et s'y fier côté serveur**.

```typescript
// ❌ FAUX — la posture vient du client, elle est falsifiable
export const myAction = action
  .schema(
    z.object({
      posture: z.string(), // ← NE JAMAIS FAIRE CONFIANCE À ÇA
    }),
  )
  .action(async ({ parsedInput }) => {
    if (parsedInput.posture === "plateforme") {
      /* bypass ← FAILLE */
    }
  });

// ✅ CORRECT — le backend lit TOUJOURS le cookie
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
const platformRole = await getEffectivePlateformeRole(userId); // lit le cookie httpOnly
```

**Pourquoi ?** Le store Zustand est côté client et modifiable par l'utilisateur. Le cookie `fm4all:postureActive` est httpOnly (inaccessible en JS) et mis à jour uniquement via `setActivePostureAction`.

#### Cookie de Posture (Serveur)

Le cookie `fm4all:postureActive` (httpOnly, sameSite: lax, 180 jours) est la **source de vérité côté serveur** pour la posture active. Il est mis à jour via `setActivePostureAction` (`src/server/actions/activePostureAction.ts`).

**Valeurs** : `"client"` | `"prestataire"` | `"plateforme"`

**Règle** : Cookie absent ou valeur inconnue = **pas de bypass plateforme** (comportement le plus sûr par défaut).

#### Distinction CRITIQUE : getEffectivePlateformeRole() vs getUserPlateformeAdhesion()

Un utilisateur FM4ALL peut avoir simultanément un `rolePlateformeAdhesion` ET un `roleClientAdhesion` ou `rolePrestataireAdhesion`. Si cet utilisateur bascule en posture `"client"` ou `"prestataire"`, son rôle plateforme **ne doit PAS** override ses permissions dans cette posture.

| Fonction                             | Où l'utiliser                 | Comportement                                                                      |
| ------------------------------------ | ----------------------------- | --------------------------------------------------------------------------------- |
| `getUserPlateformeAdhesion(userId)`  | **Guards `page.tsx`**         | Vérifie uniquement si l'user A le rôle en base — indépendant de la posture active |
| `getEffectivePlateformeRole(userId)` | **Server actions** (bypasses) | Vérifie le rôle en base **ET** que la posture cookie = `"plateforme"`             |

```typescript
// ✅ Dans page.tsx — "Est-ce que cet user a le rôle plateforme ?"
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
const platformRole = await getUserPlateformeAdhesion(currentUser.id);
if (!platformRole?.role) redirect({ href: "/auth/unauthorized", locale: "fr" });

// ✅ Dans server actions — "Est-ce que cet user agit EN TANT QUE plateforme maintenant ?"
import { getEffectivePlateformeRole } from "@/server/utils/permissions.utils";
const platformRole = await getEffectivePlateformeRole(userId);
if (platformRole?.role) return true; // bypass SEULEMENT si posture cookie = "plateforme"
```

**Fichier** : `src/server/utils/permissions.utils.ts`

**Règle clé** : `if (posture !== "plateforme") return null` — PAS `if (posture && posture !== "plateforme")` :

- Cookie absent → `posture = undefined` → `undefined !== "plateforme"` → `return null` ✅
- Cookie = `"client"` → `return null` ✅
- Cookie = `"plateforme"` → vérifie le rôle en base ✅

#### Centralisation de hasAccessToEntreprise

`hasAccessToEntreprise(userId, entrepriseId)` est définie dans `src/server/queries/userAdhesions.query.ts` et utilise `getEffectivePlateformeRole` pour le bypass. **Ne jamais créer de copies locales** dans les fichiers d'actions — importer directement depuis le fichier de queries.

### 2. Closure Table pour Hiérarchies

Le projet utilise une **closure table** pour gérer les hiérarchies de sites:

```typescript
// Table sites_arborescence
{
  ancetreId: string; // ID de l'ancêtre
  descendantId: string; // ID du descendant
  profondeur: number; // Distance (0 = lui-même, 1 = enfant direct)
}
```

**Algorithme INSERT**:

1. Ligne réflexive (site → site, profondeur 0)
2. Copier tous les ancêtres du parent avec profondeur+1

**Algorithme DELETE**:

1. Vérifier si le site a des enfants (profondeur = 1)
2. Si oui, rejeter avec erreur
3. Supprimer toutes les lignes où `descendantId = siteId`

Voir: `src/server/utils/sitesArborescence.utils.ts`

### 3. Gestion d'État avec Zustand

```typescript
// src/stores/application/appStore.ts
import { create } from "zustand";

export const useAppStore = create<AppState>((set) => ({
  entreprise: null,
  postureActive: null,
  setEntreprise: (entreprise) => set({ entreprise }),
  setPostureActive: (posture) => set({ postureActive: posture }),
}));
```

### 4. Gestion d'État avec Zustand - Synchronisation appStore

**Principe CRITIQUE**: Ne PAS re-bootstrapper après mutations, juste mettre à jour le slice concerné

```typescript
// src/stores/application/appStore.ts
export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  entreprise: null,
  postureActive: null,

  // Bootstrap = SEULEMENT au login ou refresh page
  hydrate: (payload) => set({ ...payload }),

  // Update = Après mutations qui changent les données
  updateUser: (user) => set({ user }),

  setPostureActive: (posture) => set({ postureActive: posture }),
  reset: () => set({ user: null, entreprise: null, postureActive: null }),
}));
```

**Pattern: Synchroniser le Store Après Mutation**

```typescript
// Dans un formulaire qui modifie le user
const onSubmit = async (data: UpdateUserFormType) => {
  const result = await updateUserAction(data);

  if (result?.serverError) {
    toast.error(result.serverError.message);
    return;
  }

  // ✅ CORRECT - Le serveur renvoie les données mises à jour
  if (isEditingSelf && result?.data?.user) {
    useAppStore.getState().updateUser({
      id: result.data.user.id,
      prenom: result.data.user.prenom,
      nom: result.data.user.nom,
      email: result.data.user.email,
      avatarId: result.data.user.avatarId,
    });
  }

  toast.success("Profil mis à jour");
};
```

**Quand synchroniser**:

- ✅ Après mutation qui change `user` (nom, avatar, email)
- ✅ Après mutation qui change `entreprise`
- ✅ Après changement de posture
- ❌ NE PAS appeler `hydrate()` (réservé au bootstrap initial)

**Résultat**: Les composants consommant le store (SidebarFooter, UserSidebarHeader, etc.) se mettent à jour automatiquement sans F5

### 5. Sécurité & Permissions

**RÈGLE CRITIQUE**: Toujours valider que le `currentUser` a accès à l'`entrepriseId` avant de retourner des données

### Guard Server-Side pour Pages Réservées Posture Plateforme

**TOUJOURS** ajouter ce guard dans les `page.tsx` plateforme-only (`/app/entreprises`, `/app/services`, etc.) :

```typescript
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";

export default async function MyPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }

  // ⚠️ session! obligatoire : redirect() ne narrowe PAS TypeScript
  const currentUser = session!.user;
  const platformRole = await getUserPlateformeAdhesion(currentUser.id);
  if (!platformRole?.role) {
    // ⚠️ redirect href n'accepte PAS de query string (?type=...) — typage strict next-intl
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  // Page normale ici
}
```

**Pages concernées** : `/app/entreprises/page.tsx`, `/app/entreprises/[id]/page.tsx`, `/app/services/page.tsx`, `/app/sites-clients/page.tsx`

### Guard Server-Side pour Pages Réservées à une Posture (Client / Prestataire)

Pour les pages accessibles uniquement en posture client ou prestataire :

```typescript
// Page client-only (ex: /app/mes-prestataires)
import { db } from "@/db";
import { userClientAdhesions } from "@/db/schema/users";
import { and, eq } from "drizzle-orm";

const clientAdhesion = await db.query.userClientAdhesions.findFirst({
  where: and(
    eq(userClientAdhesions.userId, currentUser.id),
    eq(userClientAdhesions.statut, "actif"),
  ),
});
if (!clientAdhesion) redirect({ href: "/auth/unauthorized", locale: "fr" });

// Page prestataire-only (ex: /app/mes-sites-clients, /app/mes-clients)
import { userPrestataireAdhesions } from "@/db/schema/users";

const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst({
  where: and(
    eq(userPrestataireAdhesions.userId, currentUser.id),
    eq(userPrestataireAdhesions.statut, "actif"),
  ),
});
if (!prestataireAdhesion)
  redirect({ href: "/auth/unauthorized", locale: "fr" });
```

**Pages concernées** :

- Client uniquement : `/app/mes-prestataires/page.tsx`
- Prestataire uniquement : `/app/mes-sites-clients/page.tsx`, `/app/mes-clients/page.tsx`

**Note** : Les pages partagées entre postures (`/app/sites`, `/app/utilisateurs`, `/app/tickets`, etc.) n'ont pas besoin de guard posture — les actions serveur scopent les données par entreprise.

### Check Permission dans Server Actions

```typescript
// Pattern: Check permission dans Server Actions
export const getUsersAction = action
  .schema(getUsersSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { currentUser } = ctx;

    // ✅ TOUJOURS vérifier l'accès via getUserAdhesion
    const { getUserAdhesion } = await import(
      "@/server/queries/userAdhesions.query"
    );
    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    // Maintenant on peut retourner les données
    const users = await getUsersByEntreprise({
      entrepriseId: parsedInput.entrepriseId,
    });

    return { users };
  });
```

**Système de Permissions**:

**Rôles Plateforme** (cross-entreprise, FM4ALL uniquement):

- `super_admin_plateforme` - Accès total, administration globale (niveau 4)
- `operateur_plateforme` - Opérations plateforme

**Rôles d'Entreprise** (au sein d'une entreprise):

- `admin` - Gestion entreprise (niveau 3)
- `manager` - Gestion équipe (niveau 2)
- `collaborateur` - Accès lecture (niveau 1)

**Hiérarchie**: super_admin_plateforme (4) > admin (3) > manager (2) > collaborateur (1)

### Séparation Rôles Plateforme vs Entreprise

Un utilisateur FM4ALL peut avoir DEUX rôles simultanément :

1. **`roleAdhesion`** (table `user_adhesions`) - Rôle dans une entreprise
   - Exemple : `admin` dans l'entreprise FM4ALL en tant que client

2. **`rolePlateformeAdhesion`** (table `user_plateforme_adhesions`) - Rôle plateforme global
   - Exemple : `super_admin_plateforme` pour administration cross-entreprise

**Pattern dans le code** :

```typescript
// Frontend
const currentUserRole = useAppStore((state) => state.roleAdhesion);
const currentUserPlateformeRole = useAppStore((state) => state.rolePlateformeAdhesion);

// Check combiné
const canEdit =
  currentUserPlateformeRole === "super_admin_plateforme" ||
  currentUserRole === "admin";

// Backend
const platformRole = await getUserPlateformeAdhesion(currentUser.id);
if (platformRole?.role === "super_admin_plateforme") { ... }
```

### 6. Validation de Mot de Passe avec Indicateur Visuel

**Pattern**: Validation forte + feedback visuel en temps réel

```typescript
// 1. Schema Zod avec regex complexe
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        passwordRegex,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial",
      ),
    passwordConfirmation: z.string().min(1, "..."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  });

// 2. Composant PasswordStrengthIndicator
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";

function ResetPasswordForm() {
  const form = useForm<ResetPasswordType>({ ... });
  const passwordValue = form.watch("password");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-3">
          <InputWithLabel<ResetPasswordType>
            fieldTitle="Nouveau mot de passe*"
            nameInSchema="password"
            type="password"
          />
          {/* ✅ Indicateur visuel sous le champ */}
          <PasswordStrengthIndicator password={passwordValue} />
        </div>
        {/* ... */}
      </form>
    </Form>
  );
}
```

**Critères de Validation**:

- ✓ Au moins 8 caractères
- ✓ Une majuscule (A-Z)
- ✓ Une minuscule (a-z)
- ✓ Un chiffre (0-9)
- ✓ Un caractère spécial (!@#$%^&\*(),.?":{}|<>)

**Composant**: Affiche barre de progression (rouge → jaune → vert) + checklist des critères

### 7. Configuration Email

**RÈGLE**: Ne JAMAIS hardcoder d'adresses email dans le code

```typescript
// ❌ FAUX
const base = {
  from: `fm4all <noreply@mg.fm4all.com>`,
  to: [to],
  bcc: ["viroun@fm4all.com"], // ❌ Hardcodé!
  subject,
};

// ✅ CORRECT
const bccEmail = process.env.MAILGUN_BCC_EMAIL;

const base = {
  from: `fm4all: Le Facility Management pour tous <noreply@mg.fm4all.com>`,
  to: [to],
  ...(bccEmail ? { bcc: [bccEmail] } : {}), // ✅ Optionnel depuis env
  subject,
};
```

**Variables d'environnement**:

- `MAILGUN_API_KEY` - Clé API Mailgun (requis)
- `MAILGUN_BCC_EMAIL` - Email BCC optionnel pour debug/copie

**Fichier**: `src/server/email/mailgunDirect.ts`

### 8. Toasts avec Sonner

```typescript
import { toast } from "sonner";

// Succès
toast.success("Opération réussie");

// Erreur
toast.error("Une erreur est survenue");

// Info
toast.info("Information importante");
```

---

## Patterns Critiques (NE PAS OUBLIER)

### ✅ Pattern 1: normalizeForSubmit pour les champs optionnels

**RÈGLE CRITIQUE**: Pour tous les champs optionnels (nullable en DB), utiliser `normalizeForSubmit` côté serveur pour convertir `""` → `null`.

**❌ Mauvaise approche** (ancienne, à éviter):

```typescript
// Schema avec .nullable()
assigneEntrepriseId: z.uuid().nullable();

// Conversion manuelle côté client
const newId = value === "none" ? null : value;
```

**✅ Bonne approche** (pattern standard du projet):

1. **Schema Zod** - Accepte `string` (pas `.uuid().nullable()`):

```typescript
// src/zod-schemas/[feature].schema.ts
export const updateSchema = z.object({
  ticketId: z.uuid(),
  assigneEntrepriseId: z.string(), // ✅ Accepte "" ou UUID
});
```

2. **Action serveur** - Utilise `normalizeForSubmit` après validation:

```typescript
// src/server/actions/[feature]Actions.ts
import { normalizeForSubmit } from "@/zod-helpers/normalize";

export const updateAction = actionClient
  .inputSchema(updateSchema)
  .action(async ({ parsedInput }) => {
    // ✅ Normaliser: "" → null
    const normalized = normalizeForSubmit(parsedInput, {
      optionalStrings: ["assigneEntrepriseId"] as const,
    });

    // Utiliser normalized au lieu de parsedInput
    await db.update(table).set({
      assigneEntrepriseId: normalized.assigneEntrepriseId, // null si ""
    });
  });
```

3. **Composant client** - Utilise `""` pour "non sélectionné":

```typescript
// Composants avec Select
<Select
  value={currentValue || "none"} // ✅ "none" comme sentinel (jamais "")
  onValueChange={handleChange}
>
  <SelectTrigger>
    <SelectValue placeholder="Choisir..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="none"> {/* ✅ JAMAIS value="" — Radix réserve "" pour le placeholder */}
      <span className="italic text-muted-foreground">Non assigné</span>
    </SelectItem>
    {/* ... autres options */}
  </SelectContent>
</Select>

// Dans handleChange - Convertir "none" → "" avant d'envoyer
const handleChange = async (value: string) => {
  const normalized = value === "none" ? "" : value;
  // ✅ normalizeForSubmit côté serveur convertira "" → null
  await updateAction({
    assigneEntrepriseId: normalized
  });
};
```

**Référence**: Voir `/app/sites` et `/app/utilisateurs` pour des exemples complets.

---

### ✅ Pattern 2: Vérification systématique des permissions

**RÈGLE CRITIQUE**: TOUJOURS vérifier les permissions AVANT d'afficher les boutons/composants d'édition.

**Pattern**: Le composant éditable ne vérifie PAS les permissions. C'est le **parent** qui décide de l'afficher ou non.

**✅ Exemple correct**:

```typescript
// Composant éditable (EditableField.tsx) - "dumb", suppose permissions OK
export function EditableField({ value, onUpdate }: Props) {
  // Pas de vérification de permissions ici
  return <Select value={value} onValueChange={handleChange} />;
}

// Parent (DetailsClient.tsx) - Rendu conditionnel selon permissions
{permissions.canEditField ? (
  <EditableField
    value={data.field}
    onUpdate={handleUpdate}
  />
) : (
  <p>{data.field || "Non renseigné"}</p>
)}
```

**Calcul des permissions**: Se fait **côté serveur** dans la page:

```typescript
// app/[feature]/[id]/page.tsx (Server Component)
export default async function DetailsPage({ params }) {
  const canEditField = await canUserEditField({
    userId: currentUser.id,
    resourceId: params.id,
    entrepriseId,
  });

  return (
    <DetailsClient
      permissions={{ canEditField }}
      // ...
    />
  );
}
```

**Référence**: Voir `/app/tickets/[ticketId]` - Tous les composants éditables suivent ce pattern.

---

### ✅ Pattern 3: Vérification TypeScript systématique

**RÈGLE CRITIQUE**: TOUJOURS vérifier les erreurs TypeScript AVANT de committer ou de considérer une tâche terminée.

**Commande à exécuter**:

```bash
pnpm tsc --noEmit
```

**Points de vigilance**:

- ❌ **JAMAIS** utiliser `any` - Toujours typer correctement
- ❌ **JAMAIS** utiliser `@ts-ignore` ou `@ts-expect-error` sans justification
- ✅ Résoudre TOUTES les erreurs TypeScript avant de passer à la suite
- ✅ Si un type n'existe pas, le créer (ne pas utiliser `any`)

**Exemple d'erreur fréquente**:

```typescript
// ❌ FAUX
const users = await getUsers();
availableUsers = users.map((u: any) => ({ ... })); // any interdit!

// ✅ CORRECT
const users = await getUsersByEntrepriseId(entrepriseId);
availableUsers = users.map((u) => ({ // Type inféré automatiquement
  id: u.id,
  prenom: u.prenom,
  nom: u.nom,
}));
```

**Workflow recommandé**:

1. Écrire le code
2. Vérifier TypeScript: `pnpm tsc --noEmit`
3. Corriger TOUTES les erreurs
4. Commit

---

## Erreurs Courantes à Éviter

### ❌ N'utilisez PAS `next/navigation` pour le routing

```typescript
// ❌ FAUX - pathname inclut la locale (/fr/app/sites)
import { usePathname } from "next/navigation";

// ✅ CORRECT - pathname sans locale (/app/sites)
import { usePathname } from "@/i18n/navigation";
```

### ❌ N'oubliez PAS les transactions pour les mutations multi-tables

```typescript
// ❌ FAUX - Risque d'inconsistance
const site = await db.insert(sites).values(...).returning();
await db.insert(sitesArborescence).values(...);  // Peut échouer!

// ✅ CORRECT - Atomique
const site = await db.transaction(async (tx) => {
  const [s] = await tx.insert(sites).values(...).returning();
  await tx.insert(sitesArborescence).values(...);
  return s;
});
```

### ❌ Ne confondez PAS les types form/DB pour les numbers

```typescript
// ❌ FAUX
const schema = z.object({
  surface: z.number(),  // Form input retourne string!
});

// ✅ CORRECT
const schema = z.object({
  surface: z.string(),  // String dans le form
});

// Puis dans l'action
surface: Number(parsedInput.surface),  // Conversion
```

### ❌ N'oubliez PAS de passer `tx` aux utilitaires

```typescript
// ❌ FAUX - Crée une nouvelle transaction
await db.transaction(async (tx) => {
  await tx.insert(sites).values(...);
  await insertSiteArborescence({ ... });  // Pas la même transaction!
});

// ✅ CORRECT
await db.transaction(async (tx) => {
  await tx.insert(sites).values(...);
  await insertSiteArborescence({ ..., tx });  // Même transaction
});
```

### ❌ N'oubliez PAS de vérifier les permissions

```typescript
// ❌ FAUX - Retourne des données sans vérifier l'accès
export const getUsersAction = action
  .schema(getUsersSchema)
  .action(async ({ parsedInput }) => {
    const users = await getUsersByEntreprise({
      entrepriseId: parsedInput.entrepriseId,
    });
    return { users }; // ❌ Bypass de sécurité!
  });

// ✅ CORRECT - Vérifie que currentUser a accès à entrepriseId
export const getUsersAction = action
  .schema(getUsersSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { currentUser } = ctx;

    const adhesion = await getUserAdhesion({
      userId: currentUser.id,
      entrepriseId: parsedInput.entrepriseId,
    });

    if (!adhesion) {
      throw errors.forbidden("Vous n'avez pas accès à cette entreprise.");
    }

    const users = await getUsersByEntreprise({
      entrepriseId: parsedInput.entrepriseId,
    });
    return { users };
  });
```

### ❌ Ne PAS re-bootstrapper le store après mutations

```typescript
// ❌ FAUX - Bootstrap est réservé au login/refresh page
const onSubmit = async (data) => {
  await updateUserAction(data);
  await bootstrap(); // ❌ Trop lourd, pas nécessaire!
};

// ✅ CORRECT - Update juste le slice concerné avec les données serveur
const onSubmit = async (data) => {
  const result = await updateUserAction(data);

  if (result?.data?.user) {
    useAppStore.getState().updateUser({
      id: result.data.user.id,
      prenom: result.data.user.prenom,
      nom: result.data.user.nom,
      email: result.data.user.email,
      avatarId: result.data.user.avatarId,
    });
  }
};
```

### ❌ Ne PAS hardcoder d'emails ou de secrets

```typescript
// ❌ FAUX
const bccEmail = "viroun@fm4all.com";

// ✅ CORRECT
const bccEmail = process.env.MAILGUN_BCC_EMAIL;
```

### ❌ Aligner validation et messages d'erreur

```typescript
// ❌ FAUX - Validation ne correspond pas au message
surface: z.string().refine(
  (v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 1000000,
  "La surface doit être un nombre compris entre 50 et 3000 m²",
),

// ✅ CORRECT - Validation = message
surface: z.string().refine(
  (v) => !isNaN(Number(v)) && Number(v) >= 50 && Number(v) <= 3000,
  "La surface doit être un nombre compris entre 50 et 3000 m²",
),
```

### ❌ N'oubliez PAS les paramètres de tri (orderBy/orderDir)

**ERREUR FRÉQUENTE** : Implémenter le filtrage mais oublier le tri

```typescript
// ❌ FAUX - SearchParams incomplet
type SearchParams = {
  search?: string;
  statut?: string;
  // ❌ Manque orderBy et orderDir!
};

// Symptôme : L'URL change mais l'ordre visuel ne change pas

// ✅ CORRECT - SearchParams COMPLET
type SearchParams = {
  // Filtres
  search?: string;
  statut?: string;
  priorite?: string;
  // ...

  // Tri (TOUJOURS inclure)
  orderBy?: string;
  orderDir?: string;
};

// ET les passer partout :
// 1. Dans getAction()
// 2. Dans useEffect dependencies
// 3. Dans useCallback dependencies
// 4. Dans loadMore()
```

**Solution** : Voir la checklist complète dans "### 8. Filtrage et Tri Côté Serveur"

### ❌ N'utilisez PAS les propriétés individuelles de searchParams dans useEffect

```typescript
// ❌ FAUX - Navigation client-side ne déclenche pas le useEffect
// Car les propriétés individuelles (undefined) ne changent pas
useEffect(() => {
  loadInitialData();
}, [entreprise?.id, searchParams.search, searchParams.statut, ...]);

// ✅ CORRECT - L'objet searchParams est une nouvelle référence à chaque navigation
useEffect(() => {
  loadInitialData();
}, [entreprise?.id, posture, searchParams]);
```

**Symptôme** : Page bloquée en chargement lors de la navigation client-side (fonctionne au refresh)

### ❌ JAMAIS construire un objet intermédiaire avec des propriétés `undefined` pour router.replace

**BUG RÉEL** : Les valeurs `undefined` spreads dans un objet query `router.replace` sont sérialisées en la **string `"undefined"`** dans l'URL par next-intl. Ce string passe ensuite les gardes `if (value)` (truthy !) et atteint la DB.

```typescript
// ❌ FAUX — sortSearchParams avec des propriétés undefined explicites
const sortSearchParams = {
  statut: searchParams.statut, // peut être undefined
  serviceId: searchParams.serviceId, // ❌ undefined → spreade comme clé explicite
  search: searchParams.search, // ❌ undefined → spreade comme clé explicite
};
router.replace({ query: { ...sortSearchParams, orderBy } });
// → URL finale : ?serviceId=undefined&search=undefined  ← CORROMPU

// ✅ CORRECT — Passer searchParams directement (comme dans /app/tickets)
// Les clés absentes de l'URL ne sont simplement pas présentes dans l'objet
router.replace({ query: { ...searchParams, orderBy } });
```

**Règle** : Pour les dialogs de tri, **toujours** passer `searchParams` directement depuis les props (comme `/app/tickets` le fait), sans construire d'objet intermédiaire. Si un cast TypeScript est nécessaire, utiliser `searchParams as Record<string, string | undefined>`.

**Symptôme** : Erreur Drizzle `invalid input syntax for type uuid: "undefined"` — la string `"undefined"` est passée à une colonne UUID.

---

## Checklist pour Nouvelle Feature

### Phase 1 - Schémas & Types

- [ ] Créer le schéma Drizzle dans `/db/schema/`
- [ ] Créer les schemas Zod (select, insert, update) dans `/zod-schemas/`
- [ ] Vérifier que validation = messages d'erreur (ranges, formats)

### Phase 2 - Backend

- [ ] Créer les queries dans `/server/queries/` avec `import "server-only"`
- [ ] Créer les actions dans `/server/actions/`
- [ ] **CRITIQUE**: Ajouter checks de permissions avec `getUserAdhesion` dans actions
- [ ] Créer les utilitaires si besoin dans `/server/utils/`
- [ ] Utiliser `db.transaction()` pour mutations multi-tables
- [ ] Passer `tx` aux fonctions utilitaires

### Phase 3 - Frontend

- [ ] Créer la page serveur dans `/app/[locale]/.../page.tsx`
- [ ] Créer le composant client principal `[Feature]Client.tsx`
- [ ] Créer les dialogs/formulaires avec RHF + Zod
- [ ] Utiliser les composants RHF typés (`RhfInput<FormType>`)
- [ ] Gérer les erreurs avec `next-safe-action`
- [ ] **IMPORTANT**: Synchroniser appStore après mutations si nécessaire

### Phase 4 - i18n & Tests

- [ ] Ajouter les traductions dans `/messages/`
- [ ] Utiliser `@/i18n/navigation` (PAS `next/navigation`)
- [ ] Tester en local
- [ ] Vérifier que les permissions sont bien enforced

### Phase 5 - Sécurité & Qualité

- [ ] Supprimer tous les `console.log`
- [ ] Pas d'emails ou secrets hardcodés (utiliser `.env`)
- [ ] Vérifier transactions atomiques
- [ ] Code review patterns vs `/app/sites` référence

---

## Structure de Navigation

```typescript
// Sidebar multi-rôles
const NAV: Record<RoleEntrepriseType, NavSection[]> = {
  client: [...],
  prestataire: [...],
  plateforme: [...],
};
```

Voir: `src/app/[locale]/(main)/(application)/(portail)/app/UserNavItems.tsx`

---

## Patterns Site-Vitrine (Sanity + next-intl + SEO)

### 1. Sanity — Fetch de contenu dans une page

**Toujours utiliser le client Sanity direct** (pas `sanityFetch`/`SanityLive` — le live content n'est pas activé) :

```typescript
import { getService } from "@/sanity/queries";
import { setRequestLocale } from "next-intl/server";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string; locale: LocaleType }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale); // ✅ TOUJOURS appeler setRequestLocale

  const service = await getService(slug); // ← client Sanity standard
  if (!service) notFound();
  // ...
}
```

**Ne PAS utiliser** `SanityLive` ou `sanityFetch` (définis dans `live.ts` mais non activés sur le site).

### 2. Sanity — generateStaticParams obligatoire pour les pages dynamiques

```typescript
// Générer les params POUR LES DEUX LOCALES
export const generateStaticParams = async () => {
  const slugsFr = await fetchServiceSlugs("fr"); // Ou sans locale = fr par défaut
  const slugsEn = await fetchServiceSlugs("en");
  return [
    ...slugsFr.map((slug) => ({ slug, locale: "fr" })),
    ...slugsEn.map((slug) => ({ slug, locale: "en" })),
  ];
};
```

**Règle** : Toute page `[slug]/page.tsx` qui lit Sanity DOIT avoir `generateStaticParams`. Sans ça, la page est rendue à la demande (lent) et n'est pas préchargée au build.

### 3. Metadata SEO — Utiliser generateAlternates()

```typescript
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: LocaleType }>;
}): Promise<Metadata> => {
  const { slug, locale } = await params;
  const service = await getService(slug);

  return generateAlternates(
    "servicePresentation", // Clé dans routing.ts pathnames
    locale,
    service?.baliseTitle ?? "",
    service?.baliseDescription ?? "",
    service?.imagePrincipale
      ? urlFor(service.imagePrincipale).url()
      : undefined,
    {
      fr: locale === "fr" ? slug : getServicesSlugFr(slug), // Slug dans l'autre locale
      en: locale === "en" ? slug : getServicesSlugEn(slug),
    },
  );
};
```

**Ne PAS** appeler `getLocale()` dans `generateMetadata` — extraire depuis `params` (plus fiable et compatible avec le cache statique).

### 4. PortableText — Pattern ptComponents

Le pattern `ptComponents` est IDENTIQUE dans les trois types de pages (service, secteur, article). **Ne pas redéfinir** — extraire dans un fichier partagé si besoin :

```typescript
// Actuellement dupliqué dans service/[slug]/page.tsx, secteurs/[slug]/page.tsx,
// blog/[slug]/[subSlug]/page.tsx
// ✅ Peut être extrait dans src/components/blocs/ptComponents.ts
```

**Règle actuelle** : le `SanityImageValue` inline type est aussi dupliqué → signaler si refactoring possible.

### 5. Images Sanity — Toujours utiliser urlFor()

```typescript
import { urlFor } from "@/sanity/lib/image";

// ✅ URL générée avec optimisation Sanity CDN
const imageUrl = urlFor(service.imagePrincipale).url();

// ✅ Avec dimensions spécifiques
const imageUrl = urlFor(service.imagePrincipale).width(1200).height(630).url();
```

**Pour les images `fill`** (PortableText) :

```tsx
<div className="relative mx-auto my-6 h-[200px] w-full md:h-[400px]">
  <Image
    src={urlFor(value).url()}
    alt={value.alt || "illustration"}
    fill
    className="m-0 object-contain"
    sizes="(min-width:768px) 100vw"
  />
</div>
```

### 6. next-intl — Règles absolues

```typescript
// ✅ TOUJOURS
import { Link, usePathname, useRouter, redirect } from "@/i18n/navigation";

// ❌ JAMAIS — retourne le pathname avec locale (/fr/services/...)
import { usePathname } from "next/navigation";
import Link from "next/link";
```

**Dans les layouts** : toujours `setRequestLocale(locale)` en premier.

**Dans les pages serveur** : `setRequestLocale(locale)` + `getTranslations({ locale, namespace: "..." })`.

### 7. Redirections SEO — Middleware

Le middleware (`src/middleware.ts`) gère dans l'ordre :

1. Redirections racine (`/` → `/fr`)
2. Suppression trailing slash (`/fr/` → `/fr`)
3. URLs supprimées → `410 Gone` (tags, brackets dans URL, etc.)
4. Redirections legacy (`legacyRedirects` object dans `urls.ts`)
5. Redirections contenu (articles, services, secteurs) via handlers Sanity
6. `intlMiddleware` (next-intl)

**Attention** : Les handlers d'articles/services/secteurs sont synchrones (pas de fetch Sanity). Ils utilisent les mappings statiques dans `redirects/*.ts`.

### 8. routing.ts — État actuel

Le `routing.ts` contient encore des routes portail (ex: `/app/tickets`, `/app/sites`) qui n'existent plus dans ce projet. Ces routes sont historiques et n'ont pas d'impact runtime (next-intl les ignore si aucune page ne les correspond). Elles peuvent être nettoyées progressivement.

---

## Commandes Utiles

```bash
# Développement
pnpm dev

# Build
pnpm build

# Linting
pnpm lint

# Tests
pnpm test
pnpm test:watch

# Drizzle (pour le module devis)
pnpm db:push        # Push schema to DB
pnpm db:studio      # Open Drizzle Studio
pnpm db:generate    # Generate migrations
```

---

## Ressources

- **Next.js Docs**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **next-intl**: https://next-intl-docs.vercel.app/
- **Zod**: https://zod.dev/

---

## Notes Importantes

1. **Projet en refonte**: Ne pas prendre les anciens fichiers (ex: providers de services, fichiers dans `/client/`) comme référence. Utiliser uniquement `/app/sites` et `/app/utilisateurs` comme modèles.

2. **Atomicité**: Toujours utiliser des transactions Drizzle pour les mutations qui touchent plusieurs tables.

3. **Type Safety**: Le projet utilise TypeScript strict + Zod. Toujours typer correctement et valider avec Zod.

4. **i18n**: Toujours utiliser `@/i18n/navigation` au lieu de `next/navigation`.

5. **Sécurité**:
   - **TOUJOURS** vérifier les permissions avec `getUserAdhesion` avant de retourner des données
   - Ne JAMAIS hardcoder d'emails ou de secrets (utiliser `.env`)
   - Supprimer tous les `console.log` en production

6. **appStore (Zustand)**:
   - `hydrate()` = Login/refresh page seulement
   - `updateUser()` / `updateEntreprise()` = Après mutations
   - Ne PAS re-bootstrapper, juste mettre à jour le slice concerné

7. **Conventions de nommage**:
   - Fichiers: `camelCase.ts`
   - Composants: `PascalCase.tsx`
   - Actions: `[verb][Entity]Action` (ex: `insertSiteAction`)
   - Queries: `get[Entity]By[Criteria]` (ex: `getSitesByEntreprise`)
   - **Types TypeScript** :
     - Toujours utiliser `type`, jamais `interface` (sauf augmentation globale ex: `interface Window`)
     - Suffixe `Type` obligatoire : `type SearchParamsType`, `type SiteOptionType`, etc.
     - Exception : props de composants React → suffixe `Props` : `type MyComponentProps`
     - Jamais `as FormType` (alias local) — utiliser le nom complet importé directement

---

## Checklists & Patterns UX

### Checklist Implémentation Formulaire

**TOUJOURS vérifier ces points AVANT de considérer qu'un formulaire est terminé :**

#### 1. Logique Métier & État Initial

- [ ] **DefaultValues cohérents avec le contexte**
  - Exemple: Posture plateforme → `proprietaireEntrepriseId: ""` (vide pour forcer sélection)
  - Exemple: Posture client → `proprietaireEntrepriseId: entreprise.id` (auto-rempli)
- [ ] **Reset form prend en compte TOUS les états** (posture, entreprise, etc.)
- [ ] **Visualiser mentalement le parcours utilisateur complet** avant de coder

#### 2. Dépendances entre Champs

- [ ] **Champs disabled selon dépendances logiques**
  - Exemple: Select sites disabled si `!selectedClientId` (pas de client sélectionné)
  - Pattern: `disabled={!prerequisiteField || isLoading || items.length === 0}`
- [ ] **Rechargement dynamique des données** quand un champ parent change
  - Exemple: Changement de client → recharger les sites de ce client

#### 3. Validation & Messages d'Erreur

- [ ] **Messages d'erreur en français, clairs et contextuels**
  - ❌ Mauvais: `"Invalid UUID"`
  - ✅ Bon: `"Client obligatoire"`
- [ ] **Messages alignés avec la validation réelle**
  - Si validation dit "entre 50 et 3000", le message doit dire "entre 50 et 3000" (pas "entre 1 et 1000000")
- [ ] **Required fields avec `requiredMark` visible**

#### 4. UX & Accessibilité

- [ ] **Placeholders explicites et utiles**
  - ✅ Bon: `"Sélectionnez un client"`
  - ❌ Mauvais: `"Choisir"` (trop vague)
- [ ] **Labels clairs et en français**
- [ ] **États de chargement visibles** (skeleton, spinner, disabled pendant loading)
- [ ] **Footer sticky si contenu scrollable** (DialogFooter avec sticky, contenu avec overflow-y-auto)

#### 5. Technique

- [ ] **TypeScript vérifié** : `npx tsc --noEmit` SANS erreurs
- [ ] **Imports corrects** (pas d'imports inutilisés)
- [ ] **Pas de `console.log` en production**
- [ ] **Gestion d'erreur avec toast** (success, error, loading)

#### 6. Test Mental (CRITIQUE)

- [ ] **"Que voit l'utilisateur quand il ouvre le formulaire ?"**
  - Champs pré-remplis corrects ?
  - Champs disabled corrects ?
- [ ] **"Que se passe-t-il si l'utilisateur change le champ X ?"**
  - Les champs dépendants se mettent à jour ?
  - Les validations s'adaptent ?
- [ ] **"Que se passe-t-il si l'utilisateur soumet sans remplir ?"**
  - Messages d'erreur corrects ?
  - Focus sur le bon champ ?

### Pattern: Formulaire avec Posture Multi-Rôles

**Contexte**: Un formulaire qui se comporte différemment selon la posture (client/plateforme/prestataire)

**Pattern à suivre**:

```typescript
export function MyFormDialog({ open, onOpenChange }: Props) {
  const posture = useAppStore((state) => state.postureActive);
  const entreprise = useAppStore((state) => state.entreprise);

  // ✅ DefaultValues adaptés à la posture
  const form = useForm<MyFormType>({
    resolver: zodResolver(mySchema),
    defaultValues: {
      field1: "",
      // Pattern: Conditionnel selon posture
      proprietaireEntrepriseId: posture === "plateforme" ? "" : (entreprise?.id || ""),
    },
  });

  // ✅ Reset form avec logique posture
  useEffect(() => {
    if (open) {
      const defaultProprietaireId = posture === "plateforme" ? "" : (entreprise?.id || "");
      form.reset({
        field1: "",
        proprietaireEntrepriseId: defaultProprietaireId,
      });
    }
  }, [open, posture, entreprise?.id]);

  // ✅ Champs conditionnels selon posture
  return (
    <Form {...form}>
      {posture === "plateforme" && (
        <RhfControlledSelect
          name="proprietaireEntrepriseId"
          label="Client"
          requiredMark
          // Pattern: Forcer la sélection avec placeholder
          placeholder="Sélectionnez un client"
        />
      )}

      {/* Pattern: Champ dépendant disabled si parent vide */}
      <RhfControlledSelect
        name="siteId"
        label="Site"
        requiredMark
        disabled={!selectedClientId || loadingSites || sites.length === 0}
      />
    </Form>
  );
}
```

### Pattern: Champs Dépendants Dynamiques

**Exemple**: Client → Sites → Validation

```typescript
const [selectedClientId, setSelectedClientId] = useState<string>(
  posture === "plateforme" ? "" : entreprise?.id || "",
);
const [sites, setSites] = useState<Array<{ id: string; nom: string }>>([]);
const [loadingSites, setLoadingSites] = useState(false);

// ✅ Charger sites quand client change
useEffect(() => {
  if (!selectedClientId || !open) return;

  async function loadSites() {
    setLoadingSites(true);
    const result = await getAccessibleSitesAction({
      entrepriseId: selectedClientId,
    });
    if (result?.data) {
      setSites(result.data.map((s) => ({ id: s.id, nom: s.nom })));
    }
    setLoadingSites(false);
  }

  loadSites();
}, [selectedClientId, open]);

// ✅ Handler qui reset les dépendances
const handleClientChange = (clientId: string) => {
  setSelectedClientId(clientId);
  form.setValue("proprietaireEntrepriseId", clientId);
  form.setValue("siteId", ""); // ⚠️ CRITIQUE: Reset site quand client change
};
```

### Pattern: Messages d'Erreur Zod Personnalisés

```typescript
// ❌ MAUVAIS: Message générique
export const mySchema = z.object({
  clientId: z.uuid().optional(),
});

// ✅ BON: Message contextuel
export const mySchema = z.object({
  clientId: z.uuid("Client obligatoire").optional(),
});

// ✅ BON: Validation avec message détaillé
export const mySchema = z.object({
  surface: z
    .string()
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 50 && Number(v) <= 3000,
      "La surface doit être un nombre compris entre 50 et 3000 m²",
    ),
});
```

### Pattern: Dialog Scrollable avec Footer Sticky

```typescript
<DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0">
  <DialogHeader className="px-6 pt-6 pb-4">
    <DialogTitle>Titre</DialogTitle>
  </DialogHeader>

  <Form {...form}>
    <form className="flex flex-col flex-1 overflow-hidden">
      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4">
        {/* Tous les champs ici */}
      </div>

      {/* Footer sticky */}
      <DialogFooter className="sticky bottom-0 bg-background border-t pt-4 pb-6 px-6">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Annuler
        </Button>
        <Button type="submit">Enregistrer</Button>
      </DialogFooter>
    </form>
  </Form>
</DialogContent>
```

### Erreurs Communes à Éviter

#### ❌ DefaultValues non adaptés au contexte

```typescript
// FAUX: Toujours la même valeur
defaultValues: {
  proprietaireEntrepriseId: entreprise?.id, // ❌ Pas bon pour posture plateforme
}

// CORRECT: Conditionnel selon posture
defaultValues: {
  proprietaireEntrepriseId: posture === "plateforme" ? "" : (entreprise?.id || ""),
}
```

#### ❌ Champs dépendants non disabled

```typescript
// FAUX: Site toujours enabled même sans client
<Select name="siteId" disabled={loadingSites} />

// CORRECT: Site disabled si pas de client
<Select name="siteId" disabled={!selectedClientId || loadingSites} />
```

#### ❌ Oublier de reset les champs dépendants

```typescript
// FAUX: Changer client sans reset site
const handleClientChange = (clientId: string) => {
  setSelectedClientId(clientId);
  // ❌ Oubli de reset siteId → garde l'ancien site d'un autre client!
};

// CORRECT: Reset les dépendances
const handleClientChange = (clientId: string) => {
  setSelectedClientId(clientId);
  form.setValue("siteId", ""); // ✅ Reset site
};
```

#### ❌ Messages d'erreur techniques

```typescript
// FAUX: Message pour développeur
z.uuid(); // → "Invalid UUID"

// CORRECT: Message pour utilisateur final
z.uuid("Client obligatoire");
```

### Rappel: Visualisation du Flow Utilisateur

**AVANT de coder un formulaire complexe, écrire le scénario** :

1. **État initial** : Quels champs sont remplis ? Lesquels sont disabled ?
2. **Action utilisateur** : L'utilisateur clique sur X → que se passe-t-il ?
3. **Validation** : L'utilisateur submit vide → quels messages apparaissent ?
4. **Success** : Le formulaire est validé → que voit l'utilisateur ?

**Exemple concret (Création Ticket)** :

- Posture plateforme ouvre le formulaire → Client vide, Sites disabled
- Sélectionne client "Acme" → Sites se chargent, deviennent enabled
- Soumet sans site → Message "Site obligatoire"
- Soumet complet → Toast success, dialog se ferme

---

## Terminologie Importante

### "Prestataire" (pas "Fournisseur")

**RÈGLE CRITIQUE** : Utiliser TOUJOURS le terme **"prestataire"** dans tout le code et la DB.

- ✅ **prestataire** / **Prestataire**
- ❌ ~~fournisseur~~ / ~~Fournisseur~~

**Raison** : Cohérence terminologique avec le métier du facility management.

**Exemples** :

- Posture : `"client" | "prestataire" | "plateforme"`
- Statut ticket : `"en_attente_prestataire"` (pas `en_attente_fournisseur`)
- Visibilité message : `"prestataire_only"` (pas `fournisseur_only`)
- Variables : `isPrestataire`, `prestataireAdhesion`, etc.

**Attention** : Le rôle entreprise dans la DB reste `"prestataire"` (table `entreprise_roles`).

---

## Module Tickets - Architecture Avancée

Le module `/app/tickets` implémente des fonctionnalités avancées :

### Section Messages/Discussion

**Fichiers clés** :

- `[ticketId]/TicketMessagesSection.tsx` - Composant messages avec UI WhatsApp-style
- `insertTicketMessageAction` - Action serveur avec gestion attachments
- `getTicketMessagesWithAttachments` - Query avec JOINs documents

**Fonctionnalités** :

- Messages filtrés par visibilité selon posture (public, client_only, prestataire_only, fm4all_only)
- Pièces jointes liées aux messages (polymorphic via `documentsLinks.ticketMessageId`)
- Preview Dialog pour images/PDFs
- Promotion fichiers temp → S3 permanent lors de l'envoi

**Architecture polymorphique documentsLinks (IMPORTANT)** :

- **Table polymorphique** : `documentsLinks` peut lier un document à différentes entités (ticket, ticketMessage, site, devis, etc.)
- **Principe de normalisation** : Chaque ligne pointe vers **UN SEUL parent**
  - PJ du ticket : `ticketId` rempli, `ticketMessageId` NULL
  - PJ d'un message : `ticketMessageId` rempli, `ticketId` **NULL** (pas de redondance)
- **Rationale** : Évite la redondance et les risques d'incohérence (l'info ticketId est déjà dans `ticketMessages.ticketId`)
- **Distinction** : Utiliser `isNull(documentsLinks.ticketMessageId)` pour filtrer les PJ du ticket uniquement
- **Query exemple** :
  ```typescript
  // PJ du ticket (sans les PJ des messages)
  .where(and(
    eq(documentsLinks.ticketId, ticketId),
    isNull(documentsLinks.ticketMessageId)
  ))
  ```

**Pattern visibilité** :

```typescript
// Frontend - Filtrage messages affichés
const visibleMessages = initialMessages.filter((msg) => {
  if (posture === "plateforme") return true; // fm4all voit tout
  if (msg.visibilite === "public") return true;
  if (posture === "client" && msg.visibilite === "client_only") return true;
  if (posture === "prestataire" && msg.visibilite === "prestataire_only")
    return true;
  return false;
});

// Backend - Permissions d'écriture
if (isClient && !["public", "client_only"].includes(visibilite)) {
  throw errors.forbidden("Client ne peut poster que public ou client_only");
}
if (isPrestataire && !["public", "prestataire_only"].includes(visibilite)) {
  throw errors.forbidden(
    "Prestataire ne peut poster que public ou prestataire_only",
  );
}
```

**Références d'implémentation** :

- `/app/tickets/[ticketId]/TicketMessagesSection.tsx` - UI messages
- `/server/actions/ticketsActions.ts` - `insertTicketMessageAction`
- `/server/queries/tickets.query.ts` - `getTicketMessagesWithAttachments`

---

## Audit & Corrections (2026-02-12)

**Sections Auditées**: `/app/sites`, `/app/utilisateurs`, `/auth`

**Bugs Corrigés**:

- 🔴 3 bypass de permissions critiques (usersActions.ts)
- 🔴 Email BCC hardcodé (mailgunDirect.ts)
- 🟠 Validation password faible (resetPassword.ts)
- 🟠 2 console.log en production
- 🟠 Redirect vers route inexistante (EmailOkCard.tsx)
- 🟠 Validation ranges désalignées (sites.schema.ts)
- 🟠 appStore non synchronisé après mutations (appStore.ts, UserFormDialog.tsx)

**Architecture Validée**: ✅ Cohérente et moderne (Server Actions + RHF + Zod + Closure tables)

**Patterns Documentés**: Sécurité, permissions, appStore sync, password validation, email config

---

## Changelog (2026-02-25)

**Module Tickets - Refonte Messages/Discussion** :

- ✅ Implémentation section messages avec UI WhatsApp-style
- ✅ Visibilité messages selon posture (public, client_only, prestataire_only, fm4all_only)
- ✅ Pièces jointes sur messages (polymorphic documentsLinks)
- ✅ Preview Dialog images/PDFs avec URLs présignées
- ✅ Terminologie unifiée "prestataire" (renommage DB enum `en_attente_fournisseur` → `en_attente_prestataire`)

**Fichiers ajoutés** :

- `[ticketId]/TicketMessagesSection.tsx` - Composant messages
- Migration 0010 - Enum `ticket_message_visibilite` (prestataire_only)
- Migration 0011 - Enum `ticket_statut` (en_attente_prestataire)

**Fichiers supprimés** :

- `TicketMessagesList.tsx` (obsolète)
- `TicketMessageForm.tsx` (obsolète)

---

## Changelog (2026-03-04)

**Module Entreprises — CRUD complet** :

- ✅ Liste/grid paginée avec infinite scroll, filtres, tri
- ✅ Création entreprise multi-steps (Step 1: infos + rôles/services, Step 2: admin)
- ✅ Formulaire "Remplir depuis un prospect" (ProspectPickerDialog)
- ✅ Page de détail avec édition inline (infos, contact, rôles, logo)
- ✅ Upload logo via avatar cliquable + promotion S3 (temp → documents/)
- ✅ Guards serveur sur retrait de rôles/services (vérifie clientServices avant toute suppression)
- ✅ Fix React Hook Form v7 : remplacer `form.watch()` par `useWatch` hook (évite "Maximum update depth exceeded")

**Pattern : URLs présignées S3 dans les listes/grids** :

`S3_PRESIGN_READ_EXPIRES_SECONDS` vaut 60s par défaut. Ne jamais générer des URLs S3 côté serveur pour les passer dans une liste — elles seront expirées avant que l'utilisateur ne scrolle ou revienne sur la page.

**Pattern correct pour afficher des images/logos dans une liste** :

1. Passer `storageKey` dans les données (pas `url`)
2. Créer un composant client qui appelle `getPresignedReadUrl()` au montage
3. La colonne/carte utilise ce composant — URL toujours fraîche, fallback pendant le chargement

```typescript
// LogoAvatar.tsx (pattern réutilisable)
"use client";
export function LogoAvatar({ storageKey, proprietaireEntrepriseId, nom, size }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!storageKey) return;
    getPresignedReadUrl({ key: storageKey, proprietaireEntrepriseId })
      .then(setLogoUrl).catch(() => setLogoUrl(null));
  }, [storageKey, proprietaireEntrepriseId]);
  return (
    <Avatar>
      {logoUrl && <AvatarImage src={logoUrl} />}
      <AvatarFallback>{nom.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
```

**Pattern : LEFT JOIN + GROUP BY + MAX() pour champ lié non-agrégé** :

Quand une table est déjà en GROUP BY et qu'on veut un champ d'une table jointe (relation 0-1 via FK), utiliser `MAX()` contourne la contrainte PostgreSQL :

```typescript
logoStorageKey: sql<string | null>`MAX(${documents.storageKey})`,
// LEFT JOIN documents ON entreprises.logoId = documents.id
// Le MAX() retourne l'unique valeur si elle existe, NULL sinon
```

**Référence** : `src/app/[locale]/.../app/entreprises/` — `LogoAvatar.tsx`, `EntrepriseCard.tsx`, `createEntreprisesColumns.tsx`, `entreprises.query.ts`

---

## Changelog (2026-03-05)

**Module Utilisateurs — Requêtes posture-aware** :

- ✅ `getUsers()` réécrit avec 3 branches explicites : `plateforme` (→ `userPlateformeAdhesions`), `prestataire` (→ `userPrestataireAdhesions`), `client` (défaut)
- ✅ Correction `getUsersAction` : vérification de permission posture-aware (plateforme → `getUserPlateformeAdhesion`, prestataire → check `userPrestataireAdhesions`, client → `getUserClientAdhesion`)
- ✅ Correction `insertUserAction` : insère dans `userPrestataireAdhesions` si posture=prestataire
- ✅ `UsersClient.tsx` : passe `posture` dans queryParams + dépendances `useEffect`

**Module Utilisateurs — Rattacher un utilisateur existant** :

- ✅ `getUsersEligibleForAdhesion()` : query retournant les users de l'entreprise n'ayant PAS encore l'adhésion pour la posture cible (via `notExists` + self-referential arborescence `profondeur=0`)
- ✅ `addAdhesionToExistingUserAction` : ajoute une adhésion sans créer de compte ni modifier l'arborescence (l'utilisateur existant a déjà ses entrées)
- ✅ `UserFormDialog.tsx` : ToggleGroup "Nouvel utilisateur" / "Rattacher existant" — `LinkExistingUserForm` charge les users éligibles et insère uniquement l'adhésion

**Module Mes Prestataires — Politique lecture seule** :

- ✅ Decision: posture client = lecture seule sur les infos de base des prestataires (nom, SIRET, contact)
- ✅ Disclaimer discret ajouté dans `MesPrestatairesClient.tsx` avec lien `mailto:contact@fm4all.com`
- Rationale: un prestataire peut être partagé entre plusieurs clients → risque d'incohérence si un client modifie les données partagées. Le client contrôle déjà la relation via le module Prestations.

**Règle : `notExists` pour filtrer utilisateurs éligibles** :

```typescript
// Pattern: users dans l'entreprise (via arborescence self-ref) SANS l'adhésion cible
const baseQuery = db
  .select({ id, prenom, nom, email })
  .from(user)
  .innerJoin(
    usersArborescence,
    and(
      eq(usersArborescence.descendantId, user.id),
      eq(usersArborescence.ancetreId, user.id), // profondeur=0 = appartient à l'entreprise
      eq(usersArborescence.entrepriseId, entrepriseId),
    ),
  )
  .where(
    notExists(
      db
        .select()
        .from(userClientAdhesions)
        .where(
          and(
            eq(userClientAdhesions.userId, user.id),
            eq(userClientAdhesions.entrepriseId, entrepriseId),
          ),
        ),
    ),
  );
```

**Règle : Branches Drizzle explicites pour union de tables** :
Ne PAS essayer `const table = condition ? tableA : tableB` — le typage Drizzle ne supporte pas les unions de tables dans `.from()`. Toujours utiliser des branches `if/else` avec des queries séparées.

---

## Changelog (2026-03-05 — session 2)

**Refonte `mes-sites-clients` + nouveau `sites-clients` plateforme** :

- ✅ `app/mes-sites-clients` — réécriture complète : sélecteur client synced URL, arborescence SitesTree + SiteDetails + SiteFormDialog, règle proxy prestataire
- ✅ `app/sites-clients` — nouvelle page plateforme : tous les clients + droits complets super_admin
- ✅ `SitesTree` — nouvelle prop `canManageOverride?: boolean` pour contourner les check de rôle
- ✅ `sitesActions.ts` — helper `canManageSiteAsProxy()` dans insert/update/archive
- ✅ `entreprises.query.ts` — `ClientAvecDetails` enrichi avec `adminEmail`
- ✅ Sidebar plateforme — "Sites clients" ajouté dans section "Réseau"
- ✅ `routing.ts` — route `/app/sites-clients` enregistrée
- ✅ Suppression de `restoreSiteAction` (code mort)
- ✅ `PrestationFormDialog` — suppression du sous-formulaire "+ Nouveau client"

**Pattern : Proxy prestataire sur sites client** :

```typescript
// canManageSiteAsProxy() — dans sitesActions.ts
// 1. Client sans admin actif (userClientAdhesions, statut=actif, role=admin) ?
// 2. User est admin/manager prestataire (userPrestataireAdhesions) lié via clientPrestataireRelations ?
// → Si les deux sont vrai : peut créer/modifier/archiver les sites du client
```

**Règle frontend** :

- `canManage = !selectedClient.hasActiveAdmin` (prestataire)
- Passer `canManageOverride={canManage}` à `SitesTree`
- Passer `currentUserRole={canManage ? "admin" : null}` à `SiteDetails`

---

## Changelog (2026-03-05 — session 3)

**Audit sécurité + guards posture-spécifiques** :

- ✅ Audit complet des modules : Sites, Utilisateurs, Entreprises, Mes Prestataires, Mes Sites Clients, Sites Clients
- ✅ `isAdmin()` dans `sitesActions.ts` inclut déjà le check `super_admin_plateforme` (confirmation — pas de bug)
- ✅ Guards serveur ajoutés sur les pages posture-restreintes :
  - `/app/mes-prestataires/page.tsx` → redirect `/auth/unauthorized` si pas d'adhésion client active
  - `/app/mes-sites-clients/page.tsx` → redirect `/auth/unauthorized` si pas d'adhésion prestataire active
  - `/app/mes-clients/page.tsx` → redirect `/auth/unauthorized` si pas d'adhésion prestataire active
- ✅ Pattern documenté dans CLAUDE.md (voir "Guard Server-Side pour Pages Réservées à une Posture")

---

## Changelog (2026-03-06)

**Audit module Checklists + Schema hardening + Relations.ts complet** :

- ✅ **Bug 1 corrigé** : `DraggableItemRow` — boutons Pencil/Trash/GripVertical conditionnels sur `canManage` prop (étaient toujours visibles même sans droits)
- ✅ **Schema hardening** — `userClientAdhesions` et `userPrestataireAdhesions` : unique index sur `userId` seul (règle "1 user = 1 enterprise") — migration `0026_petite_callisto.sql`
- ✅ **`canManageChecklists(userId, entrepriseId: string | null)`** : signature corrigée pour accepter `null` (retourne `false` immédiatement) — corrige 6 erreurs TS pre-existantes
- ✅ **`getTacheListeTemplateAction`** : contrôle d'accès ajouté pour les packs enterprise (les packs système `proprietaireEntrepriseId === null` restent accessibles à tous les utilisateurs authentifiés)
- ✅ **`NewChecklistDialog.onSuccess`** : type corrigé de `(serviceId, serviceNom) => void` à `() => void`
- ✅ **`relations.ts`** : toutes les relations manquantes ajoutées (voir section dédiée dans MEMORY.md)

**Distinction CRITIQUE : `canManage` vs `canManageChecklists`** :

```typescript
// canManage (de responsable_site) = opérationnel
// → Assigner une checklist existante à une prestation
// → Contrôle DraggableItemRow buttons (Pencil, Trash, GripVertical)

// canManageChecklists (de admin/manager entreprise) = stratégique
// → CRUD des packs et items de checklist (templates)
// → getTacheListeTemplateAction : system packs = accessibles à tous, enterprise packs = check accès
```

**Règle schema unique — 1 user = 1 enterprise** :

```typescript
// ✅ CORRECT — unique sur userId seul (pas sur la paire userId+entrepriseId)
uniqueIndex("user_client_adhesions_user_udx").on(table.userId),
uniqueIndex("user_prestataire_adhesions_user_udx").on(table.userId),
// Raison : un utilisateur appartient à UNE seule entreprise en tant que client/prestataire
// Multi-posture = changer d'entreprise (nouveau compte), pas appartenir à deux entreprises
```

**`relations.ts` — Points d'attention** :

- Mettre à jour `relations.ts` ne génère **jamais** de migration (abstraction TypeScript uniquement)
- Quand deux relations existent entre les mêmes tables → `relationName` requis sur les DEUX côtés
- Conflits de noms : importer une table avec alias (`as clientPrestataireRelationsTable`)
- `clientServicePrixAppliques` : table anti-double-facturation, complètement absente de relations.ts avant ce fix

---

## Changelog (2026-03-06 — session 2)

**Audit sécurité — mes-clients, checklists, layout + refactoring permissions posture-aware** :

- ✅ **Bug `MesClientsClient`** : `canManage` utilisait `roleClientAdhesion` au lieu de `rolePrestataireAdhesion`
- ✅ **Bug `hasAccessToEntreprise`** : vérification `statut: "actif"` manquante + pas de check prestataire
- ✅ **Bug `inviterClientAdminAction`** : réécriture — flow invitation (token → `entrepriseInvitations` → email → `/auth/inscription-admin?token=`) au lieu de création directe de compte
- ✅ **Bug `canManageChecklists`** : `statut: "actif"` manquant sur les deux checks d'adhésion
- ✅ **`app/layout.tsx`** : deux TODO placeholder remplacés par de vrais redirects (`/auth/login`, `/auth/unauthorized`)
- ✅ **Centralisation `hasAccessToEntreprise`** : exportée depuis `userAdhesions.query.ts`, copies locales supprimées dans les fichiers d'actions
- ✅ **`getEffectivePlateformeRole()`** créée dans `src/server/utils/permissions.utils.ts` — rend le bypass plateforme posture-aware (lit le cookie `fm4all:postureActive`)
- ✅ **11 fichiers d'actions** migrés : `getUserPlateformeAdhesion` → `getEffectivePlateformeRole`

**Fichiers créés** :

- `src/server/utils/permissions.utils.ts`

**Fichiers modifiés** :

- `src/server/queries/userAdhesions.query.ts`
- `src/server/actions/tacheListesTemplatesActions.ts`
- `src/app/[locale]/.../app/layout.tsx`
- `src/app/[locale]/.../app/mes-clients/MesClientsClient.tsx`
- 10 autres fichiers d'actions (sed — import + appel)

---

## Changelog (2026-03-07)

**Module Tâches d'occurrence — Permissions métier complètes** :

- ✅ Matrice de permissions révisée selon spec métier (voir tableau ci-dessous)
- ✅ `updateOccurrenceTacheStatutAction` restructuré : fetch tâche AVANT le check de permission (nécessaire pour isAssignée)
  - `terminee` → `isAssignée || canManage` (était : canExecute — trop permissif)
  - `non_honoree` → `canExecute` (était : canManage — trop restrictif)
  - `annulee` → `canManage` uniquement (inchangé)
  - `en_cours`, `non_applicable` → `canExecute` (inchangé)
- ✅ `insertAdHocTacheAction` / `updateAdHocTacheAction` : restreints à `canManageOccurrence` (était `canExecuteOccurrence`)
- ✅ Nouveau `updateTacheTempsPasseAction` : correction manuelle du temps passé (canManage, tâche `terminee` uniquement)
- ✅ `updateTacheTempsPasseSchema` ajouté dans `clientServiceOccurrences.schema.ts` (0–604800 s, max 7 jours)
- ✅ `OccurrenceDetailClient.tsx` — frontend synchronisé :
  - `canAddAdHoc` → `canManage` (était `canExecute`)
  - Bouton edit ad-hoc → `canManage` (était `canExecute`)
  - Bouton "Terminer" → `canExecute && (isAssignée || canManage)` (était : `canExecute` seul)
  - Champ "Corriger temps passé" : icône crayon inline, input en minutes, visible si `canManage && statut === "terminee"`
- ✅ Pièces jointes preuves (déjà implémentées) : `PjUploadZone` + `PjThumb`, max 2 PJ/tâche, visible si `canExecute && tâche en cours`

**Matrice de permissions tâches (référence)** :

| Action                      | canExecute  | canManage | isAssignée |
| --------------------------- | ----------- | --------- | ---------- |
| Voir                        | ✅          | ✅        | —          |
| Créer tâche ad-hoc          | ❌          | ✅        | —          |
| Modifier tâche ad-hoc       | ❌          | ✅        | —          |
| Supprimer tâche ad-hoc      | ❌          | ✅        | —          |
| Démarrer (→ en_cours)       | ✅          | ✅        | —          |
| Terminer (→ terminee)       | si assignée | ✅        | ✅         |
| Non applicable              | ✅          | ✅        | —          |
| Non honorée                 | ✅          | ✅        | —          |
| Annuler (→ annulee)         | ❌          | ✅        | —          |
| Ajouter PJ (tâche en cours) | ✅          | ✅        | —          |
| Corriger tempsPasseSecondes | ❌          | ✅        | —          |

**Rappel** : `canExecute` = admin + responsable_site + demandeur_site (client) / intervenant_site (prestataire) ; `canManage` = admin + responsable_site uniquement.

**Fichiers modifiés** :

- `src/zod-schemas/clientServiceOccurrences.schema.ts` — `updateTacheTempsPasseSchema` ajouté
- `src/server/actions/clientServiceOccurrencesActions.ts` — 3 actions modifiées + 1 nouvelle
- `src/app/[locale]/.../occurrences/[occurrenceId]/OccurrenceDetailClient.tsx` — boutons + temps passé

---

## Changelog (2026-03-09)

**Module Devis — PDF + responsable_site** :

- ✅ `DevisPreviewCard` : prop `pdfMode` pour ajuster l'espacement lors de la capture html2canvas
- ✅ Génération PDF : format A4 fixe (595×842pt) avec pdf-lib, logo converti en data URL pour contourner CORS
- ✅ `responsable_site` affiché dans le preview (création + détail), en remontant la hiérarchie via `sitesArborescence`
- ✅ Bouton Printer (ouvre le PDF dans un nouvel onglet)

**Pièges CSS à retenir** :

#### ❌ `[&_p]:!important` cible TOUS les `<p>` enfants

```tsx
// FAUX : mb-10 sur le <p> sera écrasé par [&_p]:!mb-0.5 du parent
<div className="[&_p]:!mb-0.5">
  <p className="mb-10">DE</p>  // ❌ mb-10 ignoré car !important du parent gagne
</div>

// CORRECT : passer les éléments à exclure en <div>
<div className="[&_p]:!mb-0.5">
  <div className="mb-10">DE</div>  // ✅ <div> non ciblé par [&_p]
  <p className="text-xs">contact</p>  // ✅ reçoit bien mb-0.5
</div>
```

#### ❌ html2canvas ne peut pas charger les URLs S3 présignées (CORS)

Pour les images dans une capture html2canvas, convertir en data URL :

```typescript
const resp = await fetch(presignedUrl);
const blob = await resp.blob();
const dataUrl = await new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});
// Utiliser dataUrl dans le state — html2canvas peut le lire sans CORS
```

#### ❌ Alignement tables avec html2canvas : classes Tailwind ignorées

Les classes `text-left`, `text-right`, `text-center` sur `<th>/<td>` peuvent ne pas être capturées.
→ Toujours utiliser `style={{ textAlign: "left" }}` inline.

#### Pattern `userClientSiteAttributions` + hiérarchie de sites

Quand on cherche un `responsable_site` pour un site donné, ne PAS faire de match exact sur `siteId`.
Une attribution peut être sur un site parent avec `scope = "subtree"`. Toujours joindre `sitesArborescence` :

```typescript
.innerJoin(sitesArborescence, and(
  eq(sitesArborescence.ancetreId, userClientSiteAttributions.siteId),
  eq(sitesArborescence.descendantId, targetSiteId),
  eq(sitesArborescence.entrepriseId, entrepriseId),
))
.where(and(
  eq(userClientSiteAttributions.role, "responsable_site"),
  or(eq(sitesArborescence.profondeur, 0), eq(userClientSiteAttributions.scope, "subtree")),
))
.orderBy(asc(sitesArborescence.profondeur))
.limit(1)
```

---

**Dernière mise à jour**: 2026-03-16

---

## Changelog (2026-03-16)

**Audit module Prestations — 6 bugs corrigés** :

- 🔴 **`insertRegleRecurrenceAction` ne généraient pas les occurrences immédiatement** : `onClientServiceChanged()` n'était pas appelée après l'INSERT d'une règle de récurrence (contrairement à l'UPDATE). Les occurrences attendaient jusqu'au cron suivant (minuit UTC). Ajout de l'appel après l'insert.
- 🔴 **`hasActiveRegle` initialisé à `false` en dur** (`PrestationDetailsClient.tsx`) : Le breadcrumb étape 4 (Planification) était toujours grisé au premier rendu même si une règle active existait déjà. Corrigé : `useState(initialRegles.some((r) => r.actif))`.
- 🟠 **Sémantique `hasActiveExecution` duale** : `hasActiveExecution` avait deux usages incompatibles — pour `canActivate` (= seul `e.actif` comme côté serveur) et pour le bandeau Interventions (= actif + dans les bornes de date). Scindé en `hasAnyActiveExecution` (simple `e.actif`) et `hasActiveExecution` (avec `dateDebutValidite`/`dateFinValidite`).
- 🟠 **`hasActiveExecution` non destructuré dans `InterventionsTab`** : Prop déclarée dans le type mais absente du destructuring → valeur toujours `undefined`. Ajouté au destructuring.
- 🟠 **`RhfDateTimePicker` sans contraintes de date dans `RegleRecurrenceFormDialog`** : La "Première occurrence" acceptait n'importe quelle date. Ajout de `min`/`max` calés sur `prestation.dateDebut`/`dateFin`.
- 🟠 **JSX unclosed div dans le breadcrumb** : `<div className="mt-3 space-y-2">` ouverte mais jamais fermée → ~100 erreurs TS en cascade. Corrigé + ajout du message `activationBlockReason` (explique pourquoi l'étape Activation est grisée).
- ✅ **Message d'info ajouté dans `RegleRecurrenceFormDialog`** : Explique le comportement de skip silencieux si aucune exécution ne couvre la date de la première occurrence.

**Pièges à retenir — module Prestations** :

```typescript
// 1. TOUJOURS appeler onClientServiceChanged après INSERT d'une règle (pas seulement UPDATE)
await onClientServiceChanged({ clientServiceId, now: new Date() });

// 2. Initialiser hasActiveRegle depuis les données, jamais false en dur
const [hasActiveRegle, setHasActiveRegle] = useState(
  initialRegles.some((r) => r.actif),
);

// 3. Deux variables pour hasActiveExecution selon l'usage
const hasAnyActiveExecution = executions.some((e) => e.actif); // canActivate
const hasActiveExecution = executions.some(
  // bandeau UI
  (e) =>
    e.actif &&
    e.dateDebutValidite <= today &&
    (e.dateFinValidite === null || e.dateFinValidite >= today),
);
```

**Fichiers modifiés** :

- `src/app/[locale]/.../prestations/[prestationId]/PrestationDetailsClient.tsx`
- `src/app/[locale]/.../prestations/[prestationId]/RegleRecurrenceFormDialog.tsx`
- `src/server/actions/clientServiceReglesRecurrenceActions.ts`

---

## Changelog (2026-03-10)

**Audit Attribution des Sites + Devis + Auth — 4 bugs corrigés** :

- 🔴 **`NEXT_PUBLIC_PUSHER_SECRET` exposé côté client** (`src/lib/env.ts` + `src/lib/pusher.ts`) : Le préfixe `NEXT_PUBLIC_` fait que Next.js inline la variable dans le bundle client. Renommé en `PUSHER_SECRET`. ⚠️ Mettre à jour le `.env` en conséquence.
- 🔴 **Guard plateforme manquant sur `signerDevisAction` et `refuserDevisAction`** (`devisActions.ts`) : Un utilisateur FM4ALL ayant à la fois un `rolePlateformeAdhesion` ET un `userClientAdhesion` dans l'entreprise propriétaire pouvait signer/refuser un devis même en posture "plateforme" (qui est censée être lecture seule). Ajout de `getEffectivePlateformeRole` check au début des deux actions.
- 🟠 **Self-action guard manquant pour managers prestataire** (`userPrestataireSiteAttributionsActions.ts` `deleteUserPrestataireSiteAttributionAction`) : Un manager prestataire (level 2) pouvait supprimer ses propres attributions de site car la condition `parsedInput.userId !== currentUser.id` était fausse → le check descendant était skipé. Ajout du guard explicite (cohérence avec le côté client).
- 🟠 **`getSiteResponsableAction` sans vérification d'accès** (`devisActions.ts`) : N'importe quel utilisateur authentifié pouvait récupérer prénom/nom/email/téléphone du responsable de n'importe quel site. Ajout de `hasAccessToEntreprise` check.

**Modules audités pour la première fois** :

- ✅ Attribution des Sites (`userSiteAttributionsActions.ts` + `userPrestataireSiteAttributionsActions.ts`) — structure OK, règles §4-§10 bien implémentées, 1 bug corrigé
- ✅ Auth (`auth.ts`, `inscription-admin/`, `reset-password/`, `email-ok/`, `unauthorized/`, `env.ts`) — flows corrects, 1 bug critique corrigé (Pusher secret)
- 🚧 Devis (`devisActions.ts`, `devisDemandesActions.ts`, `devisPermissions.utils.ts`) — 3 bugs corrigés, module encore en cours de développement

## Changelog (2026-03-17)

**Module Terrain — backend complet (migration 0050)** :

- ✅ **Migration 0050** (`pnpm db:generate`) : colonnes `startedByFieldSessionId` + `doneByFieldSessionId` sur `client_service_occurrences` et `occurrence_taches` (FK → `occurrenceFieldSessions.id`, traçabilité sans verrou de propriété)
- ✅ **`terrain.schema.ts`** : 5 schemas Zod (`openTerrainSessionSchema`, `startOccurrenceFieldSchema`, `updateTacheFieldSchema`, `terminateOccurrenceFieldSchema`, `addTachePieceJointeFieldSchema`)
- ✅ **`terrain.query.ts`** : `getTerrainDataByToken()` — joins occurrence + service + client + prestataire + site + session; queries séparées tâches (ordre asc) + PJ (batch par tacheIds)
- ✅ **`terrainActions.ts`** : 5 actions token-based sans auth (`openTerrainSession`, `startOccurrenceField`, `updateTacheField`, `terminateOccurrenceField`, `addTachePieceJointeField`). Pusher triggé sur canal `terrain-${occurrenceId}`.
- ✅ **`/api/s3/presign-upload-terrain`** : route POST token-based, génère URL présignée avec `makeTempKey(categorie: "tache_piece_jointe")`
- ✅ **`OccurrenceTerrain.tsx`** : branché sur les vraies actions + Pusher temps réel + localStorage session. `Channel` type importé depuis `pusher-js`.
- ✅ **`page.tsx`** : chargement initial via `getTerrainDataByToken` → `notFound()` si token invalide/expiré

**Pièges terrain à retenir** :

- `documentsLinks.values()` requiert `proprietaireEntrepriseId` (not null) → passer `clientEntrepriseId` de `validateToken()`
- `Channel` de pusher-js : typer via `import type { Channel } from "pusher-js"` (évite l'erreur `.bind()` sur type inline `{ unsubscribe }`)
- `handleTacheTransition` doit prendre `OccurrenceTacheTransitionStatutType` (exclut `"a_faire"`) — jamais `OccurrenceTacheStatutType`
- Pusher client : `await import("@/lib/pusher")` dynamique (evite SSR issues)
- Migrations : **toujours** `pnpm db:generate` → jamais écrire le SQL manuellement

## Changelog (2026-03-17 — session 2)

**Feature Emoji sur les tâches de checklist** :

- ✅ **`tacheListeItems.emoji`** : colonne déjà existante (`varchar(10)`)
- ✅ **`occurrenceTaches.emoji`** : colonne ajoutée (migration `0052_curious_lord_tyger.sql`) + copiée dans `snapshotOccurrenceTaches()`
- ✅ **`src/lib/fm-emojis.ts`** : liste curatée de ~200 emojis FM en 14 catégories (Nettoyage, Maintenance, Sécurité incendie, Café & Boissons, Fontaines & Eau, Travaux & Rénovation, Espaces verts, Office Management, Accueil & Réception, Sécurité & Accès, Énergie & Environnement, Logistique, Hygiène & Santé, Général)
- ✅ **`TacheListeManagerDialog.tsx`** : picker emoji inline (Popover + ScrollArea, catégories, "Supprimer l'emoji") dans `DraggableItemRow` + `AddItemForm`
- ✅ **Affichage emoji partout** : `{item.emoji && <span className="mr-1.5">{item.emoji}</span>}` ajouté dans tous les composants qui affichent des tâches

**Fichiers d'affichage mis à jour** :

- `PrestationDetailsClient.tsx` — onglets Planification (règles) et Exécution (checklist)
- `OccurrenceDetailClient.tsx` — liste tâches + détail tâche courante
- `OccurrenceDetailDialog.tsx` (calendrier) — popup interventions
- `ChecklistsClient.tsx` — page Checklists
- `ExecutionEditDialog.tsx` + `ExecutionFormDialog.tsx` — aperçu checklist
- `OccurrenceOnDemandDialog.tsx` — aperçu checklist
- `OccurrenceTerrain.tsx` — 3 emplacements (récap, liste statuts, détail tâche)
- 4 picker dialogs (TacheListePicker, RegleTacheListePicker, OccurrenceTacheListePicker, ChecklistPicker)

**Queries/types corrigés pour propager emoji** :

- `ChecklistItem` (type) + query dans `clientServiceOccurrences.query.ts` — `emoji` ajouté au SELECT et au push
- `getOccurrenceTachesAction` — fallback template : `emoji` ajouté au SELECT + map
- `getTacheItemsByTemplateAction` — `emoji` ajouté au SELECT + map
- `OccurrenceDetailDialog.tsx` — type local `TacheItemType` + `mapTaches()` mis à jour

**Pièges emoji à retenir** :

- Il n'existe pas d'emoji aspirateur dans Unicode — utiliser 🧹 par convention
- `fm-emojis.ts` est la liste curatée FM (pas de dépendance externe) — enrichir ici si besoin
- Quand on ajoute un nouveau composant affichant des tâches : toujours vérifier que le type source inclut `emoji: string | null` ET que la query/action le sélectionne
- Pattern d'affichage standard : `{item.emoji && <span className="mr-1.5">{item.emoji}</span>}` AVANT `{item.titre}`
- Les tâches créées avant la feature ont `emoji = null` → rien n'est affiché (comportement attendu)

---

## Changelog (2026-03-17 — session 3)

**Audit sécurité + performance + qualité — 14 corrections** :

- 🔴 **C1/C2** — Routes API S3 `/api/s3/presign-upload` et `/api/s3/presign-read` supprimées (non utilisées, tout passe par les server actions ; ces routes exposaient S3 sans vérification d'accès)
- 🔴 **C3** — `canManagePrestation` + `canArchiveDeletePrestation` : branche `prestataire` vérifiait seulement l'adhésion sans contrôler que le prestataire est bien lié au client via `clientPrestataireRelations` → bypass total sur toutes les prestations
- 🔴 **C4** — Canal Pusher terrain migré de `public` (non authentifié) vers `private-terrain-${occurrenceId}`. Création de `/api/pusher/auth-terrain` (POST, token-based via header `x-terrain-token`, valide `occurrenceFieldLinks`). `OccurrenceTerrain.tsx` instancie son propre `PusherClient` avec `channelAuthorization: { endpoint, headers: { "x-terrain-token": token } }`.
- 🟠 **C5** — Limite 2 pièces jointes par tâche vérifiée côté serveur dans `addTachePieceJointeFieldAction` (COUNT avant insertion)
- 🟠 **M1** — `CRON_SECRET` rendu `required()` dans `env.ts` + guard `401` explicite dans la route cron si secret absent/invalide
- 🟠 **M2** — `PUSHER_SECRET` : suppression du préfixe `NEXT_PUBLIC_` (qui l'exposait dans le bundle client) → renommé `PUSHER_SECRET` dans `env.ts` et `pusher.ts`
- 🟠 **M3** — N+1 query dans `getTicketMessagesWithAttachments` : remplacé `Promise.all(messages.map(...))` par une batch query `inArray(documentsLinks.ticketMessageId, messageIds)` + regroupement par `Map`
- 🟠 **M4** — `import "server-only"` ajouté en ligne 1 de `documents.query.ts`
- 🟠 **M5/M7** — `console.log` supprimés dans `s3.ts` et `terrain/not-found.tsx`
- 🟠 **M6** — `next/link` remplacé par `@/i18n/navigation` dans `terrain/not-found.tsx`
- 🟠 **M8** — 5 queries indépendantes dans `getClientPrestatairesAvecDetails` parallélisées avec `Promise.all`
- 🟡 **M9/N3** — 8 index DB manquants ajoutés + migration `0053_clammy_wallow.sql` : `serviceEntreprises.actif`, `sitesArborescence.profondeur`, `clientServiceOccurrences.createdAt`, `clientServiceOccurrences.started/done_by_field_session_id`, `occurrenceTaches.started/done_by_field_session_id`, `factureLigneAllocations.createdAt`
- 🟡 **N5** — Multi-JOIN sur `entreprises` dans `tickets.query.ts` utilisait `sql\`entreprises AS xxx\``(non typé) → remplacé par`alias(entreprises, "xxx")`de`drizzle-orm/pg-core`
- 🟡 **N7** — `useEffect` secondaire de `PrestationsClient.tsx` utilisait les propriétés individuelles de `searchParams` → remplacé par l'objet entier (fix navigation client-side bloquée)

**Nouveaux patterns** :

#### Pusher canaux privés terrain (token-based)

```typescript
// OccurrenceTerrain.tsx — créer un PusherClient dédié avec auth custom
const PusherClientClass = (await import("pusher-js")).default;
pusherInstance = new PusherClientClass(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  channelAuthorization: {
    endpoint: "/api/pusher/auth-terrain",
    transport: "ajax",
    headers: { "x-terrain-token": token },
  },
});
channel = pusherInstance.subscribe(`private-terrain-${occurrenceId}`);
```

- Utiliser `pusherInstance.disconnect()` dans le cleanup du useEffect
- Ne JAMAIS utiliser `import("@/lib/pusher")` pour le client terrain (ce fichier est le client authentifié standard)

#### Drizzle — Multi-JOIN sur la même table

```typescript
// ❌ FAUX — sql`alias` perd le typage Drizzle
.leftJoin(sql`entreprises AS demandeur_entreprise`, ...)
.orderBy(desc(sql`demandeur_entreprise.nom`)) // ← string non typée

// ✅ CORRECT — alias() de drizzle-orm/pg-core
import { alias } from "drizzle-orm/pg-core";
const demandeurEntreprise = alias(entreprises, "demandeur_entreprise");
const assigneEntreprise = alias(entreprises, "assigne_entreprise");
// Utiliser comme une vraie table Drizzle :
.leftJoin(demandeurEntreprise, eq(demandeurEntreprise.id, tickets.demandeurEntrepriseId))
.orderBy(desc(demandeurEntreprise.nom)) // ← typé
```

Déclarer les alias au **niveau module** (pas dans la fonction) pour éviter les recréations.

#### Pattern N+1 → batch query (listes avec attachements)

```typescript
// ❌ FAUX — N+1
const withAttachments = await Promise.all(
  messages.map(async (msg) => ({
    ...msg,
    attachments: await db.select(...).where(eq(..., msg.id)),
  }))
);

// ✅ CORRECT — 1 query + Map
const messageIds = messages.map((m) => m.id);
const allAttachments = messageIds.length > 0
  ? await db.select({ messageId: documentsLinks.ticketMessageId, ...fields })
      .from(documents)
      .innerJoin(documentsLinks, eq(documentsLinks.documentId, documents.id))
      .where(inArray(documentsLinks.ticketMessageId, messageIds))
  : [];
const byId = new Map<string, typeof allAttachments>();
for (const att of allAttachments) {
  if (!att.messageId) continue;
  if (!byId.has(att.messageId)) byId.set(att.messageId, []);
  byId.get(att.messageId)!.push(att);
}
return messages.map((m) => ({ ...m, attachments: byId.get(m.id) ?? [] }));
```

#### clientPrestataireRelations — check obligatoire pour prestataire gérant prestations client

```typescript
// Dans canManagePrestation, branche prestataire
const relation = await db.query.clientPrestataireRelations.findFirst({
  where: and(
    eq(
      clientPrestataireRelations.prestataireEntrepriseId,
      prestataireAdhesion.entrepriseId,
    ),
    eq(clientPrestataireRelations.clientEntrepriseId, entrepriseId),
  ),
  columns: { id: true },
});
if (!relation) return { allowed: false };
```

**Règle** : Un prestataire admin peut gérer les prestations d'un client **uniquement** s'il existe une entrée dans `clientPrestataireRelations`. Sans ce check, n'importe quel prestataire admin pouvait gérer toutes les prestations de tous les clients.

---

Pour toute question ou clarification, référez-vous d'abord aux implémentations de référence:

- `/services/[slug]/page.tsx` — Page dynamique Sanity avec metadata, generateStaticParams, PortableText
- `/blog/[slug]/[subSlug]/page.tsx` — Article Sanity avec hreflang bilingue
- `/services/page.tsx` — Page liste avec données Sanity + liens service×ville
- `src/sanity/queries.ts` — Toutes les GROQ queries (source de vérité Sanity)
- `src/lib/metadata/metadata-helpers.ts` — generateAlternates(), helpers SEO
- `src/redirects/` — Gestion des redirections SEO et slugs FR↔EN
- `src/middleware.ts` — Flux complet des redirections + next-intl
- Ce document CLAUDE.md — Patterns et bonnes pratiques
