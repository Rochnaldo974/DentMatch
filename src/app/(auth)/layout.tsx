import Link from "next/link";
import { ShieldCheck, Lock, MapPin } from "lucide-react";
import { Logo, LogoMark } from "@/components/shared/logo";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const REASSURANCE_POINTS = [
  {
    icon: ShieldCheck,
    text: `Profils vérifiés par ${APP_NAME}`,
  },
  {
    icon: Lock,
    text: "Documents stockés de manière privée",
  },
  {
    icon: MapPin,
    text: "France et outre-mer",
  },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full">
      {/* Panneau gauche — desktop uniquement */}
      <aside className="band-dark relative hidden w-1/2 max-w-2xl flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-50" />

        <Link
          href="/"
          className="relative flex w-fit items-center gap-2.5 font-display"
          aria-label={`${APP_NAME} — accueil`}
        >
          <LogoMark className="size-9" />
          <span className="text-lg font-semibold tracking-tight text-white">
            {APP_NAME}
          </span>
        </Link>

        <div className="relative space-y-8">
          <p className="max-w-md font-display text-3xl font-semibold leading-tight tracking-tight text-white">
            {APP_TAGLINE}
          </p>
          <ul className="space-y-3">
            {REASSURANCE_POINTS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-night-foreground"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-verified">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-night-foreground/60">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </aside>

      {/* Panneau droit — formulaire */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
