import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { apiFetch, ApiError } from "@/lib/api";
import type { ArtistProfileDetail } from "@/lib/types";
import { ArtistProfileOwnerControls } from "@/components/artist/artist-profile-owner-controls";
import { PortfolioManager } from "@/components/artist/portfolio-manager";
import { ArtistAgendaSection } from "@/components/artist/artist-agenda-section";
import { ArtistContactSection } from "@/components/artist/artist-contact-section";
import { AvatarUploader } from "@/components/artist/avatar-uploader";
import { CoverUploader } from "@/components/artist/cover-uploader";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  SpotifyIcon,
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
  { key: "spotifyUrl", label: "Spotify", icon: SpotifyIcon },
  { key: "tiktokUrl", label: "TikTok", icon: TiktokIcon },
];

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface px-3.5 py-1 text-sm text-zinc-700 dark:bg-white/[.06] dark:text-zinc-300">
      {children}
    </span>
  );
}

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
      <div className="relative aspect-[3/1] w-full overflow-hidden bg-surface sm:aspect-[4/1]">
        {artist.fotoCapaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artist.fotoCapaUrl}
            alt={artist.nomeArtistico}
            className="h-full w-full object-cover"
          />
        ) : null}
        <CoverUploader ownerUserId={artist.usuarioId} />
      </div>

      <div className={`${containerClass} px-6 pb-10`}>
        <div className="relative -mt-12 h-24 w-24 sm:-mt-16 sm:h-32 sm:w-32">
          <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-surface shadow-md dark:border-black">
            {artist.usuario.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artist.usuario.fotoUrl}
                alt={artist.nomeArtistico}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-zinc-400 dark:text-zinc-600">
                {artist.nomeArtistico.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute right-0 bottom-0">
            <AvatarUploader ownerUserId={artist.usuarioId} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-4xl font-semibold tracking-tight">
              {artist.nomeArtistico}
              {artist.verificado ? (
                <span className="text-base text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
              ) : null}
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {artist.cidade}, {artist.estado} ·{" "}
              {artist.tipo === "BANDA" ? "Banda" : "Músico(a)"}
              {artist.aceitaViagem ? " · Aceita viagem" : ""}
            </p>
          </div>

          <div className="text-right">
            <p
              className={
                artist.disponivel
                  ? "font-medium text-emerald-600 dark:text-emerald-400"
                  : "font-medium text-zinc-400 dark:text-zinc-600"
              }
            >
              {artist.disponivel ? "Disponível" : "Indisponível"}
            </p>
            {artist.cache ? (
              <p className="text-lg font-semibold">
                R$ {Number(artist.cache).toLocaleString("pt-BR")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <ArtistProfileOwnerControls artist={artist} />
        </div>

      {artist.biografia ? (
        <p className="mt-6 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
          {artist.biografia}
        </p>
      ) : null}

      {artist.experiencia ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {artist.experiencia}
        </p>
      ) : null}

      {artist.instrumentos.length ||
      artist.generos.length ||
      artist.artistaFuncaos.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {artist.artistaFuncaos.map(({ funcao }) => (
            <Tag key={funcao.id}>{funcao.nome}</Tag>
          ))}
          {artist.instrumentos.map(({ instrumento }) => (
            <Tag key={instrumento.id}>{instrumento.nome}</Tag>
          ))}
          {artist.generos.map(({ genero }) => (
            <Tag key={genero.id}>{genero.nome}</Tag>
          ))}
        </div>
      ) : null}

      {SOCIAL_LINKS.some((link) => artist[link.key]) ? (
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          {SOCIAL_LINKS.filter((link) => artist[link.key]).map((link) => (
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
          ))}
        </div>
      ) : null}

      {artist.integrantes.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Integrantes
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {artist.integrantes.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[.03]"
              >
                <p className="font-medium">{member.nome}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {member.funcao ?? member.outraFuncao ?? member.instrumento}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <PortfolioManager
        items={artist.portfolio}
        ownerUserId={artist.usuarioId}
      />

      <div id="agenda" className="scroll-mt-20">
        <ArtistAgendaSection
          artistId={artist.id}
          ownerUserId={artist.usuarioId}
        />
      </div>

        <ArtistContactSection
          artistId={artist.id}
          ownerUserId={artist.usuarioId}
        />
      </div>
    </div>
  );
}
