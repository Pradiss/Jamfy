export const primaryButtonClass =
  "rounded-full bg-accent px-6 py-2.5 font-medium text-accent-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100";

export const secondaryButtonClass =
  "rounded-full border border-black/10 px-6 py-2.5 font-medium transition hover:bg-black/[.03] active:scale-[0.98] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[.06]";

export const cardClass =
  "rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/[.03]";

// Shared page-width standard, in pixels, so every screen lines up with the
// header instead of mixing Tailwind's rem-based max-w-3xl/max-w-5xl sizes.
export const containerClass = "mx-auto w-full max-w-[1250px]";
