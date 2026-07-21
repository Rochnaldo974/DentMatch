import { Lock, MapPin, ShieldCheck, Zap } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Profils professionnels vérifiés" },
  { icon: Lock, label: "Données sécurisées" },
  { icon: MapPin, label: "France et outre-mer" },
  { icon: Zap, label: "Mise en relation rapide" },
] as const;

export function TrustBar() {
  return (
    <section aria-label="Points de confiance" className="border-y bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-7 sm:px-6 lg:grid-cols-4 lg:divide-x lg:divide-border/70 lg:gap-x-0">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-center gap-2.5 text-center sm:justify-start sm:text-left lg:justify-center lg:px-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <item.icon className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
