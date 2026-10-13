"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { HiringRequestForm } from "@/components/hiring/hiring-request-form";
import { ReportDialog } from "@/components/ui/report-dialog";
import { secondaryButtonClass } from "@/lib/ui";

export function ArtistContactSection(props: {
  artistId: string;
  ownerUserId: string;
}) {
  return (
    <Suspense fallback={null}>
      <ArtistContactSectionInner {...props} />
    </Suspense>
  );
}

function ArtistContactSectionInner({
  artistId,
  ownerUserId,
}: {
  artistId: string;
  ownerUserId: string;
}) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("data") ?? undefined;

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
      <HiringRequestForm
        artistId={artistId}
        artistUserId={ownerUserId}
        initialDate={initialDate}
      />
      {user ? (
        <ReportDialog
          tipo="USUARIO"
          referenciaId={ownerUserId}
          triggerLabel="Denunciar est perfil"
        />
      ) : null}
    </div>
  );
}
