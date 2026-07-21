import { describe, expect, it } from "vitest";
import { requiredDocumentsComplete } from "@/lib/business-rules";
import {
  CABINET_DOCUMENT_TYPES,
  documentTypesForStatus,
} from "@/lib/data/reference";

describe("Simulation de documents (bouton « Simuler un document valide »)", () => {
  it("des documents simulés (status verified, is_simulated true) rendent le dossier complet", () => {
    const requiredTypes = documentTypesForStatus("qualified_dentist");
    // Le bouton de simulation crée un document au statut « verified »
    // avec is_simulated=true : il doit compter comme fourni.
    const simulatedDocs = requiredTypes
      .filter((d) => d.required)
      .map((d) => ({
        document_type: d.type,
        status: "verified",
        is_simulated: true,
      }));
    expect(requiredDocumentsComplete(requiredTypes, simulatedDocs)).toBe(true);
  });

  it("le dossier reste incomplet tant qu'un obligatoire n'est pas simulé ni téléversé", () => {
    const requiredTypes = documentTypesForStatus("qualified_dentist");
    const partial = requiredTypes
      .filter((d) => d.required)
      .slice(0, -1)
      .map((d) => ({
        document_type: d.type,
        status: "verified",
        is_simulated: true,
      }));
    expect(requiredDocumentsComplete(requiredTypes, partial)).toBe(false);
  });
});

describe("documentTypesForStatus", () => {
  it("étudiant : contient replacement_license et criminal_record", () => {
    const types = documentTypesForStatus("student").map((d) => d.type);
    expect(types).toContain("replacement_license");
    expect(types).toContain("criminal_record");
  });

  it("interne : contient resident_status et exercise_authorization", () => {
    const types = documentTypesForStatus("resident").map((d) => d.type);
    expect(types).toContain("resident_status");
    expect(types).toContain("exercise_authorization");
  });

  it("diplômé : contient rpps et cps", () => {
    const types = documentTypesForStatus("qualified_dentist").map((d) => d.type);
    expect(types).toContain("rpps");
    expect(types).toContain("cps");
  });

  it("cabinet (CABINET_DOCUMENT_TYPES) : contient siret et ordre_registration", () => {
    const types = CABINET_DOCUMENT_TYPES.map((d) => d.type);
    expect(types).toContain("siret");
    expect(types).toContain("ordre_registration");
  });
});
