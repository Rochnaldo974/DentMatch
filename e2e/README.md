# Tests end-to-end (Playwright)

Ces tests déroulent les deux parcours critiques du MVP contre une vraie instance :

- `cabinet.spec.ts` — inscription cabinet → onboarding complet (documents simulés) → publication d'une annonce → vérification dans « Mes annonces ».
- `remplacant.spec.ts` — inscription remplaçant → onboarding conditionnel (documents simulés) → recherche → candidature → vérification dans « Mes candidatures ».

## Prérequis

1. Un projet Supabase configuré (`.env.local` renseigné) avec les migrations appliquées.
2. **Confirmation d'email désactivée** dans Supabase : Dashboard → Authentication → Sign In / Providers → Email → décocher **Confirm email**. Sans cela, l'inscription attend un clic dans un email et les tests échouent.
3. `NEXT_PUBLIC_DEMO_MODE=true` (les tests utilisent les boutons « Simuler un document valide »).
4. Navigateur Playwright installé :

```bash
npx playwright install chromium
```

## Exécution

```bash
npm run test:e2e
```

Le serveur de développement est démarré automatiquement par Playwright (`webServer` dans `playwright.config.ts`) s'il ne tourne pas déjà.

Chaque exécution crée des comptes jetables (`e2e-…@dentmatch.example`) dans la base : pensez à purger périodiquement en environnement de test.
