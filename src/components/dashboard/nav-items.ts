"use client";

import {
  LayoutDashboard,
  Megaphone,
  Users,
  CalendarCheck,
  MessageSquare,
  Building2,
  FileCheck,
  Bell,
  Settings,
  Search,
  Send,
  CalendarDays,
  UserRound,
  ShieldCheck,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/data/reference";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const CABINET_NAV: NavItem[] = [
  { href: "/cabinet/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/cabinet/annonces", label: "Mes annonces", icon: Megaphone },
  { href: "/cabinet/candidatures", label: "Candidatures", icon: Users },
  { href: "/cabinet/remplacements", label: "Remplacements", icon: CalendarCheck },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/cabinet/profil", label: "Profil du cabinet", icon: Building2 },
  { href: "/cabinet/documents", label: "Documents", icon: FileCheck },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export const REPLACEMENT_NAV: NavItem[] = [
  { href: "/remplacant/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/remplacant/annonces", label: "Rechercher", icon: Search },
  { href: "/remplacant/candidatures", label: "Mes candidatures", icon: Send },
  { href: "/remplacant/remplacements", label: "Mes remplacements", icon: CalendarCheck },
  { href: "/remplacant/disponibilites", label: "Disponibilités", icon: CalendarDays },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/remplacant/profil", label: "Mon profil", icon: UserRound },
  { href: "/remplacant/documents", label: "Mes documents", icon: FileCheck },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: ShieldCheck },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/annonces", label: "Annonces", icon: Megaphone },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

/** Navigation correspondant au rôle — résolue côté client uniquement
 * (les composants d'icônes ne peuvent pas traverser la frontière serveur → client). */
export function navItemsForRole(role: UserRole): NavItem[] {
  switch (role) {
    case "admin":
      return ADMIN_NAV;
    case "cabinet":
      return CABINET_NAV;
    case "replacement_dentist":
      return REPLACEMENT_NAV;
  }
}
