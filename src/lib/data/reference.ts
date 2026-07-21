/**
 * Catalogues de référence du produit.
 * Source de vérité unique pour les libellés français et les codes stockés en base.
 */

export type Option<T extends string = string> = {
  value: T;
  label: string;
};

/* ----------------------------- Rôles et statuts ---------------------------- */

export const USER_ROLES = ["cabinet", "replacement_dentist", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PROFESSIONAL_STATUSES = [
  "qualified_dentist",
  "student",
  "resident",
] as const;
export type ProfessionalStatus = (typeof PROFESSIONAL_STATUSES)[number];

export const PROFESSIONAL_STATUS_LABELS: Record<ProfessionalStatus, string> = {
  qualified_dentist: "Chirurgien-dentiste diplômé",
  student: "Étudiant autorisé à remplacer",
  resident: "Interne en odontologie",
};

/* ------------------------------- Géographie ------------------------------- */

export const TERRITORIES = [
  "France métropolitaine",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Mayotte",
  "Saint-Martin",
  "Saint-Barthélemy",
  "Saint-Pierre-et-Miquelon",
  "Nouvelle-Calédonie",
  "Polynésie française",
  "Wallis-et-Futuna",
] as const;
export type Territory = (typeof TERRITORIES)[number];

export const OVERSEAS_TERRITORIES = TERRITORIES.filter(
  (t) => t !== "France métropolitaine",
);

export const REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
] as const;

/* --------------------------------- Cabinet --------------------------------- */

export const STRUCTURE_TYPES: Option[] = [
  { value: "cabinet_individuel", label: "Cabinet individuel" },
  { value: "cabinet_groupe", label: "Cabinet de groupe" },
  { value: "societe_exercice", label: "Société d'exercice" },
  { value: "centre_sante", label: "Centre de santé dentaire" },
  { value: "clinique", label: "Clinique" },
  { value: "autre", label: "Autre" },
];

export const MANAGER_ROLES: Option[] = [
  { value: "titulaire", label: "Chirurgien-dentiste titulaire" },
  { value: "associe", label: "Associé" },
  { value: "responsable_centre", label: "Responsable de centre" },
  { value: "responsable_administratif", label: "Responsable administratif" },
  { value: "autre", label: "Autre" },
];

export const ENVIRONMENT_TYPES: Option[] = [
  { value: "urbain", label: "Urbain" },
  { value: "periurbain", label: "Périurbain" },
  { value: "rural", label: "Rural" },
];

export const DENTAL_SOFTWARE_SUGGESTIONS = [
  "Logos",
  "Julie",
  "Veasy",
  "Desmos",
  "Orthalis",
  "WeClever Dental",
  "Autre",
];

/* ------------------------- Spécialités et compétences ---------------------- */

export const SPECIALTIES: Option[] = [
  { value: "omnipratique", label: "Omnipratique" },
  { value: "pediatrie", label: "Odontologie pédiatrique" },
  { value: "endodontie", label: "Endodontie" },
  { value: "parodontologie", label: "Parodontologie" },
  { value: "chirurgie_orale", label: "Chirurgie orale" },
  { value: "implantologie", label: "Implantologie" },
  { value: "orthodontie", label: "Orthodontie" },
  { value: "prothese", label: "Prothèse" },
  { value: "esthetique", label: "Esthétique" },
  { value: "urgences", label: "Urgences" },
  { value: "sedation", label: "Soins sous sédation" },
  { value: "handicap", label: "Patients en situation de handicap" },
  { value: "autre", label: "Autre" },
];

/**
 * Règle métier configurable : spécialités considérées comme « spécialisées ».
 * Un étudiant ne peut pas candidater à une annonce exigeant l'une d'elles ;
 * un interne uniquement si elle correspond à sa spécialité d'internat.
 */
export const SPECIALIZED_SPECIALTY_CODES = [
  "orthodontie",
  "chirurgie_orale",
] as const;

export const RESIDENT_SPECIALTIES: Option[] = [
  { value: "orthodontie", label: "Orthopédie dento-faciale (ODF)" },
  { value: "chirurgie_orale", label: "Chirurgie orale" },
  { value: "medecine_bucco_dentaire", label: "Médecine bucco-dentaire" },
];

