"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import { MessageComposer } from "@/components/conversa/message-composer";
import { ReportDialog } from "@/components/ui/report-dialog";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/ui";
import type { AnuncioDetail, ConversaSummary, TipoAnuncio } from "@/lib/types";

const QUICK_MESSAGES: Record<TipoAnuncio, string[]> = {
  VENDA: [
    "Ainda está disponível?",
    "Tenho interesse, qual o melhor preço?",
    "Aceita troca?",
  ],
  COMPRA: [
    "Eu tenho esse item, ainda procura?",
    "Posso te enviar fotos do meu?",
    "Qual o valor que você paga?",
  ],
  ALUGUEL: [
    "Ainda está disponível para alugar?",
    "Qual o valor da diária?",
    "Para qual período você precisa?",
  ],
};

export function AnuncioContactSection({ anuncioId }: { anuncioId: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [anuncio, setAnuncio] = useState<AnuncioDetail | null>(null);
  const [existingConversaId, setExistingConversaId] = useState<string | null>(
    null,
  );
  const [checkingConversa, setCheckingConversa] = useState(true);
  const [conteudo, setConteudo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<AnuncioDetail>(`/api/anuncios/${anuncioId}`)
      .then((data) => setAnuncio(data))
      .catch(() => setAnuncio(null));
  }, [anuncioId]);

  const isOwner = Boolean(user && anuncio && user.id === anuncio.usuarioId);

  useEffect(() => {
    if (!user || !anuncio || isOwner) {
      setCheckingConversa(false);
      return;
    }

    let active = true;

    apiFetch<{ conversas: ConversaSummary[] }>("/api/conversas")
      .then((data) => {
        const match = data.conversas.find(
          (item) => item.anuncio.id === anuncioId,
        );
        if (active) setExistingConversaId(match?.id ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCheckingConversa(false);
      });

    return () => {
      active = false;
    };
  }, [user, anuncio, isOwner, anuncioId]);

  if (authLoading || !anuncio || checkingConversa) {
    return null;
  }

  if (isOwner) {
    return (
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/anuncios/${anuncioId}/editar`}
          className={secondaryButtonClass}
        >
          Editar anúncio
        </Link>
        <Link href="/conversas" className={secondaryButtonClass}>
          Ver mensagens
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-black/5 bg-surface p-4 text-sm dark:border-white/10 dark:bg-white/[.03]">
        <Link href="/login" className="font-medium text-accent underline">
          Entre na sua conta
        </Link>{" "}
        para conversar com o anunciante.
      </div>
    );
  }

  if (existingConversaId) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push(`/conversas/${existingConversaId}`)}
          className={primaryButtonClass}
        >
          Ver conversa
        </button>
        <ReportDialog
          tipo="ANUNCIO"
          referenciaId={anuncioId}
          triggerLabel="Denunciar este anúncio"
        />
      </div>
    );
  }

  async function handleSend() {
    if (!conteudo.trim()) return;

    setError(null);
    setSubmitting(true);

    try {
      const result = await apiFetch<{ conversa: { id: string } }>(
        "/api/conversas",
        { method: "POST", body: { anuncioId, conteudo } },
      );

      router.push(`/conversas/${result.conversa.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar a mensagem.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_MESSAGES[anuncio.tipo].map((sugestao) => (
          <button
            key={sugestao}
            type="button"
            onClick={() => setConteudo(sugestao)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              conteudo === sugestao
                ? "border-accent bg-accent text-accent-foreground"
                : "border-black/10 text-zinc-600 hover:bg-black/[.03] dark:border-white/15 dark:text-zinc-400 dark:hover:bg-white/[.06]"
            }`}
          >
            {sugestao}
          </button>
        ))}
      </div>

      <MessageComposer
        value={conteudo}
        onChange={setConteudo}
        onSubmit={handleSend}
        submitting={submitting}
        placeholder="Tenho interesse nesse anúncio..."
      />

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <ReportDialog
        tipo="ANUNCIO"
        referenciaId={anuncioId}
        triggerLabel="Denunciar este anúncio"
      />
    </div>
  );
}
