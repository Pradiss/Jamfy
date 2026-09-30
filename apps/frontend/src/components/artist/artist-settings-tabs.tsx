"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ArtistProfileForm,
  type ArtistProfileFormValues,
} from "@/components/artist/artist-profile-form";
import { ArtistFunctionsForm } from "@/components/artist/artist-functions-form";
import { ArtistInstrumentsForm } from "@/components/artist/artist-instruments-form";
import { ArtistGenresForm } from "@/components/artist/artist-genres-form";
import { SocialLinksForm } from "@/components/artist/social-links-form";
import { cardClass } from "@/lib/ui";

type ArtistProfileMe = {
  nomeArtistico: string;
  cidade: string;
  estado: string;
  biografia: string | null;
  cache: string | null;
  disponivel: boolean;
  aceitaViagem: boolean;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  tiktokUrl: string | null;
  siteUrl: string | null;
};

function toFormValues(profile: ArtistProfileMe): ArtistProfileFormValues {
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

const TABS = [
  { key: "perfil", label: "Perfil" },
  { key: "categorias", label: "Categorias" },
  { key: "social", label: "Redes sociais" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ArtistSettingsTabs() {
  const [profile, setProfile] = useState<ArtistProfileMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("perfil");

  useEffect(() => {
    apiFetch<ArtistProfileMe>("/api/artist-profile/me")
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdate(values: ArtistProfileFormValues) {
    await apiFetch("/api/artist-profile", {
      method: "PUT",
      body: toApiPayload(values),
    });
  }

  if (loading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Carregando perfil de artista...
      </p>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-full bg-black/5 p-1 dark:bg-white/10">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === item.key
                ? "bg-white shadow-sm dark:bg-zinc-900"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "perfil" ? (
        <div className={`p-5 ${cardClass}`}>
          <ArtistProfileForm
            initialValues={toFormValues(profile)}
            submitLabel="Salvar alterações"
            onSubmit={handleUpdate}
          />
        </div>
      ) : null}

      {tab === "categorias" ? (
        <div className="flex flex-col gap-4">
          <ArtistFunctionsForm />
          <ArtistInstrumentsForm />
          <ArtistGenresForm />
        </div>
      ) : null}

      {tab === "social" ? <SocialLinksForm artist={profile} /> : null}
    </div>
  );
}
