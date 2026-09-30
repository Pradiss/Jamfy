"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { secondaryButtonClass } from "@/lib/ui";
import type { ArtistProfileDetail } from "@/lib/types";

export function ArtistProfileOwnerControls({
  artist,
}: {
  artist: ArtistProfileDetail;
}) {
  const { user } = useAuth();

  if (!user || user.id !== artist.usuarioId) {
    return null;
  }

  return (
    <Link href="/perfil/editar" className={secondaryButtonClass}>
      Editar perfil
    </Link>
  );
}
