"use client";

import { useState, type FormEvent } from "react";
import { Star } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { inputClass } from "@/components/ui/form-field";
import { primaryButtonClass } from "@/lib/ui";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <Star
      className={`h-8 w-8 ${filled ? "fill-amber-500 text-amber-500" : "fill-none text-zinc-300 dark:text-zinc-700"}`}
    />
  );
}

export function RatingDialog({
  solicitacaoId,
  artistName,
  onRated,
}: {
  solicitacaoId: string;
  artistName: string;
  onRated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (nota === 0) {
      setError("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch("/api/avaliacoes", {
        method: "POST",
        body: {
          solicitacaoId,
          nota,
          comentario: comentario.trim() || undefined,
        },
      });

      setOpen(false);
      onRated();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar a avaliação agora.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-xs font-medium transition hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
      >
        Avaliar artista
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <form
            onSubmit={handleSubmit}
            className="relative z-10 flex w-full max-w-sm flex-col gap-4 rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Avaliar {artistName}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                ✕
              </button>
            </div>

            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHoverNota(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setNota(value)}
                  onMouseEnter={() => setHoverNota(value)}
                  aria-label={`${value} estrelas`}
                >
                  <StarIcon filled={value <= (hoverNota || nota)} />
                </button>
              ))}
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Comentário (opcional)
              </span>
              <textarea
                rows={3}
                value={comentario}
                onChange={(event) => setComentario(event.target.value)}
                className={inputClass}
              />
            </label>

            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className={primaryButtonClass}
            >
              {submitting ? "Enviando..." : "Enviar avaliação"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
