import { Lock, MapPin, ShieldCheck, Zap } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Profils professionnels vérifiés" },
  { icon: Lock, label: "Données sécurisées" },
  { icon: MapPin, label: "France et outre-mer" },
  { icon: Zap, label: "Mise en relation rapide" },
] as const;

/** Ligne de confiance discrète, intégrée au pied du hero — sans boîtes. */
export function TrustBar() {
  return (
    <ul
      aria-label="Points de confiance"
      className="flex flex-wrap items-center gap-x-8 gap-y-3"
    >
      {TRUST_ITEMS.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <item.icon className="size-4 text-verified" aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
