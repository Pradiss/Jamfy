import Link from "next/link";

import { apiFetch } from "@/lib/api";
import type { ArtistProfileListResponse } from "@/lib/types";
import { primaryButtonClass, secondaryButtonClass, containerClass } from "@/lib/ui";
import { ArtistRow } from "@/components/artist/artist-row";
import { GenreCategoryGrid } from "@/components/search/genre-category-grid";

async function fetchArtists(query: string) {
  try {
    const data = await apiFetch<ArtistProfileListResponse>(
      `/api/artist-profile?${query}`,
    );
    return data.artistas;
  } catch {
    return [];
  }
}

async function fetchGenres() {
  try {
    return await apiFetch<{ id: string; nome: string }[]>("/api/genre");
  } catch {
    return [];
  }
}

export default async function Home() {
  const [musicos, bandas, generos] = await Promise.all([
    fetchArtists("tipo=MUSICO&limit=10"),
    fetchArtists("tipo=BANDA&limit=10"),
    fetchGenres(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <section className="px-6 pt-16 pb-16 sm:pt-24 sm:pb-24">
        <div
          className={`${containerClass} grid items-center gap-14 lg:grid-cols-2 lg:gap-16`}
        >
          <div>
            <span className="mb-5 inline-block text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              Jamfy
            </span>

            <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              O artista certo.
              <br />
              Pro seu evento.
            </h1>

            <p className="mt-6 max-w-md text-lg text-zinc-500 dark:text-zinc-400">
              Busque por cidade, gênero e instrumento. Veja a agenda em tempo
              real e contrate em minutos.
            </p>

            <form
              action="/artistas"
              method="get"
              className="mt-8 flex max-w-lg flex-col gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/[.03] sm:flex-row"
            >
              <input
                type="text"
                name="busca"
                placeholder="Cidade, gênero ou nome do artista"
                className="flex-1 rounded-xl bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-400"
              />
              <button
                type="submit"
                className={`${primaryButtonClass} shrink-0 justify-center`}
              >
                Buscar artistas
              </button>
            </form>

            <Link
              href="/cadastro"
              className="mt-5 inline-block font-medium text-accent transition hover:opacity-70"
            >
              Sou artista, quero me cadastrar ↗
            </Link>
          </div>

          <div className="relative pb-8">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-zinc-950 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,var(--accent)_0%,transparent_55%)] opacity-50" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(255,255,255,0.12)_0%,transparent_50%)]" />
            </div>

            <div className="absolute -bottom-2 left-6 flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-lg dark:border-white/10 dark:bg-zinc-900 sm:left-8">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4.5 w-4.5"
                  aria-hidden="true"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="text-sm">
                <p className="font-semibold">Agenda sempre atualizada</p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Veja quem está livre pro seu evento
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${containerClass} px-6 py-10`}>
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">
          Categorias
        </h2>
        <GenreCategoryGrid genres={generos.slice(0, 8)} />
      </section>

      <ArtistRow
        title="Músicos"
        artists={musicos}
        viewAllHref="/artistas?tipo=MUSICO"
      />
      <ArtistRow
        title="Bandas"
        artists={bandas}
        viewAllHref="/artistas?tipo=BANDA"
      />

      <section className="bg-zinc-950 px-6 py-20 text-center text-white sm:py-40">
        <div className={containerClass}>
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-6xl">
            Agenda em tempo real.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-zinc-400 sm:text-lg">
            Veja exatamente quais dias o artista está livre antes de trocar a
            primeira mensagem.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 text-center sm:py-40">
        <div className={containerClass}>
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-6xl">
            Contratação sem enrolação.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-zinc-500 dark:text-zinc-400 sm:text-lg">
            Envie a solicitação, o artista aceita, e o contato é liberado na
            hora — direto pelo WhatsApp.
          </p>
        </div>
      </section>

      <section className="border-t border-black/5 px-6 py-16 text-center dark:border-white/10 sm:py-24">
        <div className={containerClass}>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Pronto para começar?
          </h2>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/artistas" className={primaryButtonClass}>
              Buscar artistas
            </Link>
            <Link href="/cadastro" className={secondaryButtonClass}>
              Criar conta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
