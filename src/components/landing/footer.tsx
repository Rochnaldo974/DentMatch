import Link from "next/link";
import { FlaskConical, Mail } from "lucide-react";
import { LogoMark } from "@/components/shared/logo";
import { APP_NAME, CONTACT_EMAIL, LEGAL_DISCLAIMER } from "@/lib/constants";

const PRODUCT_LINKS = [
  { href: "#fonctionnement", label: "Comment ça marche" },
  { href: "#cabinets", label: "Pour les cabinets" },
  { href: "#remplacants", label: "Pour les remplaçants" },
  { href: "#securite", label: "Sécurité" },
] as const;

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "/conditions", label: "Conditions d'utilisation" },
  { href: "/cookies", label: "Cookies" },
] as const;

export function LandingFooter() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="flex w-fit items-center gap-2.5 font-display"
              aria-label={`${APP_NAME} — accueil`}
            >
              <LogoMark />
              <span className="text-lg font-semibold tracking-tight text-white">
                {APP_NAME}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sidebar-foreground">
              La mise en relation des cabinets dentaires et des
              chirurgiens-dentistes remplaçants, en France et outre-mer.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-xs font-medium text-sidebar-foreground">
              <FlaskConical className="size-3.5" aria-hidden="true" />
              MVP de démonstration
            </p>
          </div>

          <nav aria-label="Produit">
            <h3 className="text-sm font-semibold text-white/90">Produit</h3>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-sidebar-foreground transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Légal">
            <h3 className="text-sm font-semibold text-white/90">Légal</h3>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-foreground transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold text-white/90">Contact</h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-sidebar-foreground transition-colors hover:text-white"
            >
              <Mail className="size-4" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs leading-relaxed text-sidebar-foreground/60">
            {LEGAL_DISCLAIMER}
          </p>
          <p className="mt-4 text-xs text-sidebar-foreground/60">
            © {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
