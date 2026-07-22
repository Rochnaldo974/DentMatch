import { describe, expect, it } from "vitest";
import { signUpSchema } from "@/lib/validation/auth";
import { jobPostSchema } from "@/lib/validation/job-post";
import { applicationSchema } from "@/lib/validation/application";
import { cabinetStep2Schema } from "@/lib/validation/onboarding-cabinet";
import {
  availabilitySchema,
  studentStep3Schema,
} from "@/lib/validation/onboarding-remplacant";

describe("signUpSchema", () => {
  const valid = {
    firstName: "Marie",
    lastName: "Durand",
    email: "marie.durand@example.fr",
    password: "MotDePasse1!",
    confirmPassword: "MotDePasse1!",
    role: "cabinet",
    acceptTerms: true,
  };

  it("valide le cas nominal", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("rejette des mots de passe différents", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      confirmPassword: "AutreMotDePasse1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe de moins de 8 caractères", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: "Court1!",
      confirmPassword: "Court1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejette une adresse email invalide", () => {
    expect(
      signUpSchema.safeParse({ ...valid, email: "pas-un-email" }).success,
    ).toBe(false);
  });

  it("rejette des conditions non acceptées", () => {
    expect(
      signUpSchema.safeParse({ ...valid, acceptTerms: false }).success,
    ).toBe(false);
  });

  it("rejette un rôle hors énumération (admin non inscriptible)", () => {
    expect(signUpSchema.safeParse({ ...valid, role: "admin" }).success).toBe(
      false,
    );
  });
});

describe("jobPostSchema", () => {
  // Dates dynamiques pour rester valides quelle que soit la date d'exécution.
  const inDays = (n: number) =>
    new Date(Date.now() + n * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const valid = {
    title: "Remplacement omnipratique — juillet",
    replacementReason: "conges",
    contractType: "liberal",
    replacementType: "ponctuel",
    startDate: inDays(30),
    endDate: inDays(60),
    compensationType: "retrocession",
    compensationValue: 55,
    description:
      "Remplacement d'un mois dans un cabinet moderne, patientèle fidèle et équipe accueillante.",
  };

  it("valide le cas nominal (création d'annonce)", () => {
    const result = jobPostSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepte une date limite valide (future et avant le début)", () => {
    const result = jobPostSchema.safeParse({
      ...valid,
      applicationDeadline: inDays(15),
    });
    expect(result.success).toBe(true);
  });

  it("rejette une date de fin antérieure à la date de début", () => {
    const result = jobPostSchema.safeParse({
      ...valid,
      startDate: inDays(60),
      endDate: inDays(30),
    });
    expect(result.success).toBe(false);
  });

  it("rejette une date limite de candidature postérieure au début", () => {
    const result = jobPostSchema.safeParse({
      ...valid,
      applicationDeadline: inDays(45),
    });
    expect(result.success).toBe(false);
  });

  it("rejette une date limite de candidature déjà passée", () => {
    const result = jobPostSchema.safeParse({
      ...valid,
      applicationDeadline: "1995-07-25",
    });
    expect(result.success).toBe(false);
  });

  it("rejette une description de moins de 20 caractères", () => {
    expect(
      jobPostSchema.safeParse({ ...valid, description: "Trop court" }).success,
    ).toBe(false);
  });

  it("rejette un nombre de postes hors bornes (0 ou 11)", () => {
    expect(
      jobPostSchema.safeParse({ ...valid, positionsCount: 0 }).success,
    ).toBe(false);
    expect(
      jobPostSchema.safeParse({ ...valid, positionsCount: 11 }).success,
    ).toBe(false);
  });

  it("accepte une rémunération sans montant uniquement pour « à discuter »", () => {
    const withoutValue: Record<string, unknown> = { ...valid };
    delete withoutValue.compensationValue;
    expect(
      jobPostSchema.safeParse({ ...withoutValue, compensationType: "a_discuter" })
        .success,
    ).toBe(true);
    // Rétrocession sans montant : refusé.
    expect(jobPostSchema.safeParse(withoutValue).success).toBe(false);
  });

  it("rejette un montant hors fourchette réaliste (garde-fous marché)", () => {
    // Forfait de 50 € / jour : irréaliste, refusé.
    expect(
      jobPostSchema.safeParse({
        ...valid,
        compensationType: "forfait_journalier",
        compensationValue: 50,
      }).success,
    ).toBe(false);
    // Rétrocession 150 % : impossible, refusée.
    expect(
      jobPostSchema.safeParse({ ...valid, compensationValue: 150 }).success,
    ).toBe(false);
    // Forfait de 450 € / jour : réaliste, accepté.
    expect(
      jobPostSchema.safeParse({
        ...valid,
        compensationType: "forfait_journalier",
        compensationValue: 450,
      }).success,
    ).toBe(true);
  });
});

describe("applicationSchema", () => {
  const valid = {
    message:
      "Diplômée depuis cinq ans, je suis disponible sur toute la période indiquée.",
    confirmedAvailability: true,
    acceptTerms: true,
  };

  it("valide le cas nominal (candidature)", () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejette un message de motivation de moins de 30 caractères", () => {
    expect(
      applicationSchema.safeParse({ ...valid, message: "Bonjour" }).success,
    ).toBe(false);
  });

  it("rejette une disponibilité non confirmée", () => {
    expect(
      applicationSchema.safeParse({ ...valid, confirmedAvailability: false })
        .success,
    ).toBe(false);
  });

  it("rejette des conditions non acceptées", () => {
    expect(
      applicationSchema.safeParse({ ...valid, acceptTerms: false }).success,
    ).toBe(false);
  });
});

describe("cabinetStep2Schema", () => {
  const valid = {
    name: "Cabinet dentaire du Port",
    structureType: "cabinet_individuel",
    siret: "12345678901234",
    finess: "",
    addressLine1: "12 rue des Dentistes",
    postalCode: "97420",
    city: "Le Port",
    department: "La Réunion",
    region: "La Réunion",
    territory: "La Réunion",
    phone: "+262 692 12 34 56",
    email: "cabinet@example.fr",
  };

  it("valide le cas nominal (FINESS vide accepté)", () => {
    expect(cabinetStep2Schema.safeParse(valid).success).toBe(true);
  });

  it("rejette un SIRET qui ne fait pas 14 chiffres", () => {
    expect(
      cabinetStep2Schema.safeParse({ ...valid, siret: "123456789" }).success,
    ).toBe(false);
    expect(
      cabinetStep2Schema.safeParse({ ...valid, siret: "1234567890123A" })
        .success,
    ).toBe(false);
  });

  it("rejette un code postal invalide", () => {
    expect(
      cabinetStep2Schema.safeParse({ ...valid, postalCode: "9742" }).success,
    ).toBe(false);
    expect(
      cabinetStep2Schema.safeParse({ ...valid, postalCode: "ABCDE" }).success,
    ).toBe(false);
  });
});

describe("studentStep3Schema (statut étudiant verrouillé)", () => {
  const valid = {
    university: "Université de Bordeaux",
    studentYear: "6",
    fifthYearValidated: true,
    hasCsct: true,
    csctDate: "2025-09-15",
    licenseExpirationDate: "2026-12-31",
  };

  it("valide le cas nominal", () => {
    expect(studentStep3Schema.safeParse(valid).success).toBe(true);
  });

  it("rejette fifthYearValidated=false", () => {
    expect(
      studentStep3Schema.safeParse({ ...valid, fifthYearValidated: false })
        .success,
    ).toBe(false);
  });

  it("rejette hasCsct=false", () => {
    expect(
      studentStep3Schema.safeParse({ ...valid, hasCsct: false }).success,
    ).toBe(false);
  });
});

describe("availabilitySchema", () => {
  it("rejette une disponibilité récurrente sans jours", () => {
    expect(
      availabilitySchema.safeParse({
        type: "recurrent",
        recurringDays: [],
      }).success,
    ).toBe(false);
  });

  it("rejette une plage de dates sans date de fin", () => {
    expect(
      availabilitySchema.safeParse({
        type: "plage",
        startDate: "2026-08-01",
        endDate: "",
      }).success,
    ).toBe(false);
  });

  it("accepte une disponibilité ponctuelle avec une date de début", () => {
    expect(
      availabilitySchema.safeParse({
        type: "ponctuel",
        startDate: "2026-08-01",
      }).success,
    ).toBe(true);
  });
});
