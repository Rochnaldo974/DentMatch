import { z } from "zod";

/** Étape 1 — Statut professionnel */
export const replacementStep1Schema = z.object({
  professionalStatus: z.enum(["qualified_dentist", "student", "resident"], {
    message: "Choisissez votre statut",
  }),
});

/** Étape 2 — Informations personnelles */
export const replacementStep2Schema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis").max(100),
  birthDate: z
    .string()
    .min(1, "La date de naissance est requise")
    .refine(
      (d) => {
        const date = new Date(d);
        const age = (Date.now() - date.getTime()) / (365.25 * 24 * 3600 * 1000);
        return age >= 18 && age <= 100;
      },
      { message: "Date de naissance invalide" },
    ),
  phone: z
    .string()
    .trim()
    .min(6, "Numéro de téléphone invalide")
    .max(20)
    .regex(/^[+0-9 ().-]+$/, "Numéro de téléphone invalide"),
  professionalEmail: z.string().trim().email("Adresse email invalide"),
  addressLine: z.string().trim().min(3, "L'adresse est requise").max(200),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  city: z.string().trim().min(1, "La ville est requise").max(120),
  territory: z.string().min(1, "Le territoire est requis"),
  bio: z
    .string()
    .trim()
    .min(30, "Présentez-vous en quelques mots (30 caractères minimum)")
    .max(1500),
});

/** Étape 3 — Informations professionnelles (diplômé) */
export const qualifiedDentistStep3Schema = z.object({
  rppsNumber: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "Le numéro RPPS doit contenir 11 chiffres"),
  ordinalNumber: z.string().trim().max(30).optional().or(z.literal("")),
  ordinalDepartment: z
    .string()
    .trim()
    .min(1, "Le conseil départemental est requis")
    .max(120),
  graduationYear: z.coerce
    .number()
    .int()
    .min(1960, "Année invalide")
    .max(new Date().getFullYear(), "Année invalide"),
  university: z.string().trim().min(2, "L'université est requise").max(160),
  currentPracticeMode: z.string().min(1, "Le mode d'exercice est requis"),
  hasCps: z.boolean().default(false),
  cpsLastDigits: z
    .string()
    .trim()
    .max(4, "4 caractères maximum")
    .optional()
    .or(z.literal("")),
  rcpInsurer: z.string().trim().min(2, "L'assureur RCP est requis").max(160),
  rcpExpirationDate: z.string().min(1, "La date d'expiration RCP est requise"),
});

/** Étape 3 — Informations professionnelles (étudiant) */
export const studentStep3Schema = z.object({
  university: z.string().trim().min(2, "L'université est requise").max(160),
  studentYear: z.string().min(1, "L'année d'études est requise"),
  fifthYearValidated: z.literal(true, {
    message:
      "La validation de la 5e année est requise pour être autorisé à remplacer",
  }),
  hasCsct: z.literal(true, {
    message: "Le CSCT est requis pour être autorisé à remplacer",
  }),
  csctDate: z.string().min(1, "La date d'obtention du CSCT est requise"),
  hospitalStatus: z.boolean().default(false),
  hospitalName: z.string().trim().max(200).optional().or(z.literal("")),
  licenseExpirationDate: z
    .string()
    .min(1, "La date d'expiration de l'autorisation est requise"),
});

/** Étape 3 — Informations professionnelles (interne) */
export const residentStep3Schema = z.object({
  university: z.string().trim().min(2, "L'université est requise").max(160),
  residentSpecialty: z.string().min(1, "La spécialité d'internat est requise"),
  internshipYear: z.string().min(1, "L'année d'internat est requise"),
  fifthYearValidated: z.literal(true, {
    message: "La validation de la 5e année est requise",
  }),
  hasCsct: z.literal(true, { message: "Le CSCT est requis" }),
  attachmentInstitution: z
    .string()
    .trim()
    .min(2, "L'établissement de rattachement est requis")
    .max(200),
  hasExerciseAuthorization: z.literal(true, {
    message: "L'autorisation d'exercice est requise",
  }),
  licenseExpirationDate: z
    .string()
    .min(1, "La date d'expiration de l'autorisation est requise"),
});

