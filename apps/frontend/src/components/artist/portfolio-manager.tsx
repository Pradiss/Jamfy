"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isOwner = user?.id === ownerUserId;
  // Destaque items go first — a stable sort keeps everything else in the
  // order the artist uploaded it.
  const sortedItems = [...items].sort(
    (a, b) => Number(b.destaque) - Number(a.destaque),
  );
  const viewableItems = sortedItems.filter(
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
    <section>
      {isOwner ? (
        <div className="mb-4 flex items-center justify-end gap-3">
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
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-sm font-medium transition hover:bg-black/[.03] disabled:opacity-50"
          >
            <PlusIcon />
            {uploading ? "Enviando..." : "Adicionar foto ou vídeo"}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-red-600 ">{error}</p>
      ) : null}

      {items.length === 0 ? (
        isOwner ? (
          <p className="text-sm text-zinc-500 ">
            Adicione fotos e vídeos para mostrar seu trabalho.
          </p>
        ) : null
      ) : (
        <div className="relative">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {sortedItems.map((item) => {
              const viewableIndex = viewableItems.findIndex(
                (viewable) => viewable.id === item.id,
              );

              return (
                <figure
                  key={item.id}
                  className={`group relative aspect-[4/5] w-56 shrink-0 snap-start overflow-hidden rounded-2xl border bg-white shadow-sm sm:w-72 ${
                    item.destaque
                      ? "border-accent/40 ring-2 ring-accent/30"
                      : "border-black/5 "
                  }`}
                >
                  {item.destaque ? (
                    <span className="absolute top-2 left-2 z-10 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                      Destaque
                    </span>
                  ) : null}

                  {item.tipo === "VIDEO" ? (
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(viewableIndex)}
                      className="relative block h-full w-full"
                    >
                      <video
                        src={item.arquivoUrl}
                        muted
                        playsInline
                        className="block h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white transition group-hover:bg-black/30">
                        <PlayIcon />
                      </span>
                    </button>
                  ) : item.tipo === "FOTO" ? (
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(viewableIndex)}
                      className="block h-full w-full"
                    >
                      {/* Not next/image: these tiles keep a uniform crop
                          via object-cover, but still don't have stored
                          width/height to size next/image from. Native
                          lazy loading still gets the main win below the
                          fold. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.arquivoUrl}
                        alt={item.titulo ?? ""}
                        loading="lazy"
                        className="block h-full w-full object-cover"
                      />
                    </button>
                  ) : (
                    <a
                      href={item.arquivoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full w-full items-center justify-center bg-surface text-sm text-accent underline"
                    >
                      Abrir {item.tipo.toLowerCase()}
                    </a>
                  )}

                  {item.titulo ? (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-sm font-medium text-white">
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

          {sortedItems.length > 1 ? (
            <div className="mt-2 hidden items-center justify-end gap-2 sm:flex">
              <button
                type="button"
                onClick={() =>
                  scrollerRef.current?.scrollBy({
                    left: -300,
                    behavior: "smooth",
                  })
                }
                aria-label="Ver anteriores"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-zinc-600 transition hover:bg-black/[.03] "
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  scrollerRef.current?.scrollBy({
                    left: 300,
                    behavior: "smooth",
                  })
                }
                aria-label="Ver próximos"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-zinc-600 transition hover:bg-black/[.03] "
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
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
