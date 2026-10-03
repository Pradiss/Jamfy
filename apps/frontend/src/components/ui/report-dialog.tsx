"use client";

import { useState, type FormEvent } from "react";
import { Flag } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { inputClass } from "@/components/ui/form-field";
import { primaryButtonClass } from "@/lib/ui";

type TipoDenuncia = "SOLICITACAO" | "ANUNCIO" | "USUARIO";

const MOTIVO_OPTIONS: { value: string; label: string }[] = [
  { value: "GOLPE", label: "Golpe ou fraude" },
  { value: "CONTEUDO_INAPROPRIADO", label: "Conteúdo inapropriado" },
  { value: "SPAM", label: "Spam" },
  { value: "INFORMACAO_FALSA", label: "Informação falsa" },
  { value: "OUTRO", label: "Outro motivo" },
];

export function ReportDialog({
  tipo,
  referenciaId,
  triggerLabel = "Denunciar",
}: {
  tipo: TipoDenuncia;
  referenciaId: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("GOLPE");
  const [descricao, setDescricao] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch("/api/denuncias", {
        method: "POST",
        body: {
          tipo,
          motivo,
          referenciaId,
          descricao: descricao.trim() || undefined,
        },
      });

      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar a denúncia agora.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setSent(false);
    setDescricao("");
    setMotivo("GOLPE");
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/15 dark:text-zinc-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
      >
        <Flag className="h-3.5 w-3.5" />
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleClose}
          />

          <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl dark:bg-zinc-900">
            {sent ? (
              <>
                <h2 className="text-lg font-semibold tracking-tight">
                  Denúncia enviada
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Obrigado por avisar. Nossa equipe vai analisar o quanto
                  antes.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`mt-5 ${primaryButtonClass}`}
                >
                  Fechar
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold tracking-tight">
                    Denunciar
                  </h2>
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Fechar"
                    className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
                  >
                    ✕
                  </button>
                </div>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Motivo
                  </span>
                  <select
                    value={motivo}
                    onChange={(event) => setMotivo(event.target.value)}
                    className={inputClass}
                  >
                    {MOTIVO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Detalhes (opcional)
                  </span>
                  <textarea
                    rows={3}
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
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
                  {submitting ? "Enviando..." : "Enviar denúncia"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
