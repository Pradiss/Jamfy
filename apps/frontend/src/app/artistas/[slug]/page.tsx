import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Music2, Guitar, Mic2 } from "lucide-react";
import type { Metadata } from "next";

import { apiFetch, ApiError } from "@/lib/api";
import type { ArtistProfileDetail } from "@/lib/types";
import { ArtistProfileOwnerControls } from "@/components/artist/artist-profile-owner-controls";
import { ArtistReportControl } from "@/components/artist/artist-report-control";
import { ArtistProfileTabs } from "@/components/artist/artist-profile-tabs";
import { StickyHireBar } from "@/components/artist/sticky-hire-bar";
import { PortfolioManager } from "@/components/artist/portfolio-manager";
import { ArtistAgendaSection } from "@/components/artist/artist-agenda-section";
import { ArtistContactSection } from "@/components/artist/artist-contact-section";
import { ArtistReviewsSection } from "@/components/artist/artist-reviews-section";
import { AvatarUploader } from "@/components/artist/avatar-uploader";
import { CoverUploader } from "@/components/artist/cover-uploader";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  TiktokIcon,
} from "@/components/artist/social-icons";
import { containerClass } from "@/lib/ui";

const SOCIAL_LINKS: {
  key: keyof ArtistProfileDetail;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
}[] = [
  { key: "instagramUrl", label: "Instagram", icon: InstagramIcon },
  { key: "facebookUrl", label: "Facebook", icon: FacebookIcon },
  { key: "youtubeUrl", label: "YouTube", icon: YoutubeIcon },
  { key: "tiktokUrl", label: "TikTok", icon: TiktokIcon },
];

const TAG_GROUP_STYLES = {
  accent: {
    icon: "text-accent",
    chip: "bg-accent/10 text-accent",
  },
  emerald: {
    icon: "text-emerald-600 ",
    chip:
      "bg-emerald-50 text-emerald-700 ",
  },
  amber: {
    icon: "text-amber-600 ",
    chip: "bg-amber-50 text-amber-700 ",
  },
} as const;

