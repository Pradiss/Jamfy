"use client";

import { useState } from "react";
import {
  STATUS_SOLICITACAO_LABELS,
  TIPO_EVENTO_LABELS,
  type HiringRequest,
} from "@/lib/types";
import { primaryButtonClass, secondaryButtonClass, cardClass } from "@/lib/ui";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon, PhoneIcon } from "@/components/artist/social-icons";

const STATUS_STYLES: Record<HiringRequest["status"], string> = {
  PENDENTE:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
  ACEITA:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400",
  RECUSADA: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400",
  CANCELADA: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

type HiringRequestCardProps = {
  request: HiringRequest;
  perspective: "artist" | "contratante";
  onAccept?: (id: string) => Promise<void>;
  onDecline?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
};

export function HiringRequestCard({
  request,
  perspective,
  onAccept,
  onDecline,
  onCancel,
}: HiringRequestCardProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counterpart =
    perspective === "artist" ? request.contratante : request.artista;

  async function handleAction(action?: (id: string) => Promise<void>) {
    if (!action) return;
    setError(null);
    setPending(true);
    try {
      await action(request.id);
    } catch {
      setError("Não foi possível concluir a ação.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`flex flex-col gap-3 p-4 ${cardClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold tracking-tight">
            {perspective === "artist"
              ? (request.contratante?.nome ?? "Contratante")
              : (request.artista?.nomeArtistico ?? "Artista")}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {request.cidade}, {request.estado}
            {request.tipoEvento
              ? ` · ${TIPO_EVENTO_LABELS[request.tipoEvento]}`
              : ""}
            {request.dataEvento ? ` · ${formatDate(request.dataEvento)}` : ""}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
        >
          {STATUS_SOLICITACAO_LABELS[request.status]}
        </span>
      </div>

      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        {request.descricao}
      </p>

      {request.orcamento ? (
        <p className="text-sm font-medium">
          Orçamento: R$ {Number(request.orcamento).toLocaleString("pt-BR")}
        </p>
      ) : null}

      {request.status === "ACEITA" && counterpart ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-emerald-50 p-3 text-sm dark:bg-emerald-500/10">
          <span>
            Contato liberado:{" "}
            <span className="font-medium">
              {"nomeArtistico" in counterpart
                ? counterpart.nomeArtistico
                : counterpart.nome}
            </span>
          </span>

          {counterpart.whatsapp ? (
            <a
              href={whatsappLink(counterpart.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
            >
              <WhatsappIcon className="h-3.5 w-3.5" />
              Chamar no WhatsApp
            </a>
          ) : counterpart.telefone ? (
            <a
              href={`tel:${counterpart.telefone}`}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium transition hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
            >
              <PhoneIcon className="h-3.5 w-3.5" />
              Ligar
            </a>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {request.status === "PENDENTE" ? (
        <div className="flex gap-3">
          {perspective === "artist" ? (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleAction(onAccept)}
                className={primaryButtonClass}
              >
                Aceitar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleAction(onDecline)}
                className={secondaryButtonClass}
              >
                Recusar
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => handleAction(onCancel)}
              className={secondaryButtonClass}
            >
              Cancelar solicitação
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
