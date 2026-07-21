# DentMatch — Conventions pour le développement

## Contexte
MVP d'une plateforme de mise en relation cabinets dentaires ↔ chirurgiens-dentistes remplaçants (France + outre-mer). Next.js 16 App Router, TypeScript strict, Supabase, Tailwind v4, shadcn/ui. **Interface 100 % en français.**

## Règles impératives
- Server Components par défaut ; `"use client"` uniquement si nécessaire (formulaires, interactivité).
- Mutations via les Server Actions existantes dans `src/app/actions/*` — NE PAS créer de nouvelles mutations sans raison ; les réutiliser.
- Formulaires : React Hook Form + zodResolver avec les schémas de `src/lib/validation/*`.
- Toasts : `toast.success/error` de `sonner` (Toaster déjà monté dans le layout racine).
- Jamais de secrets côté client. Client Supabase navigateur : `createClient()` de `@/lib/supabase/client`. Serveur : `@/lib/supabase/server`.
- Types base de données : `Tables<"...">`, `Enums<"...">` depuis `@/types/database`.
- Libellés/catalogues : TOUJOURS depuis `@/lib/data/reference` (SPECIALTIES, TERRITORIES, STATUS_LABELS, etc.). Ne jamais coder en dur un libellé de statut.
- Constantes produit : `@/lib/constants` (APP_NAME, LEGAL_DISCLAIMER, DEMO_DISCLAIMER, DEMO_MODE, DEMO_ACCOUNTS…). Ne jamais écrire "DentMatch" en dur : utiliser APP_NAME.
- Ne JAMAIS écrire « agréé par l'Ordre », « validation officielle », « conformité garantie ». Utiliser « vérifié par DentMatch », « informations déclarées », « document simulé », « vérification en attente ».
- Dates : `date-fns` avec `{ locale: fr }` (`format(new Date(d), "d MMMM yyyy", { locale: fr })`).
- Icônes : lucide-react uniquement, jamais d'emojis comme icônes.
- Chaque page gère : chargement (`loading.tsx` avec `LoadingSkeleton`), vide (`EmptyState`), erreur (`ErrorState`).
- Accessibilité : labels sur les inputs, aria-label sur les boutons icône, focus visibles.
- Mobile-first : tableaux → cartes sur mobile, filtres dans un Sheet, pas de débordement horizontal.

## Design
- Tokens Tailwind (déjà définis) : `bg-background` (blanc cassé), `bg-card` (blanc), `text-foreground`, `text-muted-foreground`, `bg-primary` (bleu ardoise profond), couleurs custom : `bg-verified`, `bg-verified-soft`, `text-warning-foreground`, `bg-warning-soft`.
- Titres : h1/h2/h3 utilisent automatiquement `font-display` (Bricolage Grotesque). Corps : Inter.
- Cartes : `rounded-xl border bg-card`, ombres légères, grands espaces. Transitions courtes (150–300 ms), pas d'animations lourdes, pas de gradients criards.
- En-têtes de page dashboard : `<h1 className="text-2xl font-semibold tracking-tight">` + sous-titre `text-sm text-muted-foreground`.

## Composants existants (réutiliser, ne pas recréer)
- `@/components/ui/*` : shadcn (button, input, card, dialog, select, tabs, badge, avatar, form, label, textarea, checkbox, radio-group, switch, progress, skeleton, sheet, separator, alert, alert-dialog, calendar, popover, scroll-area, table, sonner, tooltip, collapsible). Button sizes : default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg.
- `@/components/shared/logo` : `Logo`, `LogoMark`
- `@/components/shared/empty-state` : `EmptyState` ({icon?, title, description?, action?})
- `@/components/shared/error-state` : `ErrorState`
- `@/components/shared/loading-skeleton` : `LoadingSkeleton` ({rows?}), `StatsSkeleton`
- `@/components/shared/status-badge` : `JobPostStatusBadge`, `ApplicationStatusBadge`, `DocumentStatusBadge`, `PlacementStatusBadge`, `SimulatedBadge`
- `@/components/shared/verification-badge` : `VerificationBadge` ({status, short?})
- `@/components/shared/confirm-dialog` : `ConfirmDialog` ({trigger, title, description, confirmLabel?, destructive?, onConfirm})
- `@/components/shared/profile-completion` : `ProfileCompletion` ({value, label?})
- `@/components/dashboard/shell` : `DashboardShell` ({profile, navItems, profileHref, children}) — coque des espaces connectés
- `@/components/dashboard/nav-items` : `CABINET_NAV`, `REPLACEMENT_NAV`, `ADMIN_NAV`
- `@/components/documents/document-manager` : `DocumentManager` ({definitions, documents, ownerType}) — gère téléversement, simulation, suppression, téléchargement

## Auth / accès
- `requireRole("cabinet" | "replacement_dentist" | "admin")` et `requireUser()` de `@/lib/auth` dans les pages serveur ; le middleware protège déjà les routes et cloisonne les rôles.
- `getCurrentProfile()` pour lire le profil courant.

## Server Actions disponibles (src/app/actions/)
- `auth.ts` : signUp, signIn, signOut, forgotPassword, resetPassword
- `documents.ts` : uploadDocument(FormData), simulateDocument, deleteDocument, getDocumentDownloadUrl
- `job-posts.ts` : createJobPost(input, publish), updateJobPost, changeJobPostStatus, duplicateJobPost, deleteJobPost
- `applications.ts` : applyToJobPost, withdrawApplication, markApplicationViewed, rejectApplication, acceptApplication(id, markFilled), openApplicationConversation, updatePlacementChecklist, toggleSavedJobPost
- `messages.ts` : sendMessage, markConversationRead
- `notifications.ts` : markNotificationRead, markAllNotificationsRead
- `admin.ts` : adminVerifyDocument, adminRejectDocument, adminSuspendJobPost, adminSetProfileVerification
- `settings.ts` : updateNotificationPreferences, exportMyData, deleteMyAccount, uploadPublicPhoto(FormData), deleteCabinetPhoto
- `onboarding-cabinet.ts` / `onboarding-remplacant.ts` : sauvegarde par étape + finish

Toutes renvoient `{ error?: string; success?: boolean; ... }` (sauf redirections).

## Règles métier (src/lib/business-rules.ts)
canApply, canApplyToSpecialty, canWithdrawApplication, canAcceptApplication, isPostOpenForApplications, requiredDocumentsComplete, computeProfileCompletion — utilisées côté serveur ET pour l'affichage conditionnel côté client.

## Vérification
Après tes modifications : `npx tsc --noEmit` et `npm run lint` doivent passer sur TES fichiers (des erreurs dans des fichiers hors de ton périmètre peuvent exister pendant le développement parallèle — ignore-les mais signale-les).
