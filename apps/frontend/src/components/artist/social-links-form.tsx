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
  tiktokUrl: string | null;
};

type FieldKey = keyof SocialLinksData;

const FIELDS: {
  key: FieldKey;
  label: string;
  domain: string;
  prefix: string;
  placeholder: string;
  buildUrl: (handle: string) => string;
}[] = [
  {
    key: "instagramUrl",
    label: "Instagram",
    domain: "instagram.com",
    prefix: "instagram.com/",
    placeholder: "seuusuario",
    buildUrl: (handle) => `https://instagram.com/${handle}`,
  },
  {
    key: "facebookUrl",
    label: "Facebook",
    domain: "facebook.com",
    prefix: "facebook.com/",
    placeholder: "suapagina",
    buildUrl: (handle) => `https://facebook.com/${handle}`,
  },
  {
    key: "youtubeUrl",
    label: "YouTube",
    domain: "youtube.com",
    prefix: "youtube.com/@",
    placeholder: "seucanal",
    buildUrl: (handle) => `https://youtube.com/@${handle.replace(/^@/, "")}`,
  },
  {
    key: "tiktokUrl",
    label: "TikTok",
    domain: "tiktok.com",
    prefix: "tiktok.com/@",
    placeholder: "seuusuario",
    buildUrl: (handle) => `https://tiktok.com/@${handle.replace(/^@/, "")}`,
  },
];

// Links saved before were full URLs — show just the handle back in the
// input so editing feels the same as creating.
function extractHandle(url: string | null, domain: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(domain)) return url;
    return parsed.pathname.replace(/^\/+/, "").replace(/^@/, "").replace(/\/+$/, "");
  } catch {
    return url;
  }
}

export function SocialLinksForm({ artist }: { artist: SocialLinksData }) {
  const router = useRouter();
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      FIELDS.map((field) => [
        field.key,
        extractHandle(artist[field.key], field.domain),
      ]),
    ) as Record<FieldKey, string>,
  );
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
          FIELDS.map((field) => {
            const raw = values[field.key].trim();
            if (!raw) return [field.key, null];
            const url = raw.startsWith("http") ? raw : field.buildUrl(raw);
            return [field.key, url];
          }),
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
      <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Digite só o seu usuário em cada rede, sem precisar colar o link.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {field.label}
            </span>
            <div
              className={`flex items-center overflow-hidden p-0 ${inputClass}`}
            >
              <span className="shrink-0 border-r border-black/10 bg-surface px-3 py-2.5 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                {field.prefix}
              </span>
              <input
                value={values[field.key]}
                placeholder={field.placeholder}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
              />
            </div>
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
