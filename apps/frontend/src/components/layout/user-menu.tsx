"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { profileHref, profileLabel } from "@/lib/profile-link";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return null;
  }

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  }

  const initial = user.nome.trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition hover:bg-black/[.04] dark:hover:bg-white/[.06]"
      >
        {user.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.fotoUrl}
            alt={user.nome}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">
            {initial}
          </span>
        )}
        <span className="hidden text-sm text-zinc-600 sm:inline dark:text-zinc-400">
          {user.nome.split(" ")[0]}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-52 rounded-2xl border border-black/5 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-zinc-900">
          <Link
            href={profileHref(user)}
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            {profileLabel(user)}
          </Link>
          <Link
            href="/perfil/editar"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            Editar perfil
          </Link>
          <Link
            href="/esqueci-senha"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            Trocar senha
          </Link>
          <Link
            href="/configuracoes"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            Configurações
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
