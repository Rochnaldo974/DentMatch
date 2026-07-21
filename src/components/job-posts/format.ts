import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Option } from "@/lib/data/reference";

/** Libellé français d'un code catalogue, ou null si inconnu. */
export function labelFor(
  options: Option[],
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? null;
}

/** Date courte française : « 12 mars 2026 ». */
export function formatDateFr(date: string | null | undefined): string | null {
  if (!date) return null;
  return format(new Date(date), "d MMMM yyyy", { locale: fr });
}

/** Plage de dates d'une annonce ou d'un remplacement. */
export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string | null {
  const startFr = formatDateFr(start);
  const endFr = formatDateFr(end);
  if (startFr && endFr) {
    return startFr === endFr ? `Le ${startFr}` : `Du ${startFr} au ${endFr}`;
  }
  if (startFr) return `À partir du ${startFr}`;
  return null;
}

/** Rémunération lisible selon le type déclaré. */
export function formatCompensation(post: {
  compensation_type: string | null;
  compensation_value: number | null;
  compensation_details?: string | null;
}): string | null {
  const value = post.compensation_value;
  switch (post.compensation_type) {
    case "retrocession":
      return value != null ? `Rétrocession ${value} %` : "Rétrocession à discuter";
    case "forfait_journalier":
      return value != null ? `${value} € / jour` : "Forfait journalier";
    case "salaire":
      return value != null ? `${value} € / mois` : "Salaire à discuter";
    case "a_discuter":
      return "Rémunération à discuter";
    default:
      return post.compensation_details?.trim() || null;
  }
}

/** URL publique d'un média du bucket public Supabase. */
export function publicMediaUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-media/${storagePath}`;
}
