"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { primaryButtonClass, cardClass } from "@/lib/ui";

type CatalogItem = { id: string; nome: string; ativo: boolean };
type AssignedItem = { id: string; name: string; primary: boolean; active: boolean };

const MAX_FUNCTIONS = 10;

export function ArtistFunctionsForm() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<CatalogItem[]>("/api/functions"),
      apiFetch<{ funcoes: AssignedItem[] }>("/api/artist-profile/functions"),
    ])
      .then(([catalogData, assignedData]) => {
        setCatalog(catalogData.filter((item) => item.ativo));
        setSelectedIds(new Set(assignedData.funcoes.map((item) => item.id)));
      })
      .catch(() => {
        setError("Não foi possível carregar as funções artísticas.");
      })
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_FUNCTIONS) {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSave() {
    setError(null);
    setSuccess(false);

    if (selectedIds.size === 0) {
      setError("Selecione pelo menos uma função artística.");
      return;
    }

    setSaving(true);

    try {
      await apiFetch("/api/artist-profile/functions", {
        method: "POST",
        body: {
          functions: Array.from(selectedIds).map((functionId) => ({
            functionId,
            primary: false,
          })),
        },
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar agora.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`flex flex-col gap-4 p-5 ${cardClass}`}>
      <h3 className="font-semibold tracking-tight">Funções artísticas</h3>
      <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Escolha até {MAX_FUNCTIONS} funções (ex: vocalista, instrumentista).
      </p>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Carregando...
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {catalog.map((item) => {
            const checked = selectedIds.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                aria-pressed={checked}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  checked
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-black/10 hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
                }`}
              >
                {item.nome}
              </button>
            );
          })}
        </div>
      )}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {success ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Funções atualizadas.
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || loading}
        className={`self-start ${primaryButtonClass}`}
      >
        {saving ? "Salvando..." : "Salvar funções"}
      </button>
    </div>
  );
}
