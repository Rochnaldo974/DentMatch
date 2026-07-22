import { type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Stethoscope } from "lucide-react";
import { APP_DESCRIPTION, APP_TAGLINE } from "@/lib/constants";
import { DashboardPreview } from "./dashboard-preview";
import { TrustBar } from "./trust-bar";

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

/** CTA géant du hero : une couleur franche par audience. */
function HeroCta({
  href,
  icon: Icon,
  children,
  className,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl px-7 text-base font-semibold shadow-[var(--shadow-float)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
    >
      <Icon className="size-5" aria-hidden />
      {children}
      <ArrowRight
        className="size-4.5 transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden
      />
    </Link>
  );
}

export function Hero() {
  return (
    <section className="bg-aurora relative overflow-hidden pt-28 pb-14 sm:pt-36 sm:pb-16">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Colonne texte : entrée en cascade */}
          <div>
            <p
              className="eyebrow animate-rise"
              style={{ "--d": "60ms" } as CSSProperties}
            >
              Remplacements dentaires · La Réunion
            </p>

            <h1
              className="animate-rise mt-6 text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl"
              style={{ "--d": "140ms" } as CSSProperties}
            >
              <HeroTitle />
            </h1>

            <p
              className="animate-rise mt-7 max-w-xl text-xl leading-relaxed text-muted-foreground"
              style={{ "--d": "240ms" } as CSSProperties}
            >
              {APP_DESCRIPTION}
            </p>

            <div
              className="animate-rise mt-10"
              style={{ "--d": "340ms" } as CSSProperties}
            >
              <div className="flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:flex-wrap">
                <HeroCta
                  href="/inscription?role=cabinet"
                  icon={Building2}
                  className="bg-linear-to-b from-primary to-primary/85 text-primary-foreground outline-primary"
                >
                  Je cherche un remplaçant
                </HeroCta>
                <HeroCta
                  href="/inscription?role=remplacant"
                  icon={Stethoscope}
                  className="bg-linear-to-b from-verified to-verified/85 text-verified-foreground outline-verified"
                >
                  Je cherche un cabinet
                </HeroCta>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Gratuit pendant la phase de test · sans engagement
              </p>
            </div>
          </div>

          {/* Colonne preuve produit */}
          <div
            className="animate-rise"
            style={{ "--d": "460ms" } as CSSProperties}
          >
            <DashboardPreview />
          </div>
        </div>

        {/* Ligne de confiance, discrète, au pied du hero */}
        <div
          className="animate-rise mt-16 border-t border-border/60 pt-7 sm:mt-20"
          style={{ "--d": "580ms" } as CSSProperties}
        >
          <TrustBar />
        </div>
      </div>
    </section>
  );
}
