import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatTone = "primary" | "teal" | "amber" | "violet" | "rose" | "slate";

const TONES: Record<StatTone, { bar: string; chip: string }> = {
  primary: { bar: "bg-primary", chip: "bg-primary/10 text-primary" },
  teal: { bar: "bg-verified", chip: "bg-verified/10 text-verified" },
  amber: { bar: "bg-amber-500", chip: "bg-amber-500/10 text-amber-600" },
  violet: { bar: "bg-violet-500", chip: "bg-violet-500/10 text-violet-600" },
  rose: { bar: "bg-rose-500", chip: "bg-rose-500/10 text-rose-600" },
  slate: { bar: "bg-slate-400", chip: "bg-slate-400/10 text-slate-500" },
};

/**
 * Indicateur clé façon bloc-titre : liseré coloré en tête, étiquette
 * majuscule, chip d'icône teinté et valeur en chiffres tabulaires.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  href,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: StatTone;
  href?: string;
  className?: string;
}) {
  const t = TONES[tone];

  const card = (
    <Card
      className={cn(
        "relative gap-0 overflow-hidden py-0 transition-all duration-200",
        href && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      <span className={cn("absolute inset-x-0 top-0 h-1", t.bar)} aria-hidden />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <span className="eyebrow pt-1">{label}</span>
          {Icon ? (
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                t.chip,
              )}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
            </span>
          ) : null}
        </div>
        <p className="font-data mt-3 text-3xl font-semibold tracking-tight">
          {value}
        </p>
        {hint ? (
          <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="block rounded-2xl outline-ring/50">
      {card}
    </Link>
  ) : (
    card
  );
}
