"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SearchIconLink } from "@/components/layout/search-icon-link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { containerClass } from "@/lib/ui";

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/70">
      <div
        className={`${containerClass} flex items-center justify-between gap-3 px-4 py-3 sm:px-6`}
      >
        <Link href="/" className="text-[15px] font-medium tracking-tight">
          Jamfy
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <SearchIconLink />
          <ThemeToggle />

          {loading ? null : user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground shadow-sm transition hover:opacity-90 active:scale-[0.97]"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
