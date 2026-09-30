"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { profileHref, profileLabel } from "@/lib/profile-link";

function SearchIcon({ className }: { className: string }) {
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

export function HeroSearch() {
  const { user } = useAuth();

  const secondTab = user
    ? { href: profileHref(user), label: profileLabel(user) }
    : { href: "/cadastro", label: "Sou artista" };

  return (
    <div className="mt-8 max-w-lg">
      <div className="flex gap-1 rounded-full bg-black/5 p-1 dark:bg-white/10">
        <span className="flex-1 rounded-full bg-white px-4 py-2 text-center text-sm font-semibold shadow-sm dark:bg-zinc-900">
          Buscar artista
        </span>
        <Link
          href={secondTab.href}
          className="flex-1 rounded-full px-4 py-2 text-center text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {secondTab.label}
        </Link>
      </div>

      <form
        action="/artistas"
        method="get"
        className="mt-2 flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center px-2">
          <input
            type="text"
            name="busca"
            placeholder="Cidade, gênero ou nome do artista"
            className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-zinc-400"
          />
        </div>
        <button
          type="submit"
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] dark:bg-white dark:text-zinc-950"
        >
          Buscar
          <SearchIcon className="h-4 w-4 shrink-0" />
        </button>
      </form>

      {!user ? (
        <Link
          href="/cadastro"
          className="mt-5 inline-block font-medium text-accent transition hover:opacity-70"
        >
          Sou artista, quero me cadastrar ↗
        </Link>
      ) : null}
    </div>
  );
}
