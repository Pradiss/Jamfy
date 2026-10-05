"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { HiringRequestForm } from "@/components/hiring/hiring-request-form";
import { ReportDialog } from "@/components/ui/report-dialog";
import { secondaryButtonClass } from "@/lib/ui";

export function ArtistContactSection({
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
        <Link href="/dashboard" className={secondaryButtonClass}>
          Ver solicitações recebidas
        </Link>
      </div>
    );
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
