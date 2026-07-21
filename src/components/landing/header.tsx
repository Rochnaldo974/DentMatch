"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#fonctionnement", label: "Comment ça marche" },
  { href: "#cabinets", label: "Pour les cabinets" },
  { href: "#remplacants", label: "Pour les remplaçants" },
  { href: "#securite", label: "Sécurité" },
] as const;

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-40 px-3 sm:top-4 sm:px-6">
      <div
        className={cn(
          "glass mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 rounded-full pl-4 pr-2 transition-shadow duration-300 sm:pl-5",
          scrolled && "shadow-[var(--shadow-float)]!"
        )}
      >
        <Logo />

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-0.5 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <Button variant="ghost" className="rounded-full" asChild>
            <Link href="/connexion">Se connecter</Link>
          </Button>
          <Button className="rounded-full" asChild>
            <Link href="/inscription">Tester gratuitement</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full lg:hidden"
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs">
            <SheetHeader className="border-b">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <Logo />
            </SheetHeader>
            <nav
              aria-label="Navigation mobile"
              className="flex flex-col gap-1 px-4"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t p-4">
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/connexion">Se connecter</Link>
              </Button>
              <Button className="rounded-full" asChild>
                <Link href="/inscription">Tester gratuitement</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