export const EQUIPMENT: Option[] = [
  { value: "panoramique", label: "Panoramique" },
  { value: "cone_beam", label: "Cone beam" },
  { value: "camera_optique", label: "Caméra optique" },
  { value: "microscope", label: "Microscope" },
  { value: "bloc_operatoire", label: "Bloc opératoire" },
  { value: "sedation", label: "Sédation" },
  { value: "cfao", label: "CFAO" },
  { value: "scanner_intra_oral", label: "Scanner intra-oral" },
  { value: "autre", label: "Autre" },
];

export const LANGUAGES_SUGGESTIONS = [
  "Français",
  "Anglais",
  "Espagnol",
  "Portugais",
  "Créole",
  "Arabe",
  "Allemand",
  "Italien",
];

/* --------------------------------- Annonces -------------------------------- */

export const JOB_POST_STATUSES = [
  "draft",
  "published",
  "filled",
  "expired",
  "archived",
  "cancelled",
  "suspended",
] as const;
export type JobPostStatus = (typeof JOB_POST_STATUSES)[number];

export const JOB_POST_STATUS_LABELS: Record<JobPostStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  filled: "Pourvue",
  expired: "Expirée",
  archived: "Archivée",
  cancelled: "Annulée",
  suspended: "Suspendue",
};

export const REPLACEMENT_REASONS: Option[] = [
  { value: "conges", label: "Congés" },
  { value: "maladie", label: "Maladie" },
  { value: "maternite", label: "Maternité" },
  { value: "paternite", label: "Paternité" },
  { value: "formation", label: "Formation" },
  { value: "absence_ponctuelle", label: "Absence ponctuelle" },
  { value: "poste_vacant", label: "Poste temporairement vacant" },
  { value: "autre", label: "Autre" },
];

export const CONTRACT_TYPES: Option[] = [
  { value: "liberal", label: "Libéral" },
  { value: "salarie", label: "Salarié" },
];

export const REPLACEMENT_TYPES: Option[] = [
  { value: "ponctuel", label: "Ponctuel" },
  { value: "recurrent", label: "Récurrent" },
  { value: "longue_duree", label: "Longue durée" },
  { value: "urgence", label: "Urgence" },
];

export const COMPENSATION_TYPES: Option[] = [
  { value: "retrocession", label: "Rétrocession (%)" },
  { value: "forfait_journalier", label: "Forfait journalier (€)" },
  { value: "salaire", label: "Salaire (€ / mois)" },
  { value: "a_discuter", label: "À discuter" },
];

export const WORKING_DAYS: Option[] = [
  { value: "lundi", label: "Lundi" },
  { value: "mardi", label: "Mardi" },
  { value: "mercredi", label: "Mercredi" },
  { value: "jeudi", label: "Jeudi" },
  { value: "vendredi", label: "Vendredi" },
  { value: "samedi", label: "Samedi" },
  { value: "dimanche", label: "Dimanche" },
];

export const EXPERIENCE_LEVELS: Option[] = [
  { value: "debutant_accepte", label: "Débutant accepté" },
  { value: "1_3_ans", label: "1 à 3 ans" },
  { value: "3_5_ans", label: "3 à 5 ans" },
  { value: "5_plus_ans", label: "Plus de 5 ans" },
];

/* ------------------------------- Candidatures ------------------------------ */

export const APPLICATION_STATUSES = [
  "submitted",
  "viewed",
  "shortlisted",
  "accepted",
  "rejected",
  "withdrawn",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Envoyée",
  viewed: "Consultée",
  shortlisted: "Présélectionnée",
  accepted: "Acceptée",
  rejected: "Refusée",
  withdrawn: "Retirée",
};

/* ------------------------------- Remplacements ----------------------------- */

export const PLACEMENT_STATUSES = ["confirmed", "completed", "cancelled"] as const;
export type PlacementStatus = (typeof PLACEMENT_STATUSES)[number];

