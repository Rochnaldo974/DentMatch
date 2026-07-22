import Link from "next/link";
import { ArrowRight, Building2, Stethoscope } from "lucide-react";
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
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-24">
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
            MVP ouvert aux tests — La Réunion
          </p>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
            <HeroTitle />
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {APP_DESCRIPTION}
          </p>

          <div className="mt-10 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row">
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

        {/* Preuve produit */}
        <div className="mx-auto mt-16 max-w-3xl animate-in px-2 fade-in-0 slide-in-from-bottom-6 duration-700 ease-out sm:mt-20 sm:px-0">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
