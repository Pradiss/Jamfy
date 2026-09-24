"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  ArtistProfileForm,
  type ArtistProfileFormValues,
} from "@/components/artist/artist-profile-form";
import { secondaryButtonClass, cardClass } from "@/lib/ui";
import type { ArtistProfileDetail } from "@/lib/types";

function toFormValues(profile: ArtistProfileDetail): ArtistProfileFormValues {
  return {
    artisticName: profile.nomeArtistico,
    city: profile.cidade,
    state: profile.estado,
    biography: profile.biografia ?? "",
    fee: profile.cache ?? "",
    available: profile.disponivel,
    acceptsTravel: profile.aceitaViagem,
  };
}

function toApiPayload(values: ArtistProfileFormValues) {
  return {
    artisticName: values.artisticName,
    city: values.city,
    state: values.state,
    biography: values.biography || undefined,
    fee: values.fee ? Number(values.fee) : undefined,
    available: values.available,
    acceptsTravel: values.acceptsTravel,
  };
}

export function ArtistProfileOwnerControls({
  artist,
}: {
  artist: ArtistProfileDetail;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (!user || user.id !== artist.usuarioId) {
    return null;
  }

  async function handleUpdate(values: ArtistProfileFormValues) {
    await apiFetch("/api/artist-profile", {
      method: "PUT",
      body: toApiPayload(values),
    });
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={secondaryButtonClass}
      >
        Editar perfil
      </button>
    );
  }

  return (
    <div className={`mt-4 p-5 ${cardClass}`}>
      <ArtistProfileForm
        initialValues={toFormValues(artist)}
        submitLabel="Salvar alterações"
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
      />
    </div>
  );
}
