import { z } from "zod";

/** Étape 1 — Identité du responsable */
export const cabinetStep1Schema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis").max(100),
  managerRole: z.string().min(1, "La fonction est requise"),
  phone: z
    .string()
    .trim()
    .min(6, "Numéro de téléphone invalide")
    .max(20)
    .regex(/^[+0-9 ().-]+$/, "Numéro de téléphone invalide"),
  managerEmail: z.string().trim().email("Adresse email invalide"),
});

/** Étape 2 — Informations du cabinet */
export const cabinetStep2Schema = z.object({
  name: z.string().trim().min(2, "Le nom du cabinet est requis").max(160),
  structureType: z.string().min(1, "Le type de structure est requis"),
  siret: z
    .string()
    .trim()
    .regex(/^\d{14}$/, "Le SIRET doit contenir 14 chiffres"),
  finess: z
    .string()
    .trim()
    .regex(/^\d{9}$/, "Le FINESS doit contenir 9 chiffres")
    .optional()
    .or(z.literal("")),
  addressLine1: z.string().trim().min(3, "L'adresse est requise").max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal("")),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  city: z.string().trim().min(1, "La ville est requise").max(120),
  department: z.string().trim().min(1, "Le département est requis").max(120),
  region: z.string().trim().min(1, "La région est requise").max(120),
  territory: z.string().min(1, "Le territoire est requis"),
  phone: z
    .string()
    .trim()
    .min(6, "Numéro de téléphone invalide")
    .max(20)
    .regex(/^[+0-9 ().-]+$/, "Numéro de téléphone invalide"),
  email: z.string().trim().email("Adresse email invalide"),
  website: z
    .string()
    .trim()
    .url("URL invalide (incluez https://)")
    .optional()
    .or(z.literal("")),
});

/** Étape 3 — Présentation */
export const cabinetStep3Schema = z.object({
  description: z
    .string()
    .trim()
    .min(30, "Décrivez votre cabinet (30 caractères minimum)")
    .max(3000),
  practitionersCount: z.coerce.number().int().min(0).max(200),
  assistantsCount: z.coerce.number().int().min(0).max(200),
  treatmentRoomsCount: z.coerce.number().int().min(0).max(100),
  accessibility: z.boolean().default(false),
  parking: z.boolean().default(false),
  publicTransport: z.string().trim().max(300).optional().or(z.literal("")),
  software: z.string().trim().max(120).optional().or(z.literal("")),
  languages: z.array(z.string()).min(1, "Indiquez au moins une langue"),
  environmentType: z.string().min(1, "Précisez l'environnement"),
});

/** Étape 4 — Activités et équipements */
export const cabinetStep4Schema = z.object({
  specialties: z
    .array(z.string())
    .min(1, "Sélectionnez au moins une activité"),
  equipment: z.array(z.string()).default([]),
});

/** Étape 7 — Préférences */
export const cabinetStep7Schema = z.object({
  emailNotifications: z.boolean().default(true),
  inAppNotifications: z.boolean().default(true),
  replacementTypesSought: z.array(z.string()).default([]),
  searchRadiusKm: z.coerce.number().int().min(0).max(1000).default(50),
  replacementFrequency: z.string().optional().or(z.literal("")),
  acceptTestTerms: z.literal(true, {
    message: "Vous devez accepter les conditions de la phase de test",
  }),
});

export type CabinetStep1Input = z.infer<typeof cabinetStep1Schema>;
export type CabinetStep2Input = z.infer<typeof cabinetStep2Schema>;
export type CabinetStep3Input = z.infer<typeof cabinetStep3Schema>;
export type CabinetStep4Input = z.infer<typeof cabinetStep4Schema>;
export type CabinetStep7Input = z.infer<typeof cabinetStep7Schema>;
