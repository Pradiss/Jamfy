import Link from "next/link";
import { SearchX } from "lucide-react";
import { containerClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui";

export default function NotFound() {
  return (
    <div
      className={`${containerClass} flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:py-24`}
    >
      <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-3xl bg-zinc-950 shadow-2xl shadow-accent/10 ring-1 ring-black/5 sm:h-56 sm:w-56">
        <div className="animate-float-orb absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,var(--accent)_0%,transparent_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_80%,rgba(255,255,255,0.12)_0%,transparent_50%)]" />
        <p className="absolute text-[6.5rem] leading-none font-bold tracking-tight text-white/10 select-none sm:text-[8rem]">
          404
        </p>
        <SearchX className="relative h-12 w-12 text-white" strokeWidth={1.5} />
      </div>

      <h1 className="mt-10 text-3xl font-semibold tracking-tight sm:text-4xl">
        Essa página não existe
      </h1>
      <p className="mt-3 max-w-md text-zinc-500 dark:text-zinc-400">
        O link pode estar errado, ou a página pode ter sido removida.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className={primaryButtonClass}>
          Voltar para a home
        </Link>
        <Link href="/artistas" className={secondaryButtonClass}>
          Buscar artistas
        </Link>
      </div>
    </div>
  );
}
