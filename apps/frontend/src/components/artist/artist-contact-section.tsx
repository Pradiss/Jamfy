"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { HiringRequestForm } from "@/components/hiring/hiring-request-form";
import { secondaryButtonClass } from "@/lib/ui";

export function ArtistContactSection(props: {
  artistId: string;
  ownerUserId: string;
  cidade: string;
  estado: string;
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
  cidade,
  estado,
}: {
  artistId: string;
  ownerUserId: string;
  cidade: string;
  estado: string;
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
    <HiringRequestForm
      artistId={artistId}
      artistUserId={ownerUserId}
      initialDate={initialDate}
      cidade={cidade}
      estado={estado}
    />
  );
}
