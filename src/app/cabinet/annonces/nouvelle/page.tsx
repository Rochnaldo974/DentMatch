import { CalendarDays, Send } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorState } from "@/components/shared/error-state";
import { JobPostForm } from "@/components/cabinet/job-post-form";

export const metadata = { title: "Publier une annonce" };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function NewJobPostPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string; inviter?: string }>;
}) {
  const { debut, fin, inviter } = await searchParams;
  const profile = await requireRole("cabinet");
  const supabase = await createClient();

  const { data: cabinet } = await supabase
    .from("cabinet_profiles")
    .select("id, city")
    .eq("user_id", profile.id)
    .single();

  if (!cabinet) {
    return (
      <ErrorState
        title="Profil cabinet introuvable"
        description="Terminez votre onboarding pour publier une annonce."
      />
    );
  }

  // Dates transmises par la recherche de remplaçant (pré-remplissage).
  let startDate = debut && DATE_RE.test(debut) ? debut : undefined;
  let endDate = fin && DATE_RE.test(fin) ? fin : undefined;

  // Flux guidé « inviter sans annonce » : candidat à inviter à la publication.
  let inviteCandidate: { userId: string; name: string } | undefined;
  if (inviter && UUID_RE.test(inviter)) {
    const { data: candidate } = await supabase
      .from("public_candidate_profiles")
      .select("user_id, first_name, last_name_initial")
      .eq("user_id", inviter)
      .maybeSingle();
    if (candidate?.user_id) {
      inviteCandidate = {
        userId: candidate.user_id,
        name: [candidate.first_name, candidate.last_name_initial]
          .filter(Boolean)
          .join(" "),
      };
      // Sans dates transmises : proposer la prochaine disponibilité du candidat.
      if (!startDate) {
        const today = new Date().toISOString().slice(0, 10);
        const { data: nextAvailability } = await supabase
          .from("availabilities")
          .select("start_date, end_date")
          .eq("user_id", candidate.user_id)
          .eq("available", true)
          .gte("start_date", today)
          .order("start_date", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (nextAvailability?.start_date) {
          startDate = nextAvailability.start_date;
          endDate = nextAvailability.end_date ?? undefined;
        }
      }
    }
  }
  const prefilled = Boolean(startDate || endDate) && !inviteCandidate;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Publier une annonce
        </h1>
        <p className="text-sm text-muted-foreground">
          Décrivez votre besoin de remplacement. Vous pouvez enregistrer un
          brouillon et publier plus tard.
        </p>
      </div>

      {inviteCandidate ? (
        <Alert className="border-verified/30 bg-verified-soft/50">
          <Send className="size-4" aria-hidden="true" />
          <AlertDescription>
            <span className="font-medium text-foreground">
              À la publication, {inviteCandidate.name} sera automatiquement
              invité(e) à candidater à cette annonce.
            </span>{" "}
            {startDate
              ? "Les dates proposées correspondent à sa prochaine disponibilité — modifiables à tout moment."
              : "Un brouillon n'envoie pas d'invitation."}
          </AlertDescription>
        </Alert>
      ) : null}

      {prefilled ? (
        <Alert className="border-primary/25 bg-primary/5">
          <CalendarDays className="size-4" aria-hidden="true" />
          <AlertDescription>
            Dates pré-remplies depuis votre recherche de remplaçant —
            modifiables à tout moment.
          </AlertDescription>
        </Alert>
      ) : null}

      <JobPostForm
        cabinetCity={cabinet.city}
        invite={inviteCandidate}
        defaultValues={
          startDate || endDate
            ? {
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {}),
              }
            : undefined
        }
      />
    </div>
  );
}
