import { describe, expect, it } from "vitest";
import {
  canAcceptApplication,
  canApply,
  canApplyToSpecialty,
  canWithdrawApplication,
  computeProfileCompletion,
  isPostOpenForApplications,
  requiredDocumentsComplete,
  sanitizeFileName,
} from "@/lib/business-rules";
import type { DocumentTypeDef } from "@/lib/data/reference";

describe("isPostOpenForApplications", () => {
  it("une annonce publiée sans date limite est ouverte", () => {
    expect(isPostOpenForApplications({ status: "published" })).toBe(true);
  });

  it.each(["draft", "filled", "expired", "archived", "cancelled", "suspended"] as const)(
    "une annonce au statut %s est fermée",
    (status) => {
      expect(isPostOpenForApplications({ status })).toBe(false);
    },
  );

  it("une annonce publiée dont la date limite est passée est fermée", () => {
    expect(
      isPostOpenForApplications({
        status: "published",
        applicationDeadline: "2026-03-01",
        today: "2026-03-02",
      }),
    ).toBe(false);
  });

  it("une annonce dont la date limite est aujourd'hui reste ouverte", () => {
    expect(
      isPostOpenForApplications({
        status: "published",
        applicationDeadline: "2026-03-01",
        today: "2026-03-01",
      }),
    ).toBe(true);
  });

  it("une annonce dont la date limite est future est ouverte", () => {
    expect(
      isPostOpenForApplications({
        status: "published",
        applicationDeadline: "2026-06-30",
        today: "2026-03-01",
      }),
    ).toBe(true);
  });
});

