"use client";

import { useEffect, useRef, useState } from "react";
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
import { RoleChoiceDialog } from "@/components/landing/role-choice-dialog";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#fonctionnement", label: "Fonctionnement" },
  { href: "#cabinets", label: "Cabinets" },
  { href: "#remplacants", label: "Remplaçants" },
  { href: "#securite", label: "Sécurité" },
] as const;

/**
 * Navbar flottante : discrète pendant la lecture — elle s'efface quand on
 * descend et réapparaît dès qu'on remonte.
 */
export function LandingHeader() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Cache en descendant (au-delà du hero), montre en remontant.
      if (y > lastY.current + 4 && y > 160) {
        setHidden(true);
      } else if (y < lastY.current - 4 || y <= 160) {
        setHidden(false);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-3 z-40 px-3 transition-transform duration-300 ease-out sm:top-4 sm:px-6",
        hidden && !open && "-translate-y-[150%]",
      )}
    >
      <div
        className={cn(
          "glass mx-auto flex h-13 max-w-5xl items-center justify-between gap-3 rounded-full pl-4 pr-2 transition-shadow duration-300 sm:pl-5",
          scrolled && "shadow-[var(--shadow-float)]!",
        )}
      >
        <Logo />

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-6 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative py-2 text-sm font-medium whitespace-nowrap text-foreground/65 transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
              {/* Trait turquoise qui glisse sous le lien au survol */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 w-0 rounded-full bg-verified transition-all duration-300 ease-out group-hover:w-full"
              />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <Button variant="ghost" className="rounded-full" asChild>
            <Link href="/connexion">Se connecter</Link>
          </Button>
          <RoleChoiceDialog
            trigger={
              <Button className="rounded-full">Tester gratuitement</Button>
            }
          />
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
              <RoleChoiceDialog
                trigger={
                  <Button className="rounded-full">Tester gratuitement</Button>
                }
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
