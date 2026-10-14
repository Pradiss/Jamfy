"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SearchIconLink } from "@/components/layout/search-icon-link";
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
          ? "border-black/5 bg-white/80 shadow-sm backdrop-blur-xl "
          : "border-transparent bg-white/40 backdrop-blur-md "
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

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/anuncios"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-black/[.04] sm:inline"
          >
            Comprar e vender
          </Link>
          <Link
            href="/anuncios?tipo=ALUGUEL"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-black/[.04] sm:inline"
          >
            Alugar
          </Link>
          <SearchIconLink />

          {loading ? null : user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <div className="flex items-center gap-2 pl-1">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-black/[.04]"
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
