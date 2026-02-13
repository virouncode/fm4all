# FM4ALL - Guide de Développement pour Claude

> **Note Importante**: Ce projet est en refonte. Les anciens fichiers (ex: providers de services individuels) ne doivent PAS être pris comme référence. Utilisez uniquement la nouvelle architecture décrite ci-dessous.

## Vue d'Ensemble du Projet

**FM4ALL** est une plateforme de devis pour services de facility management (nettoyage, hygiène, boissons, maintenance, etc.). La plateforme permet aux utilisateurs de:
1. Spécifier leurs locaux/sites
2. Sélectionner et configurer des services
3. Obtenir des devis avec tarification temps réel
4. Gérer l'ensemble du cycle de vie d'un devis

**Système Multi-Rôles**:
- **Client**: Demande des devis, gère ses sites
- **Prestataire**: Gère ses interventions, planning
- **Plateforme**: Administration globale, pilotage

Le système utilise un concept de **"posture"** (rôle actif) pour permettre aux utilisateurs ayant plusieurs rôles de basculer entre eux.

---

## Stack Technique

### Frontend
- **Next.js 14+** avec App Router
- **TypeScript** (strict mode)
- **React 18** avec Server & Client Components
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **next-intl** pour l'internationalisation (FR/EN)

### Backend
- **Drizzle ORM** avec PostgreSQL
- **next-safe-action** pour les Server Actions sécurisées
- **Zod** pour la validation de schémas
- **Pusher** pour les mises à jour temps réel
- **Sanity CMS** pour le contenu

### Outils de Développement
- **pnpm** comme gestionnaire de paquets
- **Vitest** pour les tests
- **ESLint** + **Prettier** pour le linting

---

## Architecture de Référence: `/app/sites`

La nouvelle architecture du projet est exemplifiée dans `/app/sites`. **Utilisez cette structure comme modèle pour toutes les nouvelles fonctionnalités**.

### Structure des Dossiers

```
src/
├── app/[locale]/(main)/(application)/(portail)/app/
│   └── sites/                              # Feature complète
│       ├── page.tsx                        # Page serveur
│       ├── SitesClient.tsx                 # Composant client principal
│       ├── SiteFormDialog.tsx              # Formulaire create/edit
│       ├── SiteDeleteDialog.tsx            # Confirmation suppression
│       ├── SiteDetails.tsx                 # Vue détails
│       ├── SitesTree.tsx                   # Arbre hiérarchique
│       └── helpers.ts                      # Utilitaires locaux
│
├── server/
│   ├── actions/
│   │   └── sitesActions.ts                 # Server Actions (mutations)
│   ├── queries/
│   │   └── sitesQueries.ts                 # Queries en lecture seule
│   └── utils/
│       └── sitesArborescence.utils.ts      # Logique métier complexe
│
├── zod-schemas/
│   ├── sites.schema.ts                     # Schemas Zod + types
│   └── enums.ts                            # Enums réutilisables
│
├── db/
│   └── schema/
│       └── sites.ts                        # Schéma Drizzle
│
└── components/
    ├── rhf/                                # Composants React Hook Form
    │   ├── RhfInput.tsx
    │   ├── RhfControlledSelect.tsx
    │   └── RhfTextArea.tsx
    └── ui/                                 # Composants shadcn/ui
```

---

## Patterns et Conventions

### 1. Schemas Zod

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
  surface: z.string().min(1),  // String dans le form, Number dans l'action
  // ...
});
export type InsertSiteFormType = z.infer<typeof insertSiteFormSchema>;

// 3. Schema UPDATE (modification)
export const updateSiteFormSchema = insertSiteFormSchema.extend({
  id: z.string(),
  surface: z.string().optional(),  // Champs optionnels en update
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
  .schema(insertSiteFormSchema.extend({
    entrepriseId: z.string(),
    parentId: z.string().nullable(),
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { currentUser } = ctx;

    // TOUJOURS utiliser des transactions pour les mutations multi-tables
    const insertedSite = await db.transaction(async (tx) => {
      // 1. INSERT principal
      const [site] = await tx.insert(sites).values({
        nom: parsedInput.nom,
        surface: Number(parsedInput.surface),  // Conversion ici
        entrepriseId: parsedInput.entrepriseId,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      }).returning();

      // 2. INSERT relations (ex: closure table)
      await insertSiteArborescence({
        entrepriseId: parsedInput.entrepriseId,
        siteId: site.id,
        parentId: parsedInput.parentId,
        userId: currentUser.id,
        tx,  // Passer la transaction
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

type DbOrTransaction = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

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
  tx?: DbOrTransaction;  // Optionnel mais recommandé
}) {
  const dbClient = tx || db;  // Utiliser tx si fourni

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
- `RhfControlledSelect` - Select avec Radix UI
- `RhfTextArea` - Textarea
- `RhfCheckbox`, `RhfSwitch`, etc.

**Convention**:
- Typer les composants RHF: `RhfInput<FormType>`
- Utiliser `useFormState` pour `isSubmitting` et `isDirty`
- Désactiver submit si `isSubmitting || !isDirty`
- Reset le form dans un `useEffect` quand le dialog s'ouvre

### 6. Internationalisation (next-intl)

**RÈGLE CRITIQUE**:
```typescript
// ✅ TOUJOURS utiliser
import { Link, usePathname, useRouter } from "@/i18n/navigation";

// ❌ JAMAIS utiliser
import { usePathname } from "next/navigation";  // Retourne pathname avec locale!
import Link from "next/link";  // Ne gère pas l'i18n!
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

### 2. Closure Table pour Hiérarchies

Le projet utilise une **closure table** pour gérer les hiérarchies de sites:

```typescript
// Table sites_arborescence
{
  ancetreId: string;      // ID de l'ancêtre
  descendantId: string;   // ID du descendant
  profondeur: number;     // Distance (0 = lui-même, 1 = enfant direct)
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

```typescript
// Pattern: Check permission dans Server Actions
export const getUsersAction = action
  .schema(getUsersSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { currentUser } = ctx;

    // ✅ TOUJOURS vérifier l'accès via getUserAdhesion
    const { getUserAdhesion } = await import("@/server/queries/userAdhesions.query");
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
- ✓ Un caractère spécial (!@#$%^&*(),.?":{}|<>)

**Composant**: Affiche barre de progression (rouge → jaune → vert) + checklist des critères

### 7. Configuration Email

**RÈGLE**: Ne JAMAIS hardcoder d'adresses email dans le code

```typescript
// ❌ FAUX
const base = {
  from: `fm4all <noreply@mg.fm4all.com>`,
  to: [to],
  bcc: ["viroun@fm4all.com"],  // ❌ Hardcodé!
  subject,
};

// ✅ CORRECT
const bccEmail = process.env.MAILGUN_BCC_EMAIL;

const base = {
  from: `fm4all: Le Facility Management pour tous <noreply@mg.fm4all.com>`,
  to: [to],
  ...(bccEmail ? { bcc: [bccEmail] } : {}),  // ✅ Optionnel depuis env
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
    return { users };  // ❌ Bypass de sécurité!
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
  await bootstrap();  // ❌ Trop lourd, pas nécessaire!
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

# Drizzle
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

**Dernière mise à jour**: 2026-02-12

Pour toute question ou clarification, référez-vous d'abord aux implémentations de référence:
- `/app/sites` - Gestion hiérarchique avec closure table
- `/app/utilisateurs` - Système de permissions & attributions
- Ce document CLAUDE.md - Patterns et bonnes pratiques
