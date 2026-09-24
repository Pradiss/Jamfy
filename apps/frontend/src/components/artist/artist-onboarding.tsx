"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArtistProfileForm,
  type ArtistProfileFormValues,
} from "@/components/artist/artist-profile-form";

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

export function ArtistOnboarding() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    apiFetch<{ slug: string }>("/api/artist-profile/me")
      .then((data) => {
        if (active) router.replace(`/artistas/${data.slug}`);
      })
      .catch(() => {
        if (active) setChecked(true);
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function handleCreate(values: ArtistProfileFormValues) {
    const created = await apiFetch<{ slug: string }>("/api/artist-profile", {
      method: "POST",
      body: toApiPayload(values),
    });
    router.replace(`/artistas/${created.slug}`);
  }

  if (!checked) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">Carregando...</p>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        Criar perfil de artista
      </h1>
      <p className="mb-6 text-zinc-500 dark:text-zinc-400">
        Preencha os dados abaixo para aparecer nas buscas e começar a receber
        solicitações de contratação.
      </p>
      <ArtistProfileForm submitLabel="Criar perfil" onSubmit={handleCreate} />
    </div>
  );
}
