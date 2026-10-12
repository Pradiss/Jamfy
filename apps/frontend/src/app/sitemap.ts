import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import type { ArtistProfileListResponse, AnuncioListResponse } from "@/lib/types";
import { SITE_URL } from "@/lib/config";

const MAX_PAGES = 10;

async function fetchAllArtistSlugs() {
  const slugs: string[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let data: ArtistProfileListResponse;

    try {
      data = await apiFetch<ArtistProfileListResponse>(
        `/api/artist-profile?page=${page}&limit=50`,
      );
    } catch {
      break;
    }

    slugs.push(...data.artistas.map((artist) => artist.slug));

    if (page >= data.paginacao.totalPaginas) {
      break;
    }
  }

  return slugs;
}

async function fetchAllAnuncioIds() {
  const ids: string[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let data: AnuncioListResponse;

    try {
      data = await apiFetch<AnuncioListResponse>(
        `/api/anuncios?page=${page}&limit=50`,
      );
    } catch {
      break;
    }

    ids.push(...data.anuncios.map((anuncio) => anuncio.id));

    if (page >= data.paginacao.totalPaginas) {
      break;
    }
  }

  return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, anuncioIds] = await Promise.all([
    fetchAllArtistSlugs(),
    fetchAllAnuncioIds(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/artistas`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/anuncios`, changeFrequency: "daily", priority: 0.9 },
  ];

  const artistRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/artistas/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const anuncioRoutes: MetadataRoute.Sitemap = anuncioIds.map((id) => ({
    url: `${SITE_URL}/anuncios/${id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...artistRoutes, ...anuncioRoutes];
}
