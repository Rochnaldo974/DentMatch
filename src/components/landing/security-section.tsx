import { ShieldCheck } from "lucide-react";
import { LEGAL_DISCLAIMER } from "@/lib/constants";

const SECURITY_POINTS = [
  {
    title: "Authentification sécurisée",
    description: "Comptes protégés par mot de passe robuste et sessions chiffrées.",
  },
  {
    title: "Stockage privé des documents",
    description: "Vos justificatifs sont conservés dans un espace privé, jamais exposés publiquement.",
  },
  {
    title: "Contrôle des accès",
    description: "Chaque rôle n'accède qu'aux données qui le concernent, côté serveur.",
  },
  {
    title: "Principes RGPD",
    description: "Collecte minimale, finalités précises et droits d'accès, de rectification et d'effacement.",
  },
  {
    title: "Suppression de compte possible",
    description: "Vous pouvez exporter vos données puis supprimer votre compte à tout moment.",
  },
  {
    title: "Traçabilité des vérifications",
    description: "Chaque contrôle d'information professionnelle est daté et historisé.",
  },
  {
    title: "Données professionnelles séparées",
    description: "Les informations sensibles sont distinctes de votre profil public.",
  },
] as const;

export function SecuritySection() {
  return (
    <section id="securite" className="scroll-mt-28 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="eyebrow">Sécurité &amp; confidentialité</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              La confiance se construit sur des bases solides.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Informations professionnelles contrôlées, documents privés et
              respect de vos données : la sécurité fait partie du produit.
            </p>

            <div className="mt-8 rounded-r-xl border-l-2 border-verified bg-verified-soft/40 p-4">
              <p className="text-sm font-semibold text-foreground">
                Bon à savoir
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {LEGAL_DISCLAIMER}
              </p>
            </div>
          </div>

          <div>
            <ul className="divide-y divide-border/70">
              {SECURITY_POINTS.map((point) => (
                <li
                  key={point.title}
                  className="flex gap-3.5 py-4 first:pt-0 last:pb-0"
                >
                  <ShieldCheck
                    className="mt-0.5 size-5 shrink-0 text-verified"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold">{point.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {point.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
