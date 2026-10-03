"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  ArtistProfileForm,
  type ArtistProfileFormValues,
} from "@/components/artist/artist-profile-form";
import { ArtistFunctionsForm } from "@/components/artist/artist-functions-form";
import { ArtistInstrumentsForm } from "@/components/artist/artist-instruments-form";
import { ArtistGenresForm } from "@/components/artist/artist-genres-form";
import { primaryButtonClass } from "@/lib/ui";

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
  const [slug, setSlug] = useState<string | null>(null);

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
    setSlug(created.slug);
  }

  if (!checked) {
    return <p className="text-zinc-500 dark:text-zinc-400">Carregando...</p>;
  }

  if (slug) {
    return (
      <div>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">
          Quase lá! O que você toca?
        </h1>
        <p className="mb-6 text-zinc-500 dark:text-zinc-400">
          Isso ajuda contratantes a te encontrar na busca por instrumento e
          gênero. Dá pra editar isso depois também.
        </p>

        <div className="flex flex-col gap-4">
          <ArtistFunctionsForm />
          <ArtistInstrumentsForm />
          <ArtistGenresForm />
        </div>

        <button
          type="button"
          onClick={() => router.replace(`/artistas/${slug}`)}
          className={`mt-6 ${primaryButtonClass}`}
        >
          Ir para meu perfil
        </button>
      </div>
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
