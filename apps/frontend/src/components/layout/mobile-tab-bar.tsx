"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 9.5V19a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16M8 4v3M16 4v3" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5 19.5c1.2-3.3 4-5 7-5s5.8 1.7 7 5" />
    </svg>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isArtist = user?.tipo === "MUSICO" || user?.tipo === "BANDA";

  const profileHref = !user
    ? "/login"
    : isArtist
      ? user.perfilArtista
        ? `/artistas/${user.perfilArtista.slug}`
        : "/dashboard"
      : "/dashboard";

  const panelHref =
    isArtist && user?.perfilArtista
      ? `/artistas/${user.perfilArtista.slug}#agenda`
      : profileHref;

  const panelLabel = isArtist ? "Agenda" : "Painel";

  const items = [
    {
      href: "/",
      label: "Início",
      Icon: HomeIcon,
      active: pathname === "/",
    },
    {
      href: "/artistas",
      label: "Buscar",
      Icon: SearchIcon,
      active: pathname.startsWith("/artistas"),
    },
    {
      href: panelHref,
      label: panelLabel,
      Icon: CalendarIcon,
      active: false,
    },
    {
      href: profileHref,
      label: "Perfil",
      Icon: UserIcon,
      active:
        pathname === profileHref ||
        pathname === "/login" ||
        pathname === "/cadastro",
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-black/5 bg-white/90 backdrop-blur-xl sm:hidden dark:border-white/10 dark:bg-black/90"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
            item.active
              ? "text-zinc-950 dark:text-zinc-50"
              : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          <item.Icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
