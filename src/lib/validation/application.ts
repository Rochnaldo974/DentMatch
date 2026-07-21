import { z } from "zod";

export const applicationSchema = z.object({
  message: z
    .string()
    .trim()
    .min(30, "Présentez votre motivation (30 caractères minimum)")
    .max(2000),
  confirmedAvailability: z.literal(true, {
    message: "Confirmez votre disponibilité sur les dates de l'annonce",
  }),
  expectedCompensation: z.string().trim().max(200).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  acceptTerms: z.literal(true, {
    message: "Vous devez accepter les conditions",
  }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Le message est vide")
    .max(2000, "2000 caractères maximum"),
});

export type MessageInput = z.infer<typeof messageSchema>;
