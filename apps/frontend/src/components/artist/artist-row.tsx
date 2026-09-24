import Link from "next/link";
import { ArtistCard } from "@/components/artist/artist-card";
import type { ArtistProfileSummary } from "@/lib/types";
import { containerClass } from "@/lib/ui";

export function ArtistRow({
  title,
  artists,
  viewAllHref,
}: {
  title: string;
  artists: ArtistProfileSummary[];
  viewAllHref?: string;
}) {
  if (artists.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-10">
      <div className={`${containerClass} flex items-center justify-between`}>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-accent hover:underline"
          >
            Ver todos
          </Link>
        ) : null}
      </div>

      <div
        className={`${containerClass} mt-5 flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {artists.map((artist) => (
          <div key={artist.id} className="w-60 shrink-0 sm:w-64">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </div>
    </section>
  );
}
