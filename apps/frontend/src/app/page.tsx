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
import { MarketplaceHighlight } from "@/components/home/marketplace-highlight";
import { Reveal } from "@/components/ui/reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { sortGenresByPopularity } from "@/lib/popularity";
import type { AnuncioListResponse } from "@/lib/types";

async function fetchArtists(query: string) {
  try {
    return await apiFetch<ArtistProfileListResponse>(
      `/api/artist-profile?${query}`,
      { next: { revalidate: 60 } },
    );
  } catch {
    return null;
  }
}

async function fetchAnuncios() {
  try {
    return await apiFetch<AnuncioListResponse>(
      "/api/anuncios?limit=10",
      { next: { revalidate: 60 } },
    );
  } catch {
    return null;
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
  const [musicosData, bandasData, generos, anunciosData] = await Promise.all([
    fetchArtists("tipo=MUSICO&limit=10"),
    fetchArtists("tipo=BANDA&limit=10"),
    fetchGenres(),
    fetchAnuncios(),
  ]);

  const musicos = musicosData?.artistas ?? [];
  const bandas = bandasData?.artistas ?? [];
  const anuncios = anunciosData?.anuncios ?? [];

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

            <p className="mt-6 max-w-md text-lg text-zinc-500 ">
              Busque por cidade, gênero e instrumento. Veja a agenda em tempo
              real e contrate em minutos.
            </p>

            <HeroSearch />

            <p className="mt-6 text-sm text-zinc-500 ">
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
        <MarketplaceHighlight />
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
          <p className="mx-auto mt-5 max-w-md text-base text-zinc-500 sm:text-lg">
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

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["#f472b6", "#22d3ee", "#facc15", "#34d399"].map((color) => (
                  <span
                    key={color}
                    className="h-8 w-8 rounded-full border-2 border-accent"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm text-accent-foreground/70">
                Músicos e bandas de todo o Brasil já estão por aqui.
              </p>
            </div>
          </div>

          <div className="relative hidden min-h-64 flex-1 overflow-hidden bg-zinc-950 md:block">
            <div
              className="cta-blob h-56 w-56 bg-fuchsia-500/70"
              style={{ top: "-10%", left: "-5%" }}
            />
            <div
              className="cta-blob h-64 w-64 bg-cyan-400/60"
              style={{ bottom: "-15%", right: "-10%", animationDelay: "-5s" }}
            />
            <div
              className="cta-blob h-40 w-40 bg-yellow-300/60"
              style={{ top: "35%", left: "30%", animationDelay: "-10s" }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <Music className="h-24 w-24 text-white/25" strokeWidth={1} />
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
