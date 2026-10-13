"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SearchIconLink } from "@/components/layout/search-icon-link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { containerClass } from "@/lib/ui";
import { isChromelessRoute } from "@/lib/chromeless-routes";

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isChromelessRoute(pathname)) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled
          ? "border-black/5 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/80"
          : "border-transparent bg-white/40 backdrop-blur-md dark:bg-black/40"
      }`}
    >
      <div
        className={`${containerClass} flex items-center justify-between gap-3 px-4 transition-[padding] duration-300 sm:px-6 ${
          scrolled ? "py-2.5" : "py-3.5"
        }`}
      >
        <div className="flex items-center gap-5">
          <Link href="/" className="text-[15px] font-medium tracking-tight">
            Jamfy
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/anuncios"
            className="hidden text-sm font-medium text-zinc-600 transition hover:text-zinc-950 sm:inline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Comprar e vender
          </Link>
          <Link
            href="/anuncios?tipo=ALUGUEL"
            className="hidden text-sm font-medium text-zinc-600 transition hover:text-zinc-950 sm:inline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Alugar
          </Link>
          <SearchIconLink />
          {/* Logged-in users control the theme from Configurações instead —
              keeping it here too would just be a redundant second control. */}
          {!loading && !user ? <ThemeToggle /> : null}

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
              <MagneticButton href="/cadastro" size="compact">
                Cadastrar
              </MagneticButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
