"use client";

import { useAuth } from "@/lib/auth-context";
import { ReceivedHiringRequests } from "@/components/hiring/received-hiring-requests";
import { HiringRequestForm } from "@/components/hiring/hiring-request-form";

export function ArtistContactSection({
  artistId,
  ownerUserId,
}: {
  artistId: string;
  ownerUserId: string;
}) {
  const { user } = useAuth();

  if (user?.id === ownerUserId) {
    return <ReceivedHiringRequests />;
  }

  return <HiringRequestForm artistId={artistId} artistUserId={ownerUserId} />;
}
