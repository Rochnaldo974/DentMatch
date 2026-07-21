/**
 * Règles métier de DentMatch — fonctions pures, testables sans base de données.
 */
import {
  SPECIALIZED_SPECIALTY_CODES,
  type ProfessionalStatus,
  type JobPostStatus,
  type ApplicationStatus,
  type DocumentTypeDef,
} from "@/lib/data/reference";

/** Une annonce accepte-t-elle encore des candidatures ? */
export function isPostOpenForApplications(post: {
  status: JobPostStatus;
  applicationDeadline?: string | null;
  today?: string;
}): boolean {
  if (post.status !== "published") return false;
  if (post.applicationDeadline) {
    const today = post.today ?? new Date().toISOString().slice(0, 10);
    if (post.applicationDeadline < today) return false;
  }
  return true;
}

/**
 * Règle 11/12 — restriction des annonces spécialisées :
 * - un étudiant ne peut jamais candidater à une annonce exigeant une spécialité ;
 * - un interne uniquement si elle correspond à sa spécialité d'internat ;
 * - un diplômé peut toujours candidater.
 * La liste des spécialités « spécialisées » est configurable
 * (SPECIALIZED_SPECIALTY_CODES ou le flag is_specialized en base).
 */
export function canApplyToSpecialty(params: {
  professionalStatus: ProfessionalStatus;
  postSpecialtyCode: string | null | undefined;
  postSpecialtyIsSpecialized?: boolean;
  residentSpecialty?: string | null;
}): { allowed: boolean; reason?: string } {
  const { professionalStatus, postSpecialtyCode, residentSpecialty } = params;

  const isSpecialized =
    params.postSpecialtyIsSpecialized ??
    (postSpecialtyCode
      ? (SPECIALIZED_SPECIALTY_CODES as readonly string[]).includes(
          postSpecialtyCode,
        )
      : false);

  if (!postSpecialtyCode || !isSpecialized) {
    return { allowed: true };
  }

  if (professionalStatus === "qualified_dentist") {
    return { allowed: true };
  }

  if (professionalStatus === "student") {
    return {
      allowed: false,
      reason:
        "Cette annonce exige une spécialité. Les étudiants autorisés à remplacer ne peuvent pas remplacer un spécialiste.",
    };
  }

  // Interne : uniquement sa propre spécialité.
  if (residentSpecialty === postSpecialtyCode) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason:
      "Cette annonce exige une spécialité différente de votre spécialité d'internat.",
  };
}

/** Vérification complète avant candidature. */
export function canApply(params: {
  onboardingCompleted: boolean;
  alreadyApplied: boolean;
  post: {
    status: JobPostStatus;
    applicationDeadline?: string | null;
    specialtyCode?: string | null;
    specialtyIsSpecialized?: boolean;
  };
  professionalStatus: ProfessionalStatus;
  residentSpecialty?: string | null;
  today?: string;
}): { allowed: boolean; reason?: string } {
  if (!params.onboardingCompleted) {
    return {
      allowed: false,
      reason: "Terminez votre onboarding avant de candidater.",
    };
  }
  if (params.alreadyApplied) {
    return {
      allowed: false,
      reason: "Vous avez déjà candidaté à cette annonce.",
    };
  }
  if (
    !isPostOpenForApplications({
      status: params.post.status,
      applicationDeadline: params.post.applicationDeadline,
      today: params.today,
    })
  ) {
    const today = params.today ?? new Date().toISOString().slice(0, 10);
    const deadlinePassed =
      params.post.status === "published" &&
      Boolean(params.post.applicationDeadline) &&
      params.post.applicationDeadline! < today;
    return {
      allowed: false,
      reason: deadlinePassed
        ? "La date limite de candidature est dépassée."
        : "Cette annonce n'accepte plus de candidatures.",
    };
  }
  return canApplyToSpecialty({
    professionalStatus: params.professionalStatus,
    postSpecialtyCode: params.post.specialtyCode,
    postSpecialtyIsSpecialized: params.post.specialtyIsSpecialized,
    residentSpecialty: params.residentSpecialty,
  });
}

/** Règle 7 — un remplaçant peut retirer sa candidature avant acceptation. */
export function canWithdrawApplication(status: ApplicationStatus): boolean {
  return ["submitted", "viewed", "shortlisted"].includes(status);
}

/** Règle 6/16 — pré-vérification côté client avant l'acceptation (transactionnelle en base). */
export function canAcceptApplication(params: {
  applicationStatus: ApplicationStatus;
  postStatus: JobPostStatus;
  acceptedCount: number;
  positionsCount: number;
}): { allowed: boolean; reason?: string } {
  if (!["submitted", "viewed", "shortlisted"].includes(params.applicationStatus)) {
    return {
      allowed: false,
      reason: "Cette candidature ne peut plus être acceptée.",
    };
  }
  if (!["published", "filled"].includes(params.postStatus)) {
    return { allowed: false, reason: "Cette annonce n'est plus disponible." };
  }
  if (params.acceptedCount >= params.positionsCount) {
    return {
      allowed: false,
      reason: "Toutes les places de cette annonce sont déjà pourvues.",
    };
  }
  return { allowed: true };
}

/** Les documents obligatoires sont-ils tous fournis (téléversés ou simulés) ? */
export function requiredDocumentsComplete(
  requiredTypes: DocumentTypeDef[],
  documents: { document_type: string; status: string }[],
): boolean {
  return requiredTypes
    .filter((d) => d.required)
    .every((req) =>
      documents.some(
        (doc) =>
          doc.document_type === req.type &&
          ["uploaded", "pending", "verified"].includes(doc.status),
      ),
    );
}

/** Score de complétion d'un profil (pourcentage de champs renseignés). */
export function computeProfileCompletion(
  fields: Array<unknown>,
): number {
  if (fields.length === 0) return 0;
  const filled = fields.filter((f) => {
    if (f === null || f === undefined) return false;
    if (typeof f === "string") return f.trim().length > 0;
    if (Array.isArray(f)) return f.length > 0;
    return true;
  }).length;
  return Math.round((filled / fields.length) * 100);
}

/** Nettoyage d'un nom de fichier avant stockage. */
export function sanitizeFileName(name: string): string {
  const base = name.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return base
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 100);
}
