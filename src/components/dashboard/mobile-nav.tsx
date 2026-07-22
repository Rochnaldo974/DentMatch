"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { LogoMark } from "@/components/shared/logo";
import { APP_NAME } from "@/lib/constants";
import type { UserRole } from "@/lib/data/reference";

/** Navigation mobile : tiroir latéral clair remplaçant la sidebar. */
export function MobileDashboardNav({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-0">
        <SheetHeader className="border-b border-border/60 px-4 py-4">
          <SheetTitle className="flex items-center gap-2.5 font-display text-lg">
            <LogoMark className="size-7" />
            {APP_NAME}
          </SheetTitle>
        </SheetHeader>
        <div className="px-3 py-4">
          <SidebarNav role={role} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
