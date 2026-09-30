"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { inputClass } from "@/components/ui/form-field";
import { primaryButtonClass, cardClass } from "@/lib/ui";

type SocialLinksData = {
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  spotifyUrl: string | null;
  tiktokUrl: string | null;
  siteUrl: string | null;
};

const FIELDS: {
  key: "instagramUrl" | "facebookUrl" | "youtubeUrl" | "spotifyUrl" | "tiktokUrl" | "websiteUrl";
  label: string;
  placeholder: string;
}[] = [
  { key: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/seu-perfil" },
  { key: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/sua-pagina" },
  { key: "youtubeUrl", label: "YouTube", placeholder: "https://youtube.com/@seu-canal" },
  { key: "spotifyUrl", label: "Spotify", placeholder: "https://open.spotify.com/artist/..." },
  { key: "tiktokUrl", label: "TikTok", placeholder: "https://tiktok.com/@seu-perfil" },
  { key: "websiteUrl", label: "Site", placeholder: "https://seusite.com" },
];

export function SocialLinksForm({ artist }: { artist: SocialLinksData }) {
  const router = useRouter();
  const [values, setValues] = useState({
    instagramUrl: artist.instagramUrl ?? "",
    facebookUrl: artist.facebookUrl ?? "",
    youtubeUrl: artist.youtubeUrl ?? "",
    spotifyUrl: artist.spotifyUrl ?? "",
    tiktokUrl: artist.tiktokUrl ?? "",
    websiteUrl: artist.siteUrl ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      await apiFetch("/api/artist-profile", {
        method: "PUT",
        body: Object.fromEntries(
          FIELDS.map(({ key }) => [key, values[key].trim() || null]),
        ),
      });

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar agora.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-5 ${cardClass}`}>
      <h3 className="font-semibold tracking-tight">Redes sociais</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {field.label}
            </span>
            <input
              type="url"
              placeholder={field.placeholder}
              value={values[field.key]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              className={inputClass}
            />
          </label>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {success ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Redes sociais atualizadas.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className={`self-start ${primaryButtonClass}`}
      >
        {submitting ? "Salvando..." : "Salvar redes sociais"}
      </button>
    </form>
  );
}
