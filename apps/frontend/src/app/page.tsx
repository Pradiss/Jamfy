import { Music } from "lucide-react";

import { apiFetch } from "@/lib/api";
import type { ArtistProfileListResponse } from "@/lib/types";
import { containerClass } from "@/lib/ui";
import { ArtistRow } from "@/components/artist/artist-row";
import { AnuncioRow } from "@/components/anuncio/anuncio-row";
import { GenreCategoryGrid } from "@/components/search/genre-category-grid";
import { HeroSearch } from "@/components/home/hero-search";
import { HeroMockup } from "@/components/home/hero-mockup";
import { AnimatedHeadline } from "@/components/home/animated-headline";
import { FeatureBento } from "@/components/home/feature-bento";
import { AppScreens } from "@/components/home/app-screens";
import { Reveal } from "@/components/ui/reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { sortGenresByPopularity } from "@/lib/popularity";
import type { AnuncioListResponse } from "@/lib/types";

async function fetchArtists(query: string) {
  try {
    const data = await apiFetch<ArtistProfileListResponse>(
      `/api/artist-profile?${query}`,
      { next: { revalidate: 60 } },
    );
    return data.artistas;
  } catch {
    return [];
  }
}

async function fetchAnuncios() {
  try {
    const data = await apiFetch<AnuncioListResponse>(
      "/api/anuncios?limit=10",
      { next: { revalidate: 60 } },
    );
    return data.anuncios;
  } catch {
    return [];
  }
}

async function fetchGenres() {
  try {
    const genres = await apiFetch<{ id: string; nome: string }[]>(
      "/api/genre",
      { next: { revalidate: 3600 } },
    );
    return sortGenresByPopularity(genres);
  } catch {
    return [];
  }
}

export default async function Home() {
  const [musicos, bandas, generos, anuncios] = await Promise.all([
    fetchArtists("tipo=MUSICO&limit=10"),
    fetchArtists("tipo=BANDA&limit=10"),
    fetchGenres(),
    fetchAnuncios(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <section className="px-6 pt-16 pb-16 sm:pt-24 sm:pb-24">
        <div
          className={`${containerClass} grid items-center gap-14 lg:grid-cols-2 lg:gap-16`}
        >
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent">
              <i
                className="hero-dot h-1.5 w-1.5 rounded-full bg-accent"
                aria-hidden="true"
              />
              Novo · Peça orçamento sem sair do site
            </span>

            <AnimatedHeadline
              lines={[
                { words: ["O", "artista", "certo."] },
                { words: ["Pro", "seu", "evento."], accent: true },
              ]}
            />

            <p className="mt-6 max-w-md text-lg text-zinc-500 dark:text-zinc-400">
              Busque por cidade, gênero e instrumento. Veja a agenda em tempo
              real e contrate em minutos.
            </p>

            <HeroSearch />

            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
              Sem comissão sobre o cachê. Contato liberado direto no WhatsApp
              assim que o artista aceita.
            </p>
          </div>

          <div className="relative py-8">
            <HeroMockup />
          </div>
        </div>
      </section>

      <Reveal className={`${containerClass} px-6 py-10`}>
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">
          Categorias
        </h2>
        <GenreCategoryGrid genres={generos.slice(0, 8)} />
      </Reveal>

      <Reveal>
        <ArtistRow
          title="Músicos"
          artists={musicos}
          viewAllHref="/artistas?tipo=MUSICO"
        />
      </Reveal>
      <Reveal>
        <ArtistRow
          title="Bandas"
          artists={bandas}
          viewAllHref="/artistas?tipo=BANDA"
        />
      </Reveal>

      <Reveal>
        <AnuncioRow
          title="Comprar e vender"
          anuncios={anuncios}
          viewAllHref="/anuncios"
        />
      </Reveal>

      <Reveal>
        <FeatureBento />
      </Reveal>

      <Reveal>
        <AppScreens />
      </Reveal>

      <section className="bg-zinc-950 px-6 py-20 text-center text-white sm:py-40">
        <Reveal className={containerClass}>
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-6xl">
            Agenda em tempo real.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-zinc-400 sm:text-lg">
            Veja exatamente quais dias o artista está livre antes de trocar a
            primeira mensagem.
          </p>
        </Reveal>
      </section>

      <section className="px-6 py-20 text-center sm:py-40">
        <Reveal className={containerClass}>
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-6xl">
            Contratação sem enrolação.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-zinc-500 dark:text-zinc-400 sm:text-lg">
            Envie a solicitação, o artista aceita, e o contato é liberado na
            hora — direto pelo WhatsApp.
          </p>
        </Reveal>
      </section>

      <Reveal className={`${containerClass} px-6 py-16 sm:py-24`}>
        <section className="flex flex-col overflow-hidden rounded-3xl bg-accent md:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-6 p-8 sm:p-12">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-accent-foreground sm:text-5xl">
              O palco é seu. Só falta o show.
            </h2>
            <p className="max-w-md text-accent-foreground/80 sm:text-lg">
              Monte seu perfil, apareça pra quem está contratando e receba
              pedidos de show direto aqui — sem depender só de indicação.
            </p>
            <div>
              <MagneticButton href="/cadastro" variant="inverse">
                Criar perfil grátis
              </MagneticButton>
            </div>
          </div>

          <div className="relative hidden min-h-64 flex-1 overflow-hidden bg-zinc-950 md:block">
            <div className="animate-float-orb absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35)_0%,transparent_55%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Music className="h-24 w-24 text-white/20" strokeWidth={1} />
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
