import { expect, test } from "@playwright/test";
import {
  checkOptionIfPresent,
  dateInDays,
  fillIfPresent,
  nextStep,
  selectFirstIfPresent,
  signUp,
  simulateAllDocuments,
  skipStepIfOptional,
  uniqueEmail,
} from "./helpers";

/**
 * Parcours remplaçant :
 * inscription (rôle remplaçant) → onboarding statut « Chirurgien-dentiste
 * diplômé » (avec simulation des documents) → recherche d'annonces →
 * candidature → « Mes candidatures » avec statut « Envoyée ».
 */

test.describe("Parcours remplaçant", () => {
  test.describe.configure({ timeout: 300_000 });

  test("inscription, onboarding diplômé et candidature à une annonce", async ({
    page,
  }) => {
    const email = uniqueEmail("remplacant");
    const password = "MotDePasseE2E1!";

    /* ------------------------------ Inscription ----------------------------- */
    await signUp(page, {
      role: "replacement_dentist",
      firstName: "Julien",
      lastName: "Payet",
      email,
      password,
    });

    /* -------------------- Étape 1 — Statut professionnel --------------------- */
    await checkOptionIfPresent(page, "Chirurgien-dentiste diplômé");
    await nextStep(page);

    /* ------------------ Étape 2 — Informations personnelles ------------------ */
    await fillIfPresent(page, /prénom/i, "Julien");
    await fillIfPresent(page, /^nom/i, "Payet");
    await fillIfPresent(page, /date de naissance/i, "1990-05-12");
    await fillIfPresent(page, /téléphone/i, "0692123456");
    await fillIfPresent(page, /email/i, email);
    await fillIfPresent(page, /adresse/i, "8 avenue des Flamboyants");
    await fillIfPresent(page, /code postal/i, "97400");
    await fillIfPresent(page, /ville/i, "Saint-Denis");
    await selectFirstIfPresent(page, /territoire/i, "La Réunion");
    await fillIfPresent(
      page,
      /bio|présentation|présentez/i,
      "Chirurgien-dentiste diplômé depuis cinq ans, rigoureux et disponible rapidement.",
    );
    await nextStep(page);

    /* -------------- Étape 3 — Informations professionnelles (diplômé) -------- */
    await fillIfPresent(page, /rpps/i, "12345678901");
    await fillIfPresent(page, /conseil départemental/i, "La Réunion");
    await fillIfPresent(page, /année/i, "2021");
    await fillIfPresent(page, /université/i, "Université de Bordeaux");
    await selectFirstIfPresent(page, /mode d'exercice/i, "Autre");
    await fillIfPresent(page, /assureur/i, "MACSF");
    await fillIfPresent(page, /expiration/i, dateInDays(365));
    await nextStep(page);

    /* --------------------------- Étape 4 — Compétences ----------------------- */
    await checkOptionIfPresent(page, "Omnipratique");
    await fillIfPresent(page, /années d'expérience|expérience/i, "5");
    await checkOptionIfPresent(page, "Français");
    await nextStep(page);

    /* ---------------------------- Étape 5 — Mobilité ------------------------- */
    await skipStepIfOptional(page);

    /* -------------------------- Étape 6 — Disponibilités --------------------- */
    await skipStepIfOptional(page);

    /* --------------------------- Étape 7 — Préférences ----------------------- */
    await checkOptionIfPresent(page, "Remplacement libéral");
    await skipStepIfOptional(page);

    /* --------------------------- Étape 8 — Documents ------------------------- */
    await simulateAllDocuments(page);
    await nextStep(page);

    /* ------------------------- Étape 9 — Profil public ----------------------- */
    await page
      .getByRole("button", { name: /terminer|finaliser|valider/i })
      .first()
      .click()
      .catch(() => nextStep(page));

    /* ------------------------------ Confirmation ----------------------------- */
    await page
      .getByRole("link", { name: /accéder aux annonces/i })
      .or(page.getByRole("button", { name: /accéder aux annonces/i }))
      .first()
      .click();

    /* ------------------------ Recherche d'une annonce ------------------------ */
    const searchInput = page
      .getByRole("searchbox")
      .or(page.getByPlaceholder(/rechercher/i))
      .or(page.getByLabel(/rechercher/i))
      .first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill("Remplacement");
      await searchInput.press("Enter");
    }

    // Ouvre la première annonce de la liste.
    await page
      .getByRole("link", { name: /voir l'annonce|voir le détail/i })
      .first()
      .click()
      .catch(async () => {
        await page
          .getByRole("link", { name: /remplacement/i })
          .first()
          .click();
      });

    /* ------------------------------- Candidature ----------------------------- */
    await page
      .getByRole("button", { name: /candidater/i })
      .or(page.getByRole("link", { name: /candidater/i }))
      .first()
      .click();

    await page
      .getByLabel(/message|motivation/i)
      .first()
      .fill(
        "Bonjour, je suis disponible sur l'ensemble de la période et très motivé par votre annonce.",
      );
    await checkOptionIfPresent(page, "Je confirme ma disponibilité");
    await page
      .getByRole("checkbox", { name: /disponibilité/i })
      .check()
      .catch(() => {});
    await page
      .getByRole("checkbox", { name: /conditions/i })
      .check()
      .catch(() => {});

    await page
      .getByRole("button", { name: /envoyer/i })
      .first()
      .click();

    await expect(page.getByText(/candidature envoyée/i).first()).toBeVisible({
      timeout: 30_000,
    });

    /* --------------------------- « Mes candidatures » ------------------------ */
    await page
      .getByRole("link", { name: /mes candidatures/i })
      .first()
      .click()
      .catch(() => page.goto("/remplacant/candidatures"));

    await expect(page.getByText("Envoyée").first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
