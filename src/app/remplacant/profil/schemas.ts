import { z } from "zod";

/** Identité (prénom, nom, téléphone) — mêmes règles que l'onboarding. */
export const basicInfoSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis").max(100),
  phone: z
    .string()
    .trim()
    .min(6, "Numéro de téléphone invalide")
    .max(20)
    .regex(/^[+0-9 ().-]+$/, "Numéro de téléphone invalide"),
});

export type BasicInfoInput = z.infer<typeof basicInfoSchema>;

/** Présentation (bio). */
export const bioSchema = z.object({
  bio: z
    .string()
    .trim()
    .min(30, "Présentez-vous en quelques mots (30 caractères minimum)")
    .max(1500),
});

export type BioInput = z.infer<typeof bioSchema>;
