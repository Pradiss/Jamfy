"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { HiringRequest } from "@/lib/types";
import { HiringRequestCard } from "@/components/hiring/hiring-request-card";

export function ReceivedHiringRequests() {
  const [requests, setRequests] = useState<HiringRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ solicitacoes: HiringRequest[] }>(
        "/api/hiring-requests/received",
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

    apiFetch<{ solicitacoes: HiringRequest[] }>("/api/hiring-requests/received")
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

  async function respond(id: string, action: "accept" | "decline") {
    await apiFetch(`/api/hiring-requests/${id}/${action}`, {
      method: "PATCH",
    });
    await load();
  }

  return (
    <section>
      {error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : requests === null ? (
        <p className="text-zinc-500 dark:text-zinc-400">Carregando...</p>
      ) : requests.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          Nenhuma solicitação recebida ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((request) => (
            <HiringRequestCard
              key={request.id}
              request={request}
              perspective="artist"
              onAccept={(id) => respond(id, "accept")}
              onDecline={(id) => respond(id, "decline")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
