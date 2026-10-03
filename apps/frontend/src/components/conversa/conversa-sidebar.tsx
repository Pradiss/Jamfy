"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { STATUS_CONVERSA_LABELS, type ConversaSummary } from "@/lib/types";

const POLL_INTERVAL_MS = 15_000;

const STATUS_BADGE_STYLES: Record<ConversaSummary["status"], string> = {
  PENDENTE:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
  ACEITA:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400",
  RECUSADA: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function ConversaSidebar({ activeId }: { activeId?: string }) {
  const [conversas, setConversas] = useState<ConversaSummary[] | null>(null);

  useEffect(() => {
    let active = true;

    function load() {
      apiFetch<{ conversas: ConversaSummary[] }>("/api/conversas")
        .then((data) => {
          if (active) setConversas(data.conversas);
        })
        .catch(() => {});
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-black/5 px-4 py-3.5 dark:border-white/10">
        <h1 className="text-lg font-semibold tracking-tight">Mensagens</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {conversas === null ? (
          <p className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
            Carregando...
          </p>
        ) : conversas.length === 0 ? (
          <p className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
            Você ainda não tem nenhuma conversa.
          </p>
        ) : (
          <ul className="flex flex-col">
            {conversas.map((conversa) => (
            <li key={conversa.id}>
              <Link
                href={`/conversas/${conversa.id}`}
                className={`flex items-center gap-3 border-l-2 px-4 py-3 transition ${
                  conversa.id === activeId
                    ? "border-accent bg-black/[.03] dark:bg-white/[.06]"
                    : "border-transparent hover:bg-black/[.02] dark:hover:bg-white/[.04]"
                }`}
              >
                {conversa.counterpart.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={conversa.counterpart.fotoUrl}
                    alt={conversa.counterpart.nome}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-zinc-500">
                    {conversa.counterpart.nome.charAt(0).toUpperCase()}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {conversa.counterpart.nome}
                    </p>
                    {conversa.naoLidas > 0 ? (
                      <span className="flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                        {conversa.naoLidas > 9 ? "9+" : conversa.naoLidas}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {conversa.anuncio.titulo}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE_STYLES[conversa.status]}`}
                    >
                      {STATUS_CONVERSA_LABELS[conversa.status]}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
