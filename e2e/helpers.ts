import { expect, type Page } from "@playwright/test";

/** Génère une adresse email unique pour chaque exécution de test. */
export function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}@e2e.dentmatch.test`;
}

export type SignUpParams = {
  role: "cabinet" | "replacement_dentist";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/**
 * Déroule le formulaire d'inscription (/inscription) :
 * sélection de la carte de rôle, champs identité, mot de passe,
 * acceptation des conditions puis soumission.
 */
export async function signUp(page: Page, params: SignUpParams): Promise<void> {
  await page.goto("/inscription");

  // Sélection de la carte de rôle par son libellé français.
  const roleText =
    params.role === "cabinet"
      ? "Cabinet dentaire"
      : "Chirurgien-dentiste remplaçant";
  await page.getByText(roleText, { exact: false }).first().click();

  await page.getByLabel(/prénom/i).fill(params.firstName);
  await page.getByLabel(/^nom/i).fill(params.lastName);
  await page.getByLabel(/email/i).first().fill(params.email);
  await page
    .getByLabel(/^mot de passe/i)
    .first()
    .fill(params.password);
  await page.getByLabel(/confirm/i).fill(params.password);

  // Acceptation des conditions.
  await page
    .getByRole("checkbox", { name: /conditions/i })
    .check()
    .catch(async () => {
      // Repli : checkbox shadcn rendue comme bouton ou label cliquable.
      await page.getByText(/j'accepte les conditions/i).click();
    });

  await page
    .getByRole("button", { name: /créer mon compte|s'inscrire|inscription/i })
    .click();

  // L'inscription doit quitter la page /inscription (redirection onboarding).
  await expect(page).not.toHaveURL(/\/inscription$/, { timeout: 30_000 });
}

/**
 * Sur l'étape « Documents » d'un onboarding, clique tous les boutons
 * « Simuler un document valide » et attend les badges « Document simulé ».
 */
export async function simulateAllDocuments(page: Page): Promise<void> {
  const simulateButton = page.getByRole("button", {
    name: /simuler un document valide/i,
  });
  const total = await simulateButton.count();
  for (let i = 0; i < total; i++) {
    // La liste se re-rend après chaque simulation : on clique toujours
    // le premier bouton restant.
    await simulateButton.first().click();
    await expect(page.getByText(/document simulé/i).nth(i)).toBeVisible({
      timeout: 15_000,
    });
  }
}

/** Clique le bouton « Continuer » / « Suivant » d'une étape d'onboarding. */
export async function nextStep(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: /continuer|suivant|étape suivante/i })
    .first()
    .click();
}

/** Date au format YYYY-MM-DD, décalée de `days` jours. */
export function dateInDays(days: number): string {
  const d = new Date(Date.now() + days * 24 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

/** Remplit un champ par label s'il est présent et éditable. */
export async function fillIfPresent(
  page: Page,
  label: RegExp,
  value: string,
): Promise<void> {
  const field = page.getByLabel(label).first();
  if (await field.isVisible().catch(() => false)) {
    await field.fill(value).catch(() => {});
  }
}

/**
 * Ouvre un select (shadcn = bouton combobox) repéré par label
 * et choisit l'option donnée, si le champ existe.
 */
export async function selectFirstIfPresent(
  page: Page,
  label: RegExp,
  optionText: string,
): Promise<void> {
  const combo = page
    .getByLabel(label)
    .or(page.getByRole("combobox", { name: label }))
    .first();
  if (!(await combo.isVisible().catch(() => false))) return;
  await combo.click();
  await page
    .getByRole("option", { name: optionText })
    .first()
    .click()
    .catch(async () => {
      // Repli : select natif.
      await combo.selectOption({ label: optionText }).catch(() => {});
    });
}

/** Coche une case / un bouton d'option identifié par son libellé, si présent. */
export async function checkOptionIfPresent(
  page: Page,
  label: string,
): Promise<void> {
  const checkbox = page
    .getByRole("checkbox", { name: label })
    .or(page.getByRole("radio", { name: label }))
    .first();
  if (await checkbox.isVisible().catch(() => false)) {
    await checkbox.check().catch(() => checkbox.click());
    return;
  }
  const text = page.getByText(label, { exact: true }).first();
  if (await text.isVisible().catch(() => false)) {
    await text.click().catch(() => {});
  }
}

/** Passe une étape facultative (« Passer » / « Ignorer ») si elle se présente. */
export async function skipStepIfOptional(page: Page): Promise<void> {
  const skip = page
    .getByRole("button", { name: /passer|ignorer|plus tard/i })
    .first();
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  } else {
    await nextStep(page);
  }
}
