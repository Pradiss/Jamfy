"use client";

import { useAuth } from "@/lib/auth-context";
import { AgendaManager } from "@/components/artist/agenda-manager";
import { ArtistAvailability } from "@/components/artist/artist-availability";

export function ArtistAgendaSection({
  artistId,
  ownerUserId,
}: {
  artistId: string;
  ownerUserId: string;
}) {
  const { user } = useAuth();

  if (user?.id === ownerUserId) {
    return (
      <div className="mt-10">
        <AgendaManager />
      </div>
    );
  }

  return <ArtistAvailability artistId={artistId} />;
}
