"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PortfolioLightbox } from "@/components/artist/portfolio-lightbox";

type PortfolioItem = {
  id: string;
  titulo: string | null;
  descricao: string | null;
  arquivoUrl: string;
  miniaturaUrl: string | null;
  tipo: "FOTO" | "VIDEO" | "AUDIO" | "YOUTUBE" | "OUTRO";
  destaque: boolean;
};

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7" />
    </svg>
  );
}

export function PortfolioManager({
  items,
  ownerUserId,
}: {
  items: PortfolioItem[];
  ownerUserId: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isOwner = user?.id === ownerUserId;
  const viewableItems = items.filter(
    (item) => item.tipo === "FOTO" || item.tipo === "VIDEO",
  );

  if (!isOwner && items.length === 0) {
    return null;
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await apiFetch("/api/artist-profile/portfolio/upload", {
        method: "POST",
        body: formData,
      });

      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar o arquivo agora.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);

    try {
      await apiFetch(`/api/artist-profile/portfolio/${id}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível remover o item agora.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Portfólio</h2>

        {isOwner ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-sm font-medium transition hover:bg-black/[.03] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[.06]"
            >
              <PlusIcon />
              {uploading ? "Enviando..." : "Adicionar foto ou vídeo"}
            </button>
          </>
        ) : null}
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {items.length === 0 ? (
        isOwner ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Adicione fotos e vídeos para mostrar seu trabalho.
          </p>
        ) : null
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4">
          {items.map((item) => {
            const viewableIndex = viewableItems.findIndex(
              (viewable) => viewable.id === item.id,
            );

            return (
              <figure
                key={item.id}
                className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm sm:mb-4 dark:border-white/10 dark:bg-white/[.03]"
              >
                {item.tipo === "VIDEO" ? (
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(viewableIndex)}
                    className="relative block w-full"
                  >
                    <video
                      src={item.arquivoUrl}
                      muted
                      playsInline
                      className="block w-full"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white transition group-hover:bg-black/30">
                      <PlayIcon />
                    </span>
                  </button>
                ) : item.tipo === "FOTO" ? (
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(viewableIndex)}
                    className="block w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.arquivoUrl}
                      alt={item.titulo ?? ""}
                      className="block w-full"
                    />
                  </button>
                ) : (
                  <a
                    href={item.arquivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-video w-full items-center justify-center bg-surface text-sm text-accent underline"
                  >
                    Abrir {item.tipo.toLowerCase()}
                  </a>
                )}

                {item.titulo ? (
                  <figcaption className="p-3 text-sm font-medium">
                    {item.titulo}
                  </figcaption>
                ) : null}

                {isOwner ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(item.id);
                    }}
                    disabled={deletingId === item.id}
                    aria-label="Remover item"
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80 disabled:opacity-50"
                  >
                    <TrashIcon />
                  </button>
                ) : null}
              </figure>
            );
          })}
        </div>
      )}

      {lightboxIndex !== null ? (
        <PortfolioLightbox
          items={viewableItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </section>
  );
}
