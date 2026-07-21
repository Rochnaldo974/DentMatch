import Link from "next/link";
import { Building2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_DESCRIPTION, APP_TAGLINE } from "@/lib/constants";
import { DashboardPreview } from "./dashboard-preview";

/** Mot du titre mis en dégradé — usage unique, réservé au hero. */
const GRADIENT_WORD = "remplaçant";

function HeroTitle() {
  const [before, after] = APP_TAGLINE.split(GRADIENT_WORD);
  if (after === undefined) {
    return <>{APP_TAGLINE}</>;
  }
  return (
    <>
      {before}
      <span className="text-gradient">{GRADIENT_WORD}</span>
      {after}
    </>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
      {/* Calques décoratifs : halos + trame de points */}
      <div aria-hidden="true" className="hero-glow absolute inset-0" />
      <div aria-hidden="true" className="dot-grid absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl animate-in flex-col items-center text-center fade-in-0 slide-in-from-bottom-4 duration-700 ease-out">
          <p className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground">
            <span
              aria-hidden="true"
              className="size-2 animate-pulse rounded-full bg-verified"
            />
            MVP ouvert aux tests — France &amp; outre-mer
          </p>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
            <HeroTitle />
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {APP_DESCRIPTION}
          </p>

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" className="rounded-xl" asChild>
              <Link href="/inscription">
                <Building2 />
                Je cherche un remplaçant
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl bg-card"
              asChild
            >
              <Link href="/inscription">
                <Stethoscope />
                Je cherche un cabinet
              </Link>
            </Button>
          </div>
        </div>

        {/* Preuve produit */}
        <div className="mx-auto mt-16 max-w-4xl animate-in px-2 fade-in-0 slide-in-from-bottom-6 duration-700 ease-out sm:mt-20 sm:px-0">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
