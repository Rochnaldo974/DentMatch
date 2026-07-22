# DentMatch

Plateforme MVP de mise en relation entre **cabinets dentaires** et **chirurgiens-dentistes remplaçants**, en France métropolitaine et dans les territoires d'outre-mer.

> **MVP de démonstration.** Les vérifications et documents simulés servent uniquement à tester le parcours. DentMatch est une plateforme de mise en relation : elle ne remplace pas les démarches réglementaires, ordinales, contractuelles, sociales ou assurantielles nécessaires à la réalisation d'un remplacement.

## Fonctionnalités

- Landing page publique + pages légales (contenus provisoires)
- Authentification email / mot de passe (Supabase Auth), récupération de mot de passe
- Onboarding cabinet en 7 étapes (identité, cabinet, présentation, activités, photos, documents, préférences)
- Onboarding remplaçant en 9 étapes, conditionnel selon le statut (diplômé / étudiant autorisé / interne)
- Téléversement de documents **ou** bouton « Simuler un document valide » (mode démo, badge « Document simulé »)
- Publication d'annonces de remplacement (brouillon / publication / duplication / archivage)
- Recherche d'annonces avec filtres (territoire, région, dates, spécialité, contrat, urgence…) et tri
- Candidatures (message de motivation, retrait, statuts), règles métier étudiant/interne/spécialités
- Acceptation transactionnelle : candidature acceptée → remplacement (placement) + conversation + notification + audit
- Messagerie temps réel (Supabase Realtime), notifications in-app avec compteur non lu
- Checklist administrative indicative par remplacement
- Interface admin minimale (utilisateurs, documents, annonces, audit)
- RLS strict sur toutes les tables, buckets Storage public/privé, URLs signées
- Marché de lancement **La Réunion** : constante `LAUNCH_MARKET` dans `src/lib/constants.ts` (communes et zones de mobilité de l'île dans `src/lib/data/reference.ts`)

## Stack

Next.js (App Router) · TypeScript strict · React · Supabase (Auth, PostgreSQL, Storage, Realtime) · Tailwind CSS v4 · shadcn/ui · Lucide · React Hook Form · Zod · date-fns · Sonner.

## Prérequis

- Node.js ≥ 20 et npm
- Un projet [Supabase](https://supabase.com) (le projet de développement `DentMatch` est déjà provisionné)

## Installation

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
```

### Variables d'environnement (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (Dashboard → Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique `anon` — **jamais** la clé `service_role` |
| `NEXT_PUBLIC_DEMO_MODE` | `true` pour activer le mode démonstration (boutons de simulation et comptes démo) |
| `NEXT_PUBLIC_SITE_URL` | URL du site pour les redirections auth (`http://localhost:3000` en local) |

## Configuration Supabase

### 1. Base de données

Appliquer les migrations SQL de `supabase/migrations/` **dans l'ordre** (SQL Editor du dashboard, ou `supabase db push` avec la CLI) :

1. `0001_schema.sql` — tables, enums, triggers, index, Realtime
2. `0002_rls.sql` — Row Level Security, policies, vue publique des candidats
3. `0003_functions.sql` — notifications automatiques + fonction transactionnelle `accept_application`
4. `0004_storage.sql` — buckets `public-media` (public) et `private-documents` (privé) + policies
5. `0005_account_deletion.sql` — suppression de compte RGPD

> Sur le projet de développement, ces migrations sont **déjà appliquées**.

### 2. Authentification

Dans **Authentication → Sign In / Providers → Email** : désactiver **Confirm email** pour la phase de test (sinon chaque inscription exige un clic dans l'email de confirmation). Dans **Authentication → URL Configuration**, ajouter `http://localhost:3000/auth/callback` aux Redirect URLs.

### 3. Données de démonstration

Exécuter `supabase/seed.sql` dans le SQL Editor (déjà appliqué sur le projet de développement). Il crée des identités **fictives** : 5 cabinets réunionnais (Saint-Pierre, Saint-Paul, Saint-Denis, Le Tampon, Saint-André) et 4 remplaçants installés sur l'île (2 diplômés, 1 étudiant, 1 interne), 1 admin, 6 annonces, 5 candidatures dont 1 acceptée avec remplacement, conversation et messages.

## Commandes

```bash
npm run dev        # serveur de développement (http://localhost:3000)
npm run build      # build de production
npm start          # serveur de production
npm run lint       # ESLint
npx tsc --noEmit   # vérification TypeScript
npm test           # tests unitaires (Vitest)
npm run test:e2e   # tests end-to-end (Playwright — voir e2e/README.md)
```

## Comptes de démonstration

> Mots de passe de démonstration **uniquement pour l'environnement de test**. Ne jamais réutiliser en production.

| Rôle | Email | Mot de passe |
|---|---|---|
| Cabinet (Saint-Pierre) | `demo.cabinet@dentmatch.example` | `DemoCabinet2026!` |
| Cabinet (Saint-Paul) | `cabinet.saintpaul@dentmatch.example` | `DemoCabinet2026!` |
| Cabinet (Saint-Denis) | `cabinet.reunion@dentmatch.example` | `DemoCabinet2026!` |
| Cabinet (Le Tampon) | `cabinet.tampon@dentmatch.example` | `DemoCabinet2026!` |
| Cabinet (Saint-André) | `cabinet.saintandre@dentmatch.example` | `DemoCabinet2026!` |
| Remplaçante diplômée (Saint-Denis) | `demo.remplacant@dentmatch.example` | `DemoRemplacant2026!` |
| Étudiant autorisé (Le Tampon) | `remplacant.etudiant@dentmatch.example` | `DemoRemplacant2026!` |
| Interne ODF (Saint-Pierre) | `remplacant.interne@dentmatch.example` | `DemoRemplacant2026!` |
| Remplaçant diplômé (Saint-Paul) | `remplacant.marseille@dentmatch.example` | `DemoRemplacant2026!` |
| Administrateur | `admin@dentmatch.example` | `AdminDemo2026!` |

Avec `NEXT_PUBLIC_DEMO_MODE=true`, la page `/connexion` affiche deux boutons « Tester comme cabinet » / « Tester comme remplaçant » qui préremplissent ces identifiants.

## Parcours de test rapide

1. Connectez-vous comme **cabinet** → dashboard → « Candidatures » → acceptez la candidature en attente → la conversation s'ouvre, le remplacement apparaît dans « Remplacements ».
2. Connectez-vous comme **remplaçant** → « Rechercher » → filtrez (ex. territoire La Réunion) → ouvrez une annonce → « Candidater ».
3. Ou créez deux comptes neufs par email/mot de passe et déroulez les onboardings complets avec « Simuler un document valide ».

## Limites connues du MVP

- Les emails transactionnels ne sont pas envoyés (abstraction `EmailProvider` prête pour Resend) ; seules les notifications in-app fonctionnent.
- Pas de paiement, signature électronique, génération de contrat, vérification RPPS réelle, Pro Santé Connect, ni intégration Ordre/URSSAF/Assurance Maladie.
- La « vérification » des profils et documents est déclarative ou simulée (badge explicite) — aucune valeur officielle.
- Recherche géographique par territoire/région/département uniquement (pas de rayon kilométrique réel ni de carte).
- La checklist administrative des remplacements est indicative et manuelle.
- Contenus juridiques provisoires, à faire valider par un professionnel du droit avant mise en production.
- Le mode sombre est préparé dans les tokens CSS mais non finalisé.
- Les tests E2E Playwright nécessitent la désactivation de la confirmation d'email (voir `e2e/README.md`).

## Architecture

```
src/
  app/                  # App Router (pages, layouts, server actions)
    actions/            # Mutations (Server Actions) validées Zod
    cabinet/  remplacant/  admin/  messages/  notifications/  parametres/
    onboarding/  (auth)/  auth/callback/
  components/
    ui/                 # shadcn/ui
    shared/             # EmptyState, badges, ConfirmDialog…
    dashboard/          # Shell, sidebar, notifications
    onboarding/  cabinet/  remplacant/  job-posts/  applications/  messaging/  admin/  landing/
  lib/
    supabase/           # clients navigateur / serveur / middleware
    validation/         # schémas Zod (client + serveur)
    data/reference.ts   # catalogues (territoires, spécialités, documents…)
    business-rules.ts   # règles métier pures et testées
supabase/
  migrations/           # 0001 → 0005
  seed.sql              # données de démonstration
tests/unit/             # Vitest
e2e/                    # Playwright
```
