"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dashboardPathForRole } from "@/lib/auth";
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignUpInput,
  type SignInInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validation/auth";

export type ActionResult = { error?: string; success?: boolean; info?: string };

const GENERIC_AUTH_ERROR =
  "Identifiants incorrects ou compte inexistant. Vérifiez votre saisie.";

export async function signUp(input: SignUpInput): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        role: parsed.data.role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "Un compte existe déjà avec cette adresse email." };
    }
    return { error: "L'inscription a échoué. Réessayez dans un instant." };
  }

  // Si la confirmation d'email est activée, pas de session immédiate.
  if (data.user && !data.session) {
    return {
      success: true,
      info: "Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.",
    };
  }

  redirect("/onboarding");
}

export async function signIn(input: SignInInput): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: GENERIC_AUTH_ERROR };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: GENERIC_AUTH_ERROR };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: GENERIC_AUTH_ERROR };

  redirect(
    profile.onboarding_completed || profile.role === "admin"
      ? dashboardPathForRole(profile.role)
      : "/onboarding",
  );
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPassword(
  input: ForgotPasswordInput,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email invalide" };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/parametres/mot-de-passe`,
  });

  // Message identique que l'adresse existe ou non (pas de fuite d'information).
  return {
    success: true,
    info: "Si un compte existe avec cette adresse, un email de réinitialisation vient d'être envoyé.",
  };
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Impossible de mettre à jour le mot de passe. Reconnectez-vous via le lien reçu par email." };
  }
  return { success: true, info: "Mot de passe mis à jour." };
}
