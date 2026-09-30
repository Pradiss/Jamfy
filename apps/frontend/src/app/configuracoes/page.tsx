"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { secondaryButtonClass, cardClass, containerClass } from "@/lib/ui";
import {
  getStoredTheme,
  setTheme as persistTheme,
  type ThemePreference,
} from "@/lib/theme";

const TIPO_LABELS: Record<string, string> = {
  MUSICO: "Músico(a)",
  BANDA: "Banda",
  CONTRATANTE: "Contratante",
  ADMIN: "Administrador",
};

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "system", label: "Sistema" },
];

const SUPPORT_EMAIL = "suporte@jamfy.com.br";

export default function ConfiguracoesPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [theme, setThemeState] = useState<ThemePreference>("system");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    Promise.resolve().then(() => setThemeState(getStoredTheme()));
  }, []);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 dark:text-zinc-400">
        Carregando...
      </div>
    );
  }

  function handleThemeChange(value: ThemePreference) {
    setThemeState(value);
    persistTheme(value);
  }

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <div className={`${containerClass} flex-1 px-6 py-10`}>
      <div className="mx-auto w-full max-w-md">
      <h1 className="mb-7 text-3xl font-semibold tracking-tight">
        Configurações
      </h1>

      <div className={`flex flex-col gap-1 p-5 ${cardClass}`}>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Tipo de conta
        </p>
        <p className="text-sm">{TIPO_LABELS[user.tipo] ?? user.tipo}</p>
      </div>

      <div className={`mt-6 flex flex-col divide-y divide-black/5 p-1.5 ${cardClass} dark:divide-white/10`}>
        <Link
          href="/perfil/editar"
          className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition hover:bg-black/[.03] dark:hover:bg-white/[.06]"
        >
          Editar perfil
          <span className="text-zinc-400">›</span>
        </Link>
        <Link
          href="/esqueci-senha"
          className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition hover:bg-black/[.03] dark:hover:bg-white/[.06]"
        >
          Trocar senha
          <span className="text-zinc-400">›</span>
        </Link>
      </div>

      <div className={`mt-6 p-5 ${cardClass}`}>
        <p className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Aparência
        </p>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleThemeChange(option.value)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                theme === option.value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-black/10 hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`mt-6 p-5 ${cardClass}`}>
        <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Suporte
        </p>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">
          Encontrou um problema ou precisa de ajuda com sua conta?
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-sm font-medium text-accent hover:underline"
        >
          Falar com o suporte ↗
        </a>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className={`mt-6 ${secondaryButtonClass}`}
      >
        Sair da conta
      </button>
      </div>
    </div>
  );
}
