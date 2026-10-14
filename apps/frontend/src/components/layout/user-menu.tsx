"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
        aria-label="Abrir menu da conta"
        className="relative block rounded-full transition hover:opacity-80"
      >
        {user.fotoUrl ? (
          <Image
            src={user.fotoUrl}
            alt={user.nome}
            width={34}
            height={34}
            className="h-8.5 w-8.5 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
            {initial}
          </span>
        )}
        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
      </button>

      {open ? (
        <div className="absolute right-0 z-10 mt-3 w-60 rounded-2xl border border-black/5 bg-white p-1.5 shadow-xl">
          <Link
            href={profileHref(user)}
            onClick={() => setOpen(false)}
            className="flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition hover:bg-black/[.03]"
          >
            {user.fotoUrl ? (
              <Image
                src={user.fotoUrl}
                alt={user.nome}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-lg font-semibold text-white">
                {initial}
              </span>
            )}
            <span className="text-sm font-semibold tracking-tight">
              {user.nome}
            </span>
            <span className="text-xs text-zinc-400">
              {profileLabel(user)}
            </span>
          </Link>

          <div className="my-1 border-t border-black/5" />

          <Link
            href="/perfil/editar"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-black/[.04]"
          >
            Editar perfil
          </Link>
          <Link
            href="/anuncios/meus"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-black/[.04]"
          >
            Meus anúncios
          </Link>
          <Link
            href="/conversas"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-black/[.04]"
          >
            Conversas
          </Link>
          <Link
            href="/esqueci-senha"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-black/[.04]"
          >
            Trocar senha
          </Link>
          <Link
            href="/configuracoes"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm transition hover:bg-black/[.04]"
          >
            Configurações
          </Link>

          <div className="my-1 border-t border-black/5" />

          <button
            type="button"
            onClick={handleLogout}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
