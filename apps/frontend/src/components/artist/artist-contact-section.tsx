"use client";

import { useAuth } from "@/lib/auth-context";
import { ReceivedHiringRequests } from "@/components/hiring/received-hiring-requests";
import { HiringRequestForm } from "@/components/hiring/hiring-request-form";
import { ReportDialog } from "@/components/ui/report-dialog";

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

  return (
    <div className="flex flex-col items-start gap-3">
      <HiringRequestForm artistId={artistId} artistUserId={ownerUserId} />
      {user ? (
        <ReportDialog
          tipo="USUARIO"
          referenciaId={ownerUserId}
          triggerLabel="Denunciar este perfil"
        />
      ) : null}
    </div>
  );
}
