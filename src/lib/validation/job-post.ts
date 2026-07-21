import { z } from "zod";

/** Schéma complet d'une annonce (publication). */
export const jobPostSchema = z
  .object({
    title: z.string().trim().min(3, "Le titre est requis").max(160),
    replacedPractitioner: z.string().trim().max(160).optional().or(z.literal("")),
    replacementReason: z.string().min(1, "Le motif est requis"),
    contractType: z.enum(["liberal", "salarie"], {
      message: "Choisissez le statut",
    }),
    replacementType: z.string().min(1, "Le type de remplacement est requis"),
    startDate: z.string().min(1, "La date de début est requise"),
    endDate: z.string().min(1, "La date de fin est requise"),
    workingDays: z.array(z.string()).default([]),
    scheduleText: z.string().max(500).optional().or(z.literal("")),
    fullTime: z.boolean().default(true),
    specialtyCode: z.string().optional().or(z.literal("")),
    expectedProcedures: z.string().max(1000).optional().or(z.literal("")),
    experienceRequired: z.string().optional().or(z.literal("")),
    compensationType: z.string().min(1, "Précisez la rémunération"),
    compensationValue: z.coerce.number().min(0).optional(),
    compensationDetails: z.string().max(500).optional().or(z.literal("")),
    accommodationProvided: z.boolean().default(false),
    travelCovered: z.boolean().default(false),
    urgent: z.boolean().default(false),
    positionsCount: z.coerce.number().int().min(1).max(10).default(1),
    applicationDeadline: z.string().optional().or(z.literal("")),
    description: z
      .string()
      .trim()
      .min(20, "Décrivez le remplacement (20 caractères minimum)")
      .max(5000),
    practicalInfo: z.string().max(2000).optional().or(z.literal("")),
    equipment: z.array(z.string()).default([]),
    software: z.string().max(120).optional().or(z.literal("")),
    languages: z.array(z.string()).default([]),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "La date de fin doit être postérieure à la date de début",
      path: ["endDate"],
    },
  )
  .refine(
    (data) =>
      !data.applicationDeadline ||
      !data.startDate ||
      data.applicationDeadline <= data.startDate,
    {
      message: "La date limite doit précéder le début du remplacement",
      path: ["applicationDeadline"],
    },
  )
  .refine(
    (data) =>
      !data.applicationDeadline ||
      data.applicationDeadline >= new Date().toISOString().slice(0, 10),
    {
      message:
        "La date limite de candidature est déjà passée — choisissez une date future",
      path: ["applicationDeadline"],
    },
  );

export type JobPostInput = z.infer<typeof jobPostSchema>;

/** Schéma allégé pour l'enregistrement en brouillon. */
export const jobPostDraftSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis").max(160),
});
