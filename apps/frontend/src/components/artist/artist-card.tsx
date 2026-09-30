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

function VerifiedBadgeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4.5 w-4.5 shrink-0 text-accent"
    >
      <path d="M12 2.2c.5 0 .98.2 1.33.56l1.06 1.08c.24.24.55.4.89.44l1.5.18c.94.11 1.68.85 1.79 1.79l.18 1.5c.04.34.2.65.44.89l1.08 1.06c.68.67.68 1.76 0 2.43l-1.08 1.06a1.4 1.4 0 0 0-.44.89l-.18 1.5c-.11.94-.85 1.68-1.79 1.79l-1.5.18c-.34.04-.65.2-.89.44l-1.06 1.08a1.85 1.85 0 0 1-2.66 0l-1.06-1.08a1.4 1.4 0 0 0-.89-.44l-1.5-.18a1.85 1.85 0 0 1-1.79-1.79l-.18-1.5a1.4 1.4 0 0 0-.44-.89L2.13 12.6a1.85 1.85 0 0 1 0-2.43l1.08-1.06c.24-.24.4-.55.44-.89l.18-1.5c.11-.94.85-1.68 1.79-1.79l1.5-.18c.34-.04.65-.2.89-.44l1.06-1.08c.35-.36.83-.56 1.33-.56Z" />
      <path
        d="M8.5 12.3l2.2 2.2 4.8-4.9"
        stroke="var(--background)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
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
      className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-zinc-900/10 dark:border-white/10 dark:bg-zinc-900 dark:hover:shadow-black/40"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface">
        {artist.usuario.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.usuario.fotoUrl}
            alt={artist.nomeArtistico}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-5xl font-semibold text-zinc-300 dark:text-zinc-700">
            {artist.nomeArtistico.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[15px] font-bold tracking-tight">
              {artist.nomeArtistico}
            </h3>
            {artist.verificado ? <VerifiedBadgeIcon /> : null}
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
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 dark:bg-amber-500/10">
              <StarIcon />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {Number(artist.avaliacao).toFixed(1)}
              </span>
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
                className="rounded-full border border-black/5 bg-surface px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <span className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full bg-zinc-950 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-300 group-hover:bg-accent dark:bg-white dark:text-zinc-950 dark:group-hover:bg-accent dark:group-hover:text-accent-foreground">
          Ver perfil
          <ArrowRightIcon />
        </span>
      </div>
    </Link>
  );
}
