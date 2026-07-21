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
 * Parcours cabinet complet :
 * inscription → onboarding 7 étapes (avec simulation des documents)
 * → confirmation → dashboard → publication d'une annonce → « Mes annonces ».
 *
 * Sélecteurs volontairement tolérants : getByLabel / getByRole avec les
 * libellés français des specs.
 */

test.describe("Parcours cabinet", () => {
  test.describe.configure({ timeout: 300_000 });

  test("inscription, onboarding complet et publication d'une annonce", async ({
    page,
  }) => {
    const email = uniqueEmail("cabinet");
    const password = "MotDePasseE2E1!";

    /* ------------------------------ Inscription ----------------------------- */
    await signUp(page, {
      role: "cabinet",
      firstName: "Claire",
      lastName: "Martin",
      email,
      password,
    });

    /* ----------------------- Étape 1 — Identité du responsable -------------- */
    await fillIfPresent(page, /prénom/i, "Claire");
    await fillIfPresent(page, /^nom/i, "Martin");
    await selectFirstIfPresent(page, /fonction/i, "Chirurgien-dentiste titulaire");
    await fillIfPresent(page, /téléphone/i, "0692123456");
    await fillIfPresent(page, /email/i, email);
    await nextStep(page);

    /* ----------------------- Étape 2 — Informations du cabinet -------------- */
    await fillIfPresent(page, /nom du cabinet/i, "Cabinet dentaire E2E");
    await selectFirstIfPresent(page, /type de structure/i, "Cabinet individuel");
    await fillIfPresent(page, /siret/i, "12345678901234");
    await fillIfPresent(page, /adresse/i, "12 rue des Dentistes");
    await fillIfPresent(page, /code postal/i, "75011");
    await fillIfPresent(page, /ville/i, "Paris");
    await fillIfPresent(page, /département/i, "Paris");
    await fillIfPresent(page, /région/i, "Île-de-France");
    await selectFirstIfPresent(page, /territoire/i, "France métropolitaine");
    await fillIfPresent(page, /téléphone/i, "0145123456");
    await fillIfPresent(page, /email/i, `contact.${email}`);
    await nextStep(page);

    /* --------------------------- Étape 3 — Présentation ---------------------- */
    await fillIfPresent(
      page,
      /description/i,
      "Cabinet moderne de deux praticiens, plateau technique récent, patientèle fidèle.",
    );
    await fillIfPresent(page, /praticiens/i, "2");
    await fillIfPresent(page, /assistant/i, "1");
    await fillIfPresent(page, /salles de soins/i, "2");
    await checkOptionIfPresent(page, "Français");
    await selectFirstIfPresent(page, /environnement/i, "Urbain");
    await nextStep(page);

    /* ---------------------- Étape 4 — Activités et équipements --------------- */
    await checkOptionIfPresent(page, "Omnipratique");
    await checkOptionIfPresent(page, "Panoramique");
    await nextStep(page);

    /* ------------------- Étape 5 — Photos (facultatives) --------------------- */
    await skipStepIfOptional(page);

    /* --------------------------- Étape 6 — Documents ------------------------- */
    await simulateAllDocuments(page);
    await nextStep(page);

    /* --------------------------- Étape 7 — Préférences ----------------------- */
    await page
      .getByRole("checkbox", { name: /conditions/i })
      .check()
      .catch(async () => {
        await page.getByText(/conditions de la phase de test/i).click();
      });
    await page
      .getByRole("button", { name: /terminer|finaliser|valider/i })
      .first()
      .click();

    /* ------------------------------ Confirmation ----------------------------- */
    await page
      .getByRole("link", { name: /accéder à mon espace/i })
      .or(page.getByRole("button", { name: /accéder à mon espace/i }))
      .first()
      .click();

    /* ------------------------- Publication d'une annonce --------------------- */
    await page
      .getByRole("link", { name: /publier une annonce/i })
      .or(page.getByRole("button", { name: /publier une annonce/i }))
      .first()
      .click();

    await fillIfPresent(page, /titre/i, "Remplacement omnipratique E2E");
    await selectFirstIfPresent(page, /motif/i, "Congés");
    await checkOptionIfPresent(page, "Libéral");
    await selectFirstIfPresent(page, /type de remplacement/i, "Ponctuel");
    await fillIfPresent(page, /date de début/i, dateInDays(30));
    await fillIfPresent(page, /date de fin/i, dateInDays(45));
    await selectFirstIfPresent(page, /rémunération/i, "À discuter");
    await fillIfPresent(
      page,
      /description/i,
      "Remplacement de deux semaines dans un cabinet moderne, patientèle agréable, assistante présente.",
    );

    await page
      .getByRole("button", { name: /publier l'annonce/i })
      .first()
      .click();

    /* ------------------------------ Vérification ----------------------------- */
    await page
      .getByRole("link", { name: /mes annonces/i })
      .first()
      .click()
      .catch(() => page.goto("/cabinet/annonces"));

    await expect(
      page.getByText("Remplacement omnipratique E2E").first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Publiée").first()).toBeVisible();
  });
});