function TagGroup({
  label,
  items,
  icon: Icon,
  tone,
}: {
  label: string;
  items: string[];
  icon: (props: { className?: string }) => React.ReactNode;
  tone: keyof typeof TAG_GROUP_STYLES;
}) {
  const styles = TAG_GROUP_STYLES[tone];

  return (
    <div className="flex items-start gap-2">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${styles.icon}`} />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase ">
          {label}
        </span>
        {items.map((nome) => (
          <span
            key={nome}
            className={`rounded-full px-3 py-1 text-sm font-medium ${styles.chip}`}
          >
            {nome}
          </span>
        ))}
      </div>
    </div>
  );
}

// Not cached on purpose — every call to this endpoint also increments the
// artist's view counter server-side (fire-and-forget), so caching the
// response would silently undercount views for every cache hit.
const getArtistBySlug = cache((slug: string) =>
  apiFetch<ArtistProfileDetail>(`/api/artist-profile/${slug}`),
);

export async function generateMetadata(
  props: PageProps<"/artistas/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;

  try {
    const artist = await getArtistBySlug(slug);

    const tipoLabel = artist.tipo === "BANDA" ? "Banda" : "Músico(a)";
    const description = (
      artist.biografia?.trim() ||
      `${artist.nomeArtistico} — ${tipoLabel} em ${artist.cidade}, ${artist.estado}. Veja a agenda, o portfólio e solicite uma contratação pelo Jamfy.`
    ).slice(0, 160);
    const image = artist.fotoCapaUrl ?? artist.usuario.fotoUrl ?? undefined;

    return {
      title: `${artist.nomeArtistico} | Jamfy`,
      description,
      openGraph: {
        title: artist.nomeArtistico,
        description,
        type: "profile",
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: artist.nomeArtistico,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {
      title: "Artista não encontrado | Jamfy",
    };
  }
}

export default async function ArtistaPage(
  props: PageProps<"/artistas/[slug]">,
) {
  const { slug } = await props.params;

  let artist: ArtistProfileDetail;

  try {
    artist = await getArtistBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="flex-1">
      <StickyHireBar ownerUserId={artist.usuarioId} cache={artist.cache} />

      <div className="relative aspect-[3/1] w-full overflow-hidden bg-surface sm:aspect-[4/1]">
        {artist.fotoCapaUrl ? (
          <Image
            src={artist.fotoCapaUrl}
            alt={artist.nomeArtistico}
            fill
            sizes="100vw"
            preload
            className="object-cover"
          />
        ) : null}
        <CoverUploader ownerUserId={artist.usuarioId} />
      </div>

      <div className={`${containerClass} px-6 pb-10`}>
        <div className="relative -mt-12 h-24 w-24 sm:-mt-16 sm:h-32 sm:w-32">
          <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-surface shadow-md ">
            {artist.usuario.fotoUrl ? (
              <Image
                src={artist.usuario.fotoUrl}
                alt={artist.nomeArtistico}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-zinc-400 ">
                {artist.nomeArtistico.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute right-0 bottom-0">
            <AvatarUploader ownerUserId={artist.usuarioId} />
          </div>
        </div>

        <div className="mt-4">
          <h1 className="flex items-center gap-2 text-4xl font-semibold tracking-tight">
            {artist.nomeArtistico}
            {artist.verificado ? (
              <span className="text-base text-emerald-600">✓</span>
            ) : null}
          </h1>
          <p className="mt-1 text-zinc-500">
            {artist.cidade}, {artist.estado}
          </p>

          {artist.quantidadeAvaliacoes > 0 ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 fill-current text-accent" />
              <span className="font-semibold">
                {Number(artist.avaliacao).toLocaleString("pt-BR", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
              <span className="text-zinc-500">
                ({artist.quantidadeAvaliacoes}{" "}
                {artist.quantidadeAvaliacoes === 1
                  ? "avaliação"
                  : "avaliações"}
                )
              </span>
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <ArtistProfileOwnerControls artist={artist} />
            <ArtistReportControl ownerUserId={artist.usuarioId} />

            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-zinc-600">
              {artist.tipo === "BANDA" ? "Banda" : "Músico(a)"}
            </span>
            {artist.aceitaViagem ? (
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-zinc-600">
                Aceita viagem
              </span>
            ) : null}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                artist.disponivel
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {artist.disponivel ? "Disponível" : "Indisponível"}
            </span>
            {artist.cache ? (
              <span className="text-sm font-semibold">
                R$ {Number(artist.cache).toLocaleString("pt-BR")}
              </span>
            ) : null}
          </div>
        </div>

        <ArtistProfileTabs
          portfolio={
            <PortfolioManager
              items={artist.portfolio}
              ownerUserId={artist.usuarioId}
            />
          }
          sobre={
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                {artist.generos.length ? (
                  <TagGroup
                    label="Gêneros"
                    icon={Music2}
                    tone="accent"
                    items={artist.generos.map(({ genero }) => genero.nome)}
                  />
                ) : null}
                {artist.instrumentos.length ? (
                  <TagGroup
                    label="Instrumentos"
                    icon={Guitar}
                    tone="emerald"
                    items={artist.instrumentos.map(
                      ({ instrumento }) => instrumento.nome,
                    )}
                  />
                ) : null}
                {artist.artistaFuncaos.length ? (
                  <TagGroup
                    label="Funções"
                    icon={Mic2}
                    tone="amber"
                    items={artist.artistaFuncaos.map(
                      ({ funcao }) => funcao.nome,
                    )}
                  />
                ) : null}
              </div>

              {artist.biografia ? (
                <p className="whitespace-pre-line text-zinc-700">
                  {artist.biografia}
                </p>
              ) : null}

              {artist.experiencia ? (
                <p className="text-sm text-zinc-500">{artist.experiencia}</p>
              ) : null}

              {SOCIAL_LINKS.some((link) => artist[link.key]) ? (
                <div className="flex flex-wrap gap-4 text-sm">
                  {SOCIAL_LINKS.filter((link) => artist[link.key]).map(
                    (link) => (
                      <a
                        key={link.key}
                        href={artist[link.key] as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-accent underline-offset-2 transition hover:underline"
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </a>
                    ),
                  )}
                </div>
              ) : null}

              {artist.integrantes.length > 0 ? (
                <section>
                  <h2 className="mb-4 text-xl font-semibold tracking-tight">
                    Integrantes
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {artist.integrantes.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
                      >
                        <p className="font-medium">{member.nome}</p>
                        <p className="text-sm text-zinc-500">
                          {member.funcao ??
                            member.outraFuncao ??
                            member.instrumento}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          }
          avaliacoes={
            <ArtistReviewsSection
              artistId={artist.id}
              avaliacao={artist.avaliacao}
              quantidadeAvaliacoes={artist.quantidadeAvaliacoes}
            />
          }
          agenda={
            <>
              <div id="agenda" className="scroll-mt-20">
                <ArtistAgendaSection
                  artistId={artist.id}
                  ownerUserId={artist.usuarioId}
                  slug={slug}
                  cidade={artist.cidade}
                  estado={artist.estado}
                />
              </div>

              <div id="contratar" className="mt-10 scroll-mt-20">
                <ArtistContactSection
                  artistId={artist.id}
                  ownerUserId={artist.usuarioId}
                  cidade={artist.cidade}
                  estado={artist.estado}
                />
              </div>
            </>
          }
        />
      </div>
    </div>
  );
}
