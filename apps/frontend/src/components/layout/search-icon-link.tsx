import Link from "next/link";

export function SearchIconLink() {
  return (
    <Link
      href="/artistas"
      aria-label="Buscar artistas"
      className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4-4" />
      </svg>
    </Link>
  );
}
