import { Plus } from "lucide-react";
import { APP_NAME, LEGAL_DISCLAIMER } from "@/lib/constants";

const FAQ_ITEMS = [
  {
    question: "Qui peut s'inscrire ?",
    answer:
      "Les cabinets dentaires qui recherchent un remplaçant, ainsi que les chirurgiens-dentistes remplaçants et les étudiants remplissant les conditions réglementaires de remplacement, en France métropolitaine et dans les territoires d'outre-mer.",
  },
  {
    question: "L'inscription est-elle gratuite pendant la phase de test ?",
    answer:
      "Oui. Pendant toute la phase de test du MVP, l'inscription et l'ensemble des fonctionnalités sont gratuits, pour les cabinets comme pour les remplaçants.",
  },
  {
    question: "Comment les profils sont-ils vérifiés ?",
    answer: `Les remplaçants transmettent leurs justificatifs professionnels dans un espace privé. Nos équipes contrôlent les informations déclarées et attribuent le badge « Profil vérifié par ${APP_NAME} ». Chaque vérification est datée et historisée.`,
  },
  {
    question: `${APP_NAME} remplace-t-il les démarches auprès de l'Ordre ?`,
    answer: `Non. ${LEGAL_DISCLAIMER}`,
  },
  {
    question: "Puis-je utiliser la plateforme depuis les territoires d'outre-mer ?",
    answer:
      "Oui. La plateforme couvre la France métropolitaine et les territoires d'outre-mer : la recherche géographique permet de cibler précisément votre territoire.",
  },
  {
    question: "Mes documents sont-ils visibles par les autres utilisateurs ?",
    answer:
      "Jamais. Vos justificatifs sont stockés dans un espace privé et ne sont accessibles qu'à vous et à l'équipe chargée de la vérification. Les autres utilisateurs ne voient que votre profil public et votre statut de vérification.",
  },
  {
    question: "Comment un remplacement est-il confirmé ?",
    answer:
      "Le cabinet accepte une candidature sur la plateforme, ce qui ouvre un suivi de remplacement partagé. Les deux parties finalisent ensuite entre elles les démarches contractuelles et réglementaires nécessaires.",
  },
] as const;

export function FaqSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="eyebrow">FAQ</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Questions fréquentes
        </h2>

        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl bg-card px-5 shadow-[var(--shadow-card)] ring-1 ring-black/5 sm:px-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground"
                >
                  <Plus className="size-4 transition-transform duration-200 group-open:rotate-45" />
                </span>
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
