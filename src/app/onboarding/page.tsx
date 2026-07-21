import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/shared/logo";
import { CabinetOnboarding } from "@/components/onboarding/cabinet-onboarding";
import { ReplacementOnboarding } from "@/components/onboarding/replacement-onboarding";
import { DEMO_MODE, DEMO_DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const profile = await requireUser();
  if (profile.onboarding_completed || profile.role === "admin") {
    redirect(
      profile.role === "cabinet" ? "/cabinet/dashboard" : "/remplacant/dashboard",
    );
  }

  const supabase = await createClient();

  const [{ data: specialtyRows }, { data: documents }, { data: preferences }] =
    await Promise.all([
      supabase
        .from("profile_specialties")
        .select("specialties(code)")
        .eq("user_id", profile.id),
      supabase
        .from("documents")
        .select("*")
        .eq("owner_user_id", profile.id)
        .order("created_at"),
      supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", profile.id)
        .maybeSingle(),
    ]);

  const specialtyCodes = (specialtyRows ?? [])
    .map((r) => r.specialties?.code)
    .filter((c): c is string => Boolean(c));

  let content: React.ReactNode;

  if (profile.role === "cabinet") {
    const { data: cabinet } = await supabase
      .from("cabinet_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();

    const [{ data: equipmentRows }, { data: photos }] = await Promise.all([
      cabinet
        ? supabase
            .from("cabinet_equipment")
            .select("equipment_code")
            .eq("cabinet_id", cabinet.id)
        : Promise.resolve({ data: [] as { equipment_code: string }[] }),
      cabinet
        ? supabase
            .from("cabinet_photos")
            .select("*")
            .eq("cabinet_id", cabinet.id)
            .order("display_order")
        : Promise.resolve({ data: [] }),
    ]);

    content = (
      <CabinetOnboarding
        data={{
          profile,
          cabinet,
          specialtyCodes,
          equipmentCodes: (equipmentRows ?? []).map((e) => e.equipment_code),
          photos: photos ?? [],
          documents: documents ?? [],
          preferences: preferences ?? null,
        }}
      />
    );
  } else {
    const [{ data: replacement }, { data: availabilities }, { data: areas }] =
      await Promise.all([
        supabase
          .from("replacement_profiles")
          .select("*")
          .eq("user_id", profile.id)
          .maybeSingle(),
        supabase
          .from("availabilities")
          .select("*")
          .eq("user_id", profile.id)
          .order("start_date"),
        supabase.from("mobility_areas").select("*").eq("user_id", profile.id),
      ]);

    content = (
      <ReplacementOnboarding
        data={{
          profile,
          replacement,
          specialtyCodes,
          documents: documents ?? [],
          availabilities: availabilities ?? [],
          mobilityAreas: areas ?? [],
          preferences: preferences ?? null,
        }}
      />
    );
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Logo />
        </div>
        {DEMO_MODE ? (
          <div className="border-t border-warning/30 bg-warning-soft px-4 py-2 text-center text-xs text-warning-foreground">
            {DEMO_DISCLAIMER}
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 pb-24">{content}</main>
    </div>
  );
}
