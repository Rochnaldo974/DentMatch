import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { APP_NAME, LEGAL_DISCLAIMER } from "@/lib/constants";

/**
 * Coque partagée des pages légales : header léger, encadré « contenu
 * provisoire », contenu type prose et pied de page minimal.
 */
export function LegalPageLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <Alert className="border-warning/40 bg-warning-soft text-warning-foreground">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Contenu juridique provisoire</AlertTitle>
          <AlertDescription className="text-warning-foreground/90">
            À faire valider par un professionnel du droit avant toute mise en
            production.
          </AlertDescription>
        </Alert>

        <h1 className="mt-10 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Dernière mise à jour : {updatedAt}
        </p>

        <article className="mt-10 space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </article>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {LEGAL_DISCLAIMER}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </footer>
    </div>
  );
}
