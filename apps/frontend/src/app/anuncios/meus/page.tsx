"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { AnuncioSummary } from "@/lib/types";
import { TIPO_ANUNCIO_LABELS } from "@/lib/types";
import { primaryButtonClass, cardClass, containerClass } from "@/lib/ui";

export default function MeusAnunciosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [anuncios, setAnuncios] = useState<AnuncioSummary[] | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    apiFetch<{ anuncios: AnuncioSummary[] }>("/api/anuncios/me")
      .then((data) => setAnuncios(data.anuncios))
      .catch(() => setAnuncios([]));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 dark:text-zinc-400">
        Carregando...
      </div>
    );
  }

  return (
    <div className={`${containerClass} flex-1 px-6 py-10`}>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Meus anúncios
        </h1>
        <Link href="/anuncios/novo" className={primaryButtonClass}>
          Anunciar
        </Link>
      </div>

      {anuncios === null ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Carregando...
        </p>
      ) : anuncios.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Você ainda não publicou nenhum anúncio.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {anuncios.map((anuncio) => (
            <Link
              key={anuncio.id}
              href={`/anuncios/${anuncio.id}`}
              className={`flex items-center gap-4 p-4 transition hover:bg-black/[.02] dark:hover:bg-white/[.04] ${cardClass}`}
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
                {anuncio.fotos[0] ? (
                  <Image
                    src={anuncio.fotos[0]}
                    alt={anuncio.titulo}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{anuncio.titulo}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {TIPO_ANUNCIO_LABELS[anuncio.tipo]} · {anuncio.cidade},{" "}
                  {anuncio.estado}
                </p>
              </div>

              <span className="shrink-0 text-sm font-semibold">
                {anuncio.preco
                  ? `R$ ${Number(anuncio.preco).toLocaleString("pt-BR")}`
                  : "A combinar"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
