import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

/** Monogramme DentMatch : une couronne dentaire stylisée en trait continu. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M10 22.5c-.4-3.2-1.8-5.2-1.8-8.3 0-3.4 2.4-5.7 5.1-5.7 1.1 0 1.9.4 2.7.4s1.6-.4 2.7-.4c2.7 0 5.1 2.3 5.1 5.7 0 3.1-1.4 5.1-1.8 8.3-.1 1-.8 1.5-1.5 1.5-1.3 0-1.2-2-1.7-3.8-.4-1.4-1.2-2.5-2.8-2.5s-2.4 1.1-2.8 2.5c-.5 1.8-.4 3.8-1.7 3.8-.7 0-1.4-.5-1.5-1.5Z"
        className="fill-primary-foreground"
      />
      <circle cx="23.4" cy="9.4" r="3.1" className="fill-verified" />
      <path
        d="m22 9.4.9.9 1.7-1.7"
        stroke="white"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5 font-display", className)}
      aria-label={`${APP_NAME} — accueil`}
    >
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight text-foreground">
        {APP_NAME}
      </span>
    </Link>
  );
}
