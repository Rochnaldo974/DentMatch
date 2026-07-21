"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItemsForRole } from "@/components/dashboard/nav-items";
import type { UserRole } from "@/lib/data/reference";

export function SidebarNav({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navItemsForRole(role);

  return (
    <nav aria-label="Navigation principale" className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
              active
                ? "bg-white/10 text-white"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            {/* Indicateur turquoise de la page active */}
            <span
              className={cn(
                "absolute left-0 h-5 w-0.75 rounded-full bg-sidebar-primary transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />
            <Icon
              className={cn(
                "size-4.5 shrink-0 transition-colors",
                active
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground",
              )}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
