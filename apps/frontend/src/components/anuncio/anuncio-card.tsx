import Link from "next/link";
import Image from "next/image";
import type { AnuncioSummary } from "@/lib/types";
import { TIPO_ANUNCIO_LABELS } from "@/lib/types";

const TIPO_BADGE_CLASS: Record<AnuncioSummary["tipo"], string> = {
  VENDA: "bg-emerald-600 text-white",
  COMPRA: "bg-accent text-accent-foreground",
  ALUGUEL: "bg-amber-600 text-white",
};

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M12 21s-6.75-6.13-6.75-11a6.75 6.75 0 1 1 13.5 0c0 4.87-6.75 11-6.75 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  );
}

export function AnuncioCard({ anuncio }: { anuncio: AnuncioSummary }) {
  return (
    <Link
      href={`/anuncios/${anuncio.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-zinc-900/10 dark:border-white/10 dark:bg-zinc-900 dark:hover:shadow-black/40"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        {anuncio.fotos[0] ? (
          <Image
            src={anuncio.fotos[0]}
            alt={anuncio.titulo}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl font-semibold text-zinc-300 dark:text-zinc-700">
            🎸
          </span>
        )}

        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold ${TIPO_BADGE_CLASS[anuncio.tipo]}`}
        >
          {TIPO_ANUNCIO_LABELS[anuncio.tipo]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="truncate font-bold tracking-tight">
          {anuncio.titulo}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {anuncio.categoria}
        </p>

        <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          <PinIcon />
          {anuncio.cidade}, {anuncio.estado}
        </div>

        <p className="mt-1 text-lg font-semibold">
          {anuncio.preco
            ? `R$ ${Number(anuncio.preco).toLocaleString("pt-BR")}`
            : "A combinar"}
        </p>
      </div>
    </Link>
  );
}