export const PLACEMENT_STATUS_LABELS: Record<PlacementStatus, string> = {
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

/** Checklist administrative indicative d'un remplacement (cases manuelles). */
export const PLACEMENT_CHECKLIST_ITEMS: Option[] = [
  { value: "application_accepted", label: "Candidature acceptée" },
  { value: "contact_exchanged", label: "Coordonnées échangées" },
  { value: "contract_to_prepare", label: "Contrat à préparer" },
  { value: "contract_signed", label: "Contrat signé" },
  { value: "ordre_notified", label: "Transmission au Conseil de l'Ordre" },
  { value: "authorization_received", label: "Autorisation reçue si nécessaire" },
  { value: "assurance_maladie_notified", label: "Assurance Maladie informée" },
  { value: "replacement_confirmed", label: "Remplacement confirmé" },
];

/* -------------------------------- Documents -------------------------------- */

export const DOCUMENT_STATUSES = [
  "missing",
  "uploaded",
  "pending",
  "verified",
  "rejected",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  missing: "Manquant",
  uploaded: "Téléversé",
  pending: "Vérification en attente",
  verified: "Vérifié par DentMatch",
  rejected: "Refusé",
};

export type DocumentTypeDef = {
  /** Code stocké en base dans documents.document_type */
  type: string;
  label: string;
  required: boolean;
  /** Précision affichée sous le libellé. */
  hint?: string;
};

export const CABINET_DOCUMENT_TYPES: DocumentTypeDef[] = [
  {
    type: "identity",
    label: "Justificatif d'identité du responsable",
    required: true,
  },
  {
    type: "siret",
    label: "Justificatif SIRET ou extrait d'immatriculation",
    required: true,
  },
  {
    type: "ordre_registration",
    label: "Attestation d'inscription à l'Ordre du praticien titulaire",
    required: true,
  },
  {
    type: "rcp_insurance",
    label: "Attestation d'assurance responsabilité civile professionnelle",
    required: true,
  },
  {
    type: "finess",
    label: "Justificatif FINESS",
    required: false,
    hint: "Si applicable à votre structure.",
  },
];

export const QUALIFIED_DENTIST_DOCUMENT_TYPES: DocumentTypeDef[] = [
  { type: "identity", label: "Pièce d'identité", required: true },
  {
    type: "ordre_registration",
    label: "Attestation d'inscription au tableau de l'Ordre",
    required: true,
  },
  { type: "rpps", label: "Justificatif ou attestation RPPS", required: true },
  {
    type: "rcp_insurance",
    label: "Attestation de responsabilité civile professionnelle",
    required: true,
  },
  {
    type: "cps",
    label: "Justificatif de carte CPS ou attestation sur l'honneur",
    required: true,
  },
  {
    type: "diploma",
    label: "Diplôme",
    required: false,
    hint: "Facultatif pour la phase de test.",
  },
];

export const STUDENT_DOCUMENT_TYPES: DocumentTypeDef[] = [
  { type: "identity", label: "Pièce d'identité", required: true },
  {
    type: "year_validation",
    label: "Certificat de validation de la 5e ou 6e année",
    required: true,
  },
  {
    type: "csct",
    label: "Certificat de synthèse clinique et thérapeutique (CSCT)",
    required: true,
  },
  {
    type: "replacement_license",
    label: "Licence ou autorisation de remplacement",
    required: true,
  },
  {
    type: "criminal_record",
    label: "Extrait de casier judiciaire (bulletin n°3)",
    required: true,
  },
  {
    type: "hospital_authorization",
    label: "Autorisation du directeur d'hôpital",
    required: false,
    hint: "Si vous avez un statut hospitalier.",
  },
  {
    type: "dean_authorization",
    label: "Autorisation du doyen ou du chef de service",
    required: false,
    hint: "Lorsque requise.",
  },
  {
    type: "independent_affiliation",
    label: "Preuve d'affiliation comme indépendant",
    required: false,
    hint: "Pour un remplacement libéral — facultative dans le MVP.",
  },
];

export const RESIDENT_DOCUMENT_TYPES: DocumentTypeDef[] = [
  { type: "identity", label: "Pièce d'identité", required: true },
  {
    type: "year_validation",
    label: "Certificat de validation de la 5e année",
    required: true,
  },
  {
    type: "csct",
    label: "Certificat de synthèse clinique et thérapeutique (CSCT)",
    required: true,
  },
  { type: "resident_status", label: "Justificatif du statut d'interne", required: true },
  { type: "exercise_authorization", label: "Autorisation d'exercice", required: true },
  {
    type: "institution_certificate",
    label: "Attestation de l'établissement de rattachement",
    required: true,
  },
  {
    type: "dean_authorization",
    label: "Autorisation du doyen ou du chef de service",
    required: false,
    hint: "Lorsque requise.",
  },
  {
    type: "rcp_insurance",
    label: "Attestation RCP",
    required: false,
    hint: "Si applicable.",
  },
];

export function documentTypesForStatus(
  status: ProfessionalStatus,
): DocumentTypeDef[] {
  switch (status) {
    case "qualified_dentist":
      return QUALIFIED_DENTIST_DOCUMENT_TYPES;
    case "student":
      return STUDENT_DOCUMENT_TYPES;
    case "resident":
      return RESIDENT_DOCUMENT_TYPES;
  }
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  [
    ...CABINET_DOCUMENT_TYPES,
    ...QUALIFIED_DENTIST_DOCUMENT_TYPES,
    ...STUDENT_DOCUMENT_TYPES,
    ...RESIDENT_DOCUMENT_TYPES,
  ].map((d) => [d.type, d.label]),
);

/* ------------------------------- Notifications ----------------------------- */

export const NOTIFICATION_TYPES = [
  "new_application",
  "application_viewed",
  "application_accepted",
  "application_rejected",
  "new_message",
  "job_post_expiring",
  "profile_verified",
  "document_rejected",
  "placement_upcoming",
  "job_post_match",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/* ------------------------------ Disponibilités ----------------------------- */

export const AVAILABILITY_TYPES: Option[] = [
  { value: "ponctuel", label: "Date ponctuelle" },
  { value: "plage", label: "Plage de dates" },
  { value: "recurrent", label: "Jours récurrents" },
];

export const AVAILABILITY_PREFERENCES: Option[] = [
  { value: "immediate", label: "Disponibilité immédiate" },
  { value: "temps_plein", label: "Temps plein" },
  { value: "temps_partiel", label: "Temps partiel" },
  { value: "week_ends", label: "Week-ends" },
  { value: "gardes", label: "Gardes (cadre réglementaire à vérifier)" },
  { value: "remplacements_courts", label: "Remplacements courts" },
  { value: "remplacements_longs", label: "Remplacements longs" },
];

/* ------------------------ Préférences de remplacement ---------------------- */

export const REPLACEMENT_PREFERENCE_TYPES: Option[] = [
  { value: "liberal", label: "Remplacement libéral" },
  { value: "salarie", label: "Remplacement salarié" },
  { value: "ponctuel", label: "Remplacement ponctuel" },
  { value: "recurrent", label: "Remplacement récurrent" },
  { value: "maternite_paternite", label: "Congé maternité ou paternité" },
  { value: "arret_maladie", label: "Arrêt maladie" },
  { value: "conges_annuels", label: "Congés annuels" },
  { value: "urgence", label: "Urgence" },
  { value: "longue_duree", label: "Longue durée" },
  { value: "temps_partiel", label: "Temps partiel" },
  { value: "temps_plein", label: "Temps plein" },
  { value: "centre_sante", label: "Centre de santé" },
  { value: "cabinet_liberal", label: "Cabinet libéral" },
  { value: "clinique", label: "Clinique" },
  { value: "outre_mer", label: "Territoire d'outre-mer" },
];

/* ------------------------------ Photos cabinet ----------------------------- */

export const CABINET_PHOTO_TYPES: Option[] = [
  { value: "logo", label: "Logo" },
  { value: "principale", label: "Photo principale" },
  { value: "salle_soins", label: "Salle de soins" },
  { value: "accueil", label: "Accueil" },
  { value: "equipe", label: "Équipe" },
  { value: "equipements", label: "Équipements" },
];

/* ------------------------------ Vérification ------------------------------- */

export const VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "rejected",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  unverified: "Non vérifié",
  pending: "Vérification en attente",
  verified: "Vérifié par DentMatch",
  rejected: "Vérification refusée",
};
