"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import { MessageComposer } from "@/components/conversa/message-composer";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/ui";
import { STATUS_CONVERSA_LABELS, type ConversaDetail } from "@/lib/types";

const POLL_INTERVAL_MS = 10_000;

export default function ConversaDetailPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [conversa, setConversa] = useState<ConversaDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [conteudo, setConteudo] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    return apiFetch<ConversaDetail>(`/api/conversas/${params.id}`)
      .then((data) => setConversa(data))
      .catch(() => setNotFound(true));
  }, [params.id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [conversa?.mensagens.length]);

  if (!user || (!conversa && !notFound)) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-500 dark:text-zinc-400">
        Carregando...
      </div>
    );
  }

  if (notFound || !conversa) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-500 dark:text-zinc-400">
        Conversa não encontrada.
      </div>
    );
  }

  async function handleSend() {
    if (!conteudo.trim() || !conversa) return;

    setError(null);
    setSending(true);

    try {
      await apiFetch(`/api/conversas/${conversa.id}/mensagens`, {
        method: "POST",
        body: { conteudo },
      });
      setConteudo("");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar a mensagem.",
      );
    } finally {
      setSending(false);
    }
  }

  async function resolve(action: "accept" | "decline") {
    setError(null);
    setResolving(true);

    try {
      await apiFetch(`/api/conversas/${params.id}/${action}`, {
        method: "PATCH",
      });
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível concluir a ação.",
      );
    } finally {
      setResolving(false);
    }
  }

  const canRespond =
    conversa.papel === "vendedor" && conversa.status === "PENDENTE";
  const canSend = conversa.status !== "RECUSADA";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-3 border-b border-black/5 px-4 py-3 dark:border-white/10">
        <Link
          href="/conversas"
          className="text-zinc-500 hover:text-zinc-950 sm:hidden dark:text-zinc-400 dark:hover:text-zinc-50"
          aria-label="Voltar"
        >
          ←
        </Link>

        <div className="min-w-0">
          <Link
            href={`/anuncios/${conversa.anuncio.id}`}
            className="truncate text-sm font-semibold tracking-tight hover:underline"
          >
            {conversa.anuncio.titulo}
          </Link>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {conversa.counterpart.nome} · {STATUS_CONVERSA_LABELS[conversa.status]}
          </p>
        </div>
      </div>

      {canRespond ? (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-amber-50 px-4 py-3 dark:border-white/10 dark:bg-amber-500/10">
          <p className="text-sm">Aceitar esta mensagem para conversar livremente.</p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={resolving}
              onClick={() => resolve("accept")}
              className={primaryButtonClass}
            >
              Aceitar
            </button>
            <button
              type="button"
              disabled={resolving}
              onClick={() => resolve("decline")}
              className={secondaryButtonClass}
            >
              Recusar
            </button>
          </div>
        </div>
      ) : null}

      {conversa.status === "RECUSADA" ? (
        <p className="shrink-0 border-b border-black/5 px-4 py-3 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          {conversa.papel === "vendedor"
            ? "Você recusou esta conversa."
            : "O vendedor recusou esta conversa."}
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {conversa.mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm break-words sm:max-w-[75%] ${
              msg.autorId === user.id
                ? "self-end bg-accent text-accent-foreground"
                : "self-start bg-black/[.04] dark:bg-white/[.08]"
            }`}
          >
            {msg.conteudo}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {canSend ? (
        <div className="shrink-0 border-t border-black/5 p-3 dark:border-white/10">
          <MessageComposer
            value={conteudo}
            onChange={setConteudo}
            onSubmit={handleSend}
            submitting={sending}
            placeholder="Escreva uma mensagem..."
          />
        </div>
      ) : null}

      {error ? (
        <p className="shrink-0 px-4 pb-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