describe("canApplyToSpecialty (règles 11/12)", () => {
  it("annonce sans spécialité : tous les statuts sont autorisés", () => {
    for (const professionalStatus of ["qualified_dentist", "student", "resident"] as const) {
      expect(
        canApplyToSpecialty({ professionalStatus, postSpecialtyCode: null }).allowed,
      ).toBe(true);
    }
  });

  it("annonce en omnipratique (non spécialisée) : un étudiant est autorisé", () => {
    expect(
      canApplyToSpecialty({
        professionalStatus: "student",
        postSpecialtyCode: "omnipratique",
      }).allowed,
    ).toBe(true);
  });

  it("annonce en orthodontie : un diplômé est autorisé", () => {
    expect(
      canApplyToSpecialty({
        professionalStatus: "qualified_dentist",
        postSpecialtyCode: "orthodontie",
      }).allowed,
    ).toBe(true);
  });

  it("annonce en orthodontie : un étudiant est refusé avec une raison", () => {
    const result = canApplyToSpecialty({
      professionalStatus: "student",
      postSpecialtyCode: "orthodontie",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it("annonce en orthodontie : un interne ODF (orthodontie) est autorisé", () => {
    expect(
      canApplyToSpecialty({
        professionalStatus: "resident",
        postSpecialtyCode: "orthodontie",
        residentSpecialty: "orthodontie",
      }).allowed,
    ).toBe(true);
  });

  it("annonce en orthodontie : un interne en chirurgie orale est refusé", () => {
    const result = canApplyToSpecialty({
      professionalStatus: "resident",
      postSpecialtyCode: "orthodontie",
      residentSpecialty: "chirurgie_orale",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it("le flag postSpecialtyIsSpecialized=false outrepasse la liste par défaut (règle configurable)", () => {
    // "orthodontie" figure dans SPECIALIZED_SPECIALTY_CODES, mais le flag
    // explicite venant de la base doit primer.
    expect(
      canApplyToSpecialty({
        professionalStatus: "student",
        postSpecialtyCode: "orthodontie",
        postSpecialtyIsSpecialized: false,
      }).allowed,
    ).toBe(true);
  });
});

describe("canApply", () => {
  const openPost = {
    status: "published" as const,
    applicationDeadline: "2026-06-30",
  };

  it("refuse si l'onboarding est incomplet", () => {
    const result = canApply({
      onboardingCompleted: false,
      alreadyApplied: false,
      post: openPost,
      professionalStatus: "qualified_dentist",
      today: "2026-03-01",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("onboarding");
  });

  it("refuse une candidature en double (règle 3)", () => {
    const result = canApply({
      onboardingCompleted: true,
      alreadyApplied: true,
      post: openPost,
      professionalStatus: "qualified_dentist",
      today: "2026-03-01",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("déjà candidaté");
  });

  it("refuse si l'annonce est fermée (règle 4)", () => {
    const result = canApply({
      onboardingCompleted: true,
      alreadyApplied: false,
      post: { status: "expired" },
      professionalStatus: "qualified_dentist",
      today: "2026-03-01",
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("n'accepte plus");
  });

  it("accepte le cas nominal", () => {
    const result = canApply({
      onboardingCompleted: true,
      alreadyApplied: false,
      post: openPost,
      professionalStatus: "qualified_dentist",
      today: "2026-03-01",
    });
    expect(result).toEqual({ allowed: true });
  });
});

describe("canWithdrawApplication (règle 7)", () => {
  it.each(["submitted", "viewed", "shortlisted"] as const)(
    "autorise le retrait d'une candidature au statut %s",
    (status) => {
      expect(canWithdrawApplication(status)).toBe(true);
    },
  );

  it.each(["accepted", "rejected", "withdrawn"] as const)(
    "interdit le retrait d'une candidature au statut %s",
    (status) => {
      expect(canWithdrawApplication(status)).toBe(false);
    },
  );
});

describe("canAcceptApplication (règles 6/16)", () => {
  const base = {
    applicationStatus: "submitted" as const,
    postStatus: "published" as const,
    acceptedCount: 0,
    positionsCount: 1,
  };

  it.each(["accepted", "withdrawn", "rejected"] as const)(
    "refuse une candidature déjà au statut %s",
    (applicationStatus) => {
      const result = canAcceptApplication({ ...base, applicationStatus });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeTruthy();
    },
  );

  it.each(["draft", "archived"] as const)(
    "refuse si l'annonce est au statut %s",
    (postStatus) => {
      const result = canAcceptApplication({ ...base, postStatus });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeTruthy();
    },
  );

  it("refuse quand toutes les places sont pourvues (acceptation multiple bloquée)", () => {
    const result = canAcceptApplication({
      ...base,
      acceptedCount: 1,
      positionsCount: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("pourvues");
  });

  it("accepte sur une annonce pourvue (filled) tant qu'il reste des places", () => {
    const result = canAcceptApplication({
      applicationStatus: "shortlisted",
      postStatus: "filled",
      acceptedCount: 1,
      positionsCount: 2,
    });
    expect(result).toEqual({ allowed: true });
  });
});

describe("requiredDocumentsComplete", () => {
  const types: DocumentTypeDef[] = [
    { type: "identity", label: "Pièce d'identité", required: true },
    { type: "rpps", label: "Justificatif RPPS", required: true },
    { type: "diploma", label: "Diplôme", required: false },
  ];

  it("complet quand tous les obligatoires sont uploaded / pending / verified", () => {
    expect(
      requiredDocumentsComplete(types, [
        { document_type: "identity", status: "uploaded" },
        { document_type: "rpps", status: "pending" },
      ]),
    ).toBe(true);
  });

  it("un document simulé (status verified) compte comme fourni", () => {
    expect(
      requiredDocumentsComplete(types, [
        { document_type: "identity", status: "verified" },
        { document_type: "rpps", status: "verified" },
      ]),
    ).toBe(true);
  });

  it("incomplet si un document obligatoire manque", () => {
    expect(
      requiredDocumentsComplete(types, [
        { document_type: "identity", status: "verified" },
      ]),
    ).toBe(false);
  });

  it("incomplet si un obligatoire est rejected ou missing", () => {
    expect(
      requiredDocumentsComplete(types, [
        { document_type: "identity", status: "verified" },
        { document_type: "rpps", status: "rejected" },
      ]),
    ).toBe(false);
    expect(
      requiredDocumentsComplete(types, [
        { document_type: "identity", status: "verified" },
        { document_type: "rpps", status: "missing" },
      ]),
    ).toBe(false);
  });

  it("les documents facultatifs n'influent pas sur le résultat", () => {
    // Facultatif absent → toujours complet.
    expect(
      requiredDocumentsComplete(types, [
        { document_type: "identity", status: "verified" },
        { document_type: "rpps", status: "verified" },
      ]),
    ).toBe(true);
    // Facultatif rejeté → toujours complet.
    expect(
      requiredDocumentsComplete(types, [
        { document_type: "identity", status: "verified" },
        { document_type: "rpps", status: "verified" },
        { document_type: "diploma", status: "rejected" },
      ]),
    ).toBe(true);
  });
});

describe("computeProfileCompletion", () => {
  it("renvoie 0 quand tous les champs sont vides", () => {
    expect(computeProfileCompletion([null, undefined, "", "   ", []])).toBe(0);
  });

  it("renvoie 0 pour une liste de champs vide", () => {
    expect(computeProfileCompletion([])).toBe(0);
  });

  it("renvoie 100 quand tout est rempli", () => {
    expect(
      computeProfileCompletion(["Jean", "Dupont", 3, true, ["omnipratique"]]),
    ).toBe(100);
  });

  it("arrondit correctement le pourcentage", () => {
    // 1 champ rempli sur 3 → 33,33… % → 33.
    expect(computeProfileCompletion(["ok", null, null])).toBe(33);
    // 2 champs remplis sur 3 → 66,66… % → 67.
    expect(computeProfileCompletion(["ok", "ok", null])).toBe(67);
  });

  it("un tableau vide compte comme non rempli", () => {
    expect(computeProfileCompletion([[], ["x"]])).toBe(50);
  });
});

describe("sanitizeFileName", () => {
  it("retire les accents", () => {
    expect(sanitizeFileName("piece-identite-éàû.pdf")).toBe(
      "piece-identite-eau.pdf",
    );
  });

  it("remplace les caractères spéciaux par des underscores", () => {
    expect(sanitizeFileName("mon document (v2)!.pdf")).toBe(
      "mon_document_v2_.pdf",
    );
  });

  it("compresse les underscores consécutifs", () => {
    expect(sanitizeFileName("a  &  b.pdf")).toBe("a_b.pdf");
  });

  it("limite la longueur à 100 caractères", () => {
    const long = "a".repeat(250) + ".pdf";
    expect(sanitizeFileName(long)).toHaveLength(100);
  });
});
