"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { apiFetch } from "@/lib/api";

function StarIcon() {
  return <Star className="h-4 w-4 fill-amber-500 text-amber-500" />;
}

type Avaliacao = {
  id: string;
  nota: number;
  comentario: string | null;
  criadoEm: string;
  contratante: { nome: string; fotoUrl: string | null };
};

export function ArtistReviewsSection({
  artistId,
  avaliacao,
  quantidadeAvaliacoes,
}: {
  artistId: string;
  avaliacao: string | null;
  quantidadeAvaliacoes: number;
}) {
  const [reviews, setReviews] = useState<Avaliacao[]>([]);

  useEffect(() => {
    if (quantidadeAvaliacoes === 0) return;

    apiFetch<{ avaliacoes: Avaliacao[] }>(
      `/api/avaliacoes?artistaId=${artistId}`,
    )
      .then((data) => setReviews(data.avaliacoes))
      .catch(() => setReviews([]));
  }, [artistId, quantidadeAvaliacoes]);

  if (quantidadeAvaliacoes === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight">
        <StarIcon />
        {Number(avaliacao).toFixed(1)}{" "}
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
          ({quantidadeAvaliacoes}{" "}
          {quantidadeAvaliacoes === 1 ? "avaliação" : "avaliações"})
        </span>
      </h2>

      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-black/5 p-4 dark:border-white/10"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{review.contratante.nome}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: review.nota }).map((_, index) => (
                  <StarIcon key={index} />
                ))}
              </div>
            </div>
            {review.comentario ? (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {review.comentario}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
