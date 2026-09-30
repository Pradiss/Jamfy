import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import type { ArtistProfileListResponse } from "@/lib/types";
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await fetchAllArtistSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/artistas`, changeFrequency: "daily", priority: 0.9 },
  ];

  const artistRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/artistas/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...artistRoutes];
}
