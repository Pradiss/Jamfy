"use client";

import { useAuth } from "@/lib/auth-context";
import { AgendaManager } from "@/components/artist/agenda-manager";
import { ArtistAvailability } from "@/components/artist/artist-availability";

export function ArtistAgendaSection({
  artistId,
  ownerUserId,
  slug,
  cidade,
  estado,
}: {
  artistId: string;
  ownerUserId: string;
  slug: string;
  cidade: string;
  estado: string;
}) {
  const { user } = useAuth();

  if (user?.id === ownerUserId) {
    return (
      <div className="mt-10">
        <AgendaManager />
      </div>
    );
  }

  return (
    <ArtistAvailability
      artistId={artistId}
      ownerUserId={ownerUserId}
      slug={slug}
      cidade={cidade}
      estado={estado}
    />
  );
}
