import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/** Préfixes de routes réservés aux utilisateurs connectés. */
const PROTECTED_PREFIXES = [
  "/cabinet",
  "/remplacant",
  "/messages",
  "/notifications",
  "/parametres",
  "/admin",
  "/onboarding",
];

/** Routes d'authentification (inaccessibles une fois connecté). */
const AUTH_ROUTES = ["/connexion", "/inscription", "/mot-de-passe-oublie"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT : ne rien exécuter entre createServerClient et getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("redirection", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (isProtected || isAuthRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profile) {
      const dashboard =
        profile.role === "admin"
          ? "/admin"
          : profile.role === "cabinet"
            ? "/cabinet/dashboard"
            : "/remplacant/dashboard";

      // Un utilisateur connecté n'a rien à faire sur les pages d'authentification.
      if (isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = profile.onboarding_completed ? dashboard : "/onboarding";
        url.search = "";
        return NextResponse.redirect(url);
      }

      // Onboarding obligatoire avant d'accéder aux espaces.
      if (
        !profile.onboarding_completed &&
        profile.role !== "admin" &&
        !pathname.startsWith("/onboarding") &&
        !pathname.startsWith("/parametres")
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        url.search = "";
        return NextResponse.redirect(url);
      }

      // Cloisonnement strict des rôles.
      if (pathname.startsWith("/admin") && profile.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = dashboard;
        url.search = "";
        return NextResponse.redirect(url);
      }
      if (pathname.startsWith("/cabinet") && profile.role !== "cabinet") {
        const url = request.nextUrl.clone();
        url.pathname = profile.role === "admin" ? "/admin" : "/remplacant/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
      }
      if (
        pathname.startsWith("/remplacant") &&
        profile.role !== "replacement_dentist"
      ) {
        const url = request.nextUrl.clone();
        url.pathname = profile.role === "admin" ? "/admin" : "/cabinet/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
      }
      if (
        pathname.startsWith("/onboarding") &&
        (profile.onboarding_completed || profile.role === "admin")
      ) {
        const url = request.nextUrl.clone();
        url.pathname = dashboard;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
