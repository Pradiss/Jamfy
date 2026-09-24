"use client";

import { useEffect, useState } from "react";
import {
  getStoredTheme,
  setTheme,
  type ThemePreference,
} from "@/lib/theme";

function resolveIsDark(theme: ThemePreference) {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
    >
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setThemeState] = useState<ThemePreference | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setThemeState(getStoredTheme()));
  }, []);

  if (theme === null) {
    return <span className="h-9 w-9 shrink-0" aria-hidden="true" />;
  }

  const dark = resolveIsDark(theme);

  function handleClick() {
    const next: ThemePreference = dark ? "light" : "dark";
    setThemeState(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-600 transition hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
