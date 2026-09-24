import Link from "next/link";
import type { ArtistProfileSummary } from "@/lib/types";

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

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-3.5 w-3.5 shrink-0 text-amber-500"
    >
      <path d="M12 2.5l2.9 6.05 6.6.83-4.85 4.6 1.28 6.6L12 17.6l-5.93 3-1.28-6.6-4.85-4.6 6.6-.83L12 2.5Z" />
    </svg>
  );
}

export function ArtistCard({ artist }: { artist: ArtistProfileSummary }) {
  const specialty =
    artist.artistaFuncaos[0]?.funcao.nome ??
    (artist.tipo === "BANDA" ? "Banda" : "Músico(a)");

  const tags = [
    artist.instrumentos[0]?.instrumento.nome,
    artist.generos[0]?.genero.nome,
  ].filter((tag): tag is string => Boolean(tag));

  return (
    <Link
      href={`/artistas/${artist.slug}`}
      className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900"
    >
      <div className="relative aspect-[3/2] w-full bg-surface">
        {artist.usuario.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.usuario.fotoUrl}
            alt={artist.nomeArtistico}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl font-semibold text-zinc-300 dark:text-zinc-700">
            {artist.nomeArtistico.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-bold tracking-tight">
              {artist.nomeArtistico}
            </h3>
            {artist.verificado ? (
              <span className="shrink-0 text-emerald-600 dark:text-emerald-400">
                ✓
              </span>
            ) : null}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {specialty}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          <PinIcon />
          {artist.cidade}, {artist.estado}
        </div>

        {artist.avaliacao ? (
          <div className="flex items-center gap-1.5 text-sm">
            <StarIcon />
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {Number(artist.avaliacao).toFixed(1)}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              ({artist.quantidadeAvaliacoes} avaliações)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500">
            <StarIcon />
            Novo
          </div>
        )}

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <span className="mt-2 w-full rounded-full bg-zinc-950 py-2.5 text-center text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
          Ver perfil
        </span>
      </div>
    </Link>
  );
}
