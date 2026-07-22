import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="band-dark relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12 sm:py-20">
          <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
              Votre prochain remplacement commence ici.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-sidebar-foreground">
              Rejoignez la phase de test gratuite et découvrez une mise en
              relation pensée pour la profession.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="rounded-xl bg-white bg-none text-primary shadow-none hover:bg-white/90"
                asChild
              >
                <Link href="/inscription?role=cabinet">Publier un remplacement</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/inscription?role=remplacant">Découvrir les annonces</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
