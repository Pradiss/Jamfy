"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { apiFetch, ApiError } from "@/lib/api";
import type { HiringRequest } from "@/lib/types";
import { HiringRequestCard } from "@/components/hiring/hiring-request-card";
import { primaryButtonClass } from "@/lib/ui";

export function ContratanteDashboard() {
  const [requests, setRequests] = useState<HiringRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ solicitacoes: HiringRequest[] }>(
        "/api/hiring-requests/sent",
      );
      setRequests(data.solicitacoes);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar as solicitações.",
      );
    }
  }, []);

  useEffect(() => {
    let active = true;

    apiFetch<{ solicitacoes: HiringRequest[] }>("/api/hiring-requests/sent")
      .then((data) => {
        if (active) setRequests(data.solicitacoes);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar as solicitações.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function cancel(id: string) {
    await apiFetch(`/api/hiring-requests/${id}/cancel`, { method: "PATCH" });
    await load();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          Minhas solicitações
        </h1>
        <Link href="/artistas" className={primaryButtonClass}>
          Buscar artistas
        </Link>
      </div>

      {error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : requests === null ? (
        <p className="text-zinc-500 dark:text-zinc-400">Carregando...</p>
      ) : requests.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          Você ainda não enviou nenhuma solicitação.{" "}
          <Link href="/artistas" className="text-accent underline">
            Buscar artistas
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <HiringRequestCard
              key={request.id}
              request={request}
              perspective="contratante"
              onCancel={cancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
