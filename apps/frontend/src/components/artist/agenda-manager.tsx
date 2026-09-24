"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import {
  MonthCalendar,
  AgendaLegend,
  startOfMonth,
  addMonths,
  MONTH_FORMATTER,
} from "@/components/artist/month-calendar";
import type { AgendaEntry } from "@/lib/types";
import { inputClass } from "@/components/ui/form-field";
import { primaryButtonClass, secondaryButtonClass, cardClass } from "@/lib/ui";

function toUtcDayStart(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function findEntryForDay(day: Date, entries: AgendaEntry[]): AgendaEntry | null {
  const time = day.getTime();

  for (const entry of entries) {
    const start = new Date(entry.dataInicio).getTime();
    const end = new Date(entry.dataFim).getTime();

    if (time >= start && time < end) {
      return entry;
    }
  }

  return null;
}

function formatRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setUTCDate(endDate.getUTCDate() - 1);

  const fmt = (date: Date) =>
    date.toLocaleDateString("pt-BR", { timeZone: "UTC" });

  return startDate.getTime() === endDate.getTime()
    ? fmt(startDate)
    : `${fmt(startDate)} – ${fmt(endDate)}`;
}

export function AgendaManager() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [entries, setEntries] = useState<AgendaEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [status, setStatus] = useState<"DISPONIVEL" | "INDISPONIVEL">(
    "INDISPONIVEL",
  );
  const [titulo, setTitulo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ agenda: AgendaEntry[] }>(
        "/api/artist-profile/agenda/me",
      );
      setEntries(data.agenda);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar a agenda.",
      );
    }
  }, []);

  useEffect(() => {
    let active = true;

    apiFetch<{ agenda: AgendaEntry[] }>("/api/artist-profile/agenda/me")
      .then((data) => {
        if (active) setEntries(data.agenda);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar a agenda.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const start = toUtcDayStart(dataInicio);
      const end = toUtcDayStart(dataFim || dataInicio);
      end.setUTCDate(end.getUTCDate() + 1);

      await apiFetch("/api/artist-profile/agenda", {
        method: "POST",
        body: {
          dataInicio: start.toISOString(),
          dataFim: end.toISOString(),
          diaInteiro: true,
          status,
          titulo: titulo || undefined,
        },
      });

      setShowForm(false);
      setDataInicio("");
      setDataFim("");
      setTitulo("");
      await load();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Não foi possível salvar.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDayClick(day: Date) {
    const existing = findEntryForDay(day, entries ?? []);
    setActionError(null);

    const dayEnd = new Date(day);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    try {
      if (!existing) {
        await apiFetch("/api/artist-profile/agenda", {
          method: "POST",
          body: {
            dataInicio: day.toISOString(),
            dataFim: dayEnd.toISOString(),
            diaInteiro: true,
            status: "DISPONIVEL",
          },
        });
      } else if (existing.status === "DISPONIVEL") {
        await apiFetch(`/api/artist-profile/agenda/${existing.id}`, {
          method: "PUT",
          body: { status: "INDISPONIVEL" },
        });
      } else {
        await apiFetch(`/api/artist-profile/agenda/${existing.id}`, {
          method: "DELETE",
        });
      }

      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível atualizar esse dia.",
      );
    }
  }

  function isDayLocked(day: Date) {
    const existing = findEntryForDay(day, entries ?? []);
    return Boolean(existing && existing.origem !== "ARTISTA");
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/artist-profile/agenda/${id}`, {
        method: "DELETE",
      });
      await load();
    } catch {
      // The list stays as-is; the user can just try again.
    }
  }

  const manualEntries = (entries ?? []).filter(
    (entry) => entry.origem === "ARTISTA",
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Agenda</h2>
        <div className="flex items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => setMonth((current) => addMonths(current, -1))}
            aria-label="Mês anterior"
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/[.04] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[.08] dark:hover:text-zinc-50"
          >
            ‹
          </button>
          <span className="min-w-[9rem] text-center capitalize">
            {MONTH_FORMATTER.format(month)}
          </span>
          <button
            type="button"
            onClick={() => setMonth((current) => addMonths(current, 1))}
            aria-label="Próximo mês"
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/[.04] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[.08] dark:hover:text-zinc-50"
          >
            ›
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <MonthCalendar
          month={month}
          entries={entries ?? []}
          onDayClick={handleDayClick}
          disabledDays={isDayLocked}
        />
      )}

      {actionError ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {actionError}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        Clique em um dia para marcar como disponível ou indisponível.
      </p>

      <div className="mt-3">
        <AgendaLegend />
      </div>

      <div className="mt-6">
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={secondaryButtonClass}
          >
            Bloquear período
          </button>
        ) : (
          <form
            onSubmit={handleCreate}
            className={`flex flex-col gap-3 p-4 ${cardClass}`}
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  De
                </span>
                <input
                  type="date"
                  required
                  value={dataInicio}
                  onChange={(event) => setDataInicio(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Até (opcional, mesmo dia se vazio)
                </span>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(event) => setDataFim(event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Status
              </span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "DISPONIVEL" | "INDISPONIVEL")
                }
                className={inputClass}
              >
                <option value="INDISPONIVEL">Indisponível</option>
                <option value="DISPONIVEL">Disponível</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Título (opcional)
              </span>
              <input
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                className={inputClass}
              />
            </label>

            {formError ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {formError}
              </p>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className={primaryButtonClass}
              >
                {submitting ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {manualEntries.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-2">
          {manualEntries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-3.5 py-2.5 text-sm shadow-sm dark:border-white/10 dark:bg-white/[.03]"
            >
              <span>
                {formatRange(entry.dataInicio, entry.dataFim)} ·{" "}
                {entry.status === "DISPONIVEL" ? "Disponível" : "Indisponível"}
                {entry.titulo ? ` · ${entry.titulo}` : ""}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(entry.id)}
                className="text-zinc-500 hover:text-red-600 dark:text-zinc-400"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