/** Étape 4 — Compétences */
export const replacementStep4Schema = z.object({
  specialties: z
    .array(z.string())
    .min(1, "Sélectionnez au moins une compétence"),
  experienceYears: z.coerce.number().int().min(0).max(60),
  masteredProcedures: z.string().trim().max(1000).optional().or(z.literal("")),
  excludedProcedures: z.string().trim().max(1000).optional().or(z.literal("")),
  softwareUsed: z.array(z.string()).default([]),
  languages: z.array(z.string()).min(1, "Indiquez au moins une langue"),
});

/** Étape 5 — Mobilité */
export const replacementStep5Schema = z.object({
  regions: z.array(z.string()).default([]),
  departments: z.array(z.string()).default([]),
  overseasTerritories: z.array(z.string()).default([]),
  mobilityRadiusKm: z.coerce.number().int().min(0).max(2000).default(50),
  nationalMobility: z.boolean().default(false),
  hasVehicle: z.boolean().default(false),
  hasDrivingLicense: z.boolean().default(false),
  needsAccommodation: z.boolean().default(false),
  acceptsTravelWithAccommodation: z.boolean().default(false),
  maxTravelDuration: z.string().optional().or(z.literal("")),
});

/** Étape 6 — Disponibilités */
export const availabilitySchema = z
  .object({
    type: z.enum(["ponctuel", "plage", "recurrent"]),
    startDate: z.string().optional().or(z.literal("")),
    endDate: z.string().optional().or(z.literal("")),
    recurringDays: z.array(z.string()).default([]),
    notes: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      data.type === "recurrent"
        ? data.recurringDays.length > 0
        : Boolean(data.startDate),
    { message: "Précisez la ou les dates", path: ["startDate"] },
  )
  .refine(
    (data) =>
      data.type !== "plage" ||
      (Boolean(data.endDate) && data.endDate! >= (data.startDate || "")),
    { message: "La date de fin doit suivre la date de début", path: ["endDate"] },
  );

export const replacementStep6Schema = z.object({
  availabilityPreferences: z.array(z.string()).default([]),
});

/** Étape 7 — Préférences de remplacement */
export const replacementStep7Schema = z.object({
  replacementPreferences: z
    .array(z.string())
    .min(1, "Sélectionnez au moins un type de remplacement"),
  minCompensation: z.string().trim().max(200).optional().or(z.literal("")),
  prefersRetrocession: z.boolean().default(false),
  prefersDailyRate: z.boolean().default(false),
  minDaysCount: z.coerce.number().int().min(0).max(365).optional(),
  preferredEnvironment: z.string().optional().or(z.literal("")),
  desiredEquipment: z.array(z.string()).default([]),
});

/** Étape 9 — Profil public */
export const replacementStep9Schema = z.object({
  photo: z.boolean().default(true),
  city: z.boolean().default(true),
  mobility: z.boolean().default(true),
  skills: z.boolean().default(true),
  experience: z.boolean().default(true),
  availability: z.boolean().default(true),
  languages: z.boolean().default(true),
  bio: z.boolean().default(true),
});

export type ReplacementStep1Input = z.infer<typeof replacementStep1Schema>;
export type ReplacementStep2Input = z.infer<typeof replacementStep2Schema>;
export type QualifiedDentistStep3Input = z.infer<typeof qualifiedDentistStep3Schema>;
export type StudentStep3Input = z.infer<typeof studentStep3Schema>;
export type ResidentStep3Input = z.infer<typeof residentStep3Schema>;
export type ReplacementStep4Input = z.infer<typeof replacementStep4Schema>;
export type ReplacementStep5Input = z.infer<typeof replacementStep5Schema>;
export type ReplacementStep7Input = z.infer<typeof replacementStep7Schema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
