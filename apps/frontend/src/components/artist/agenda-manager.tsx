"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import {
  MonthCalendar,
  WeekView,
  AgendaLegend,
  STATUS_LABELS,
  startOfMonth,
  addMonths,
  addWeeks,
  weekRangeLabel,
  getEntriesForDay,
  getBrazilToday,
  MONTH_FORMATTER,
} from "@/components/artist/month-calendar";
import type { AgendaEntry } from "@/lib/types";
import { inputClass } from "@/components/ui/form-field";
import { primaryButtonClass, secondaryButtonClass, cardClass } from "@/lib/ui";

function toUtcDayStart(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

const DURACAO_OPTIONS = [
  { value: 45, label: "45 min" },
  { value: 60, label: "1h" },
  { value: 75, label: "1h15" },
  { value: 90, label: "1h30" },
  { value: 105, label: "1h45" },
  { value: 120, label: "2h" },
  { value: 150, label: "2h30" },
  { value: 180, label: "3h" },
];

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

// Builds a "YYYY-MM-DDTHH:mm:00" string (no timezone suffix) from a nominal
// UTC-midnight day marker + a plain "HH:mm" time — pure calendar/clock math,
// no timezone conversion. The backend parses this as Brazil local time
// (pinned server-side), exactly like the hiring-request flow already does.
function combineDateAndTime(day: Date, time: string) {
  const year = day.getUTCFullYear();
  const month = String(day.getUTCMonth() + 1).padStart(2, "0");
  const date = String(day.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${date}T${time}:00`;
}

function addMinutesToDay(day: Date, totalMinutes: number) {
  const extraDays = Math.floor(totalMinutes / (24 * 60));
  const minutesOfDay = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(minutesOfDay / 60)).padStart(2, "0");
  const mm = String(minutesOfDay % 60).padStart(2, "0");
  const shiftedDay = new Date(day.getTime() + extraDays * 24 * 60 * 60 * 1000);
  return combineDateAndTime(shiftedDay, `${hh}:${mm}`);
}

export function AgendaManager() {
  const [view, setView] = useState<"week" | "month">("week");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  // Rolls a 7-day window starting on today, not the calendar week's Sunday
  // — showing past days of the current week by default was confusing, and
  // none of them can be clicked anyway (see isPastDay).
  const [weekStart, setWeekStart] = useState(() => getBrazilToday());
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
  const [pendingDay, setPendingDay] = useState<Date | null>(null);
  const [editingEntry, setEditingEntry] = useState<AgendaEntry | null>(null);
  const [reservaMode, setReservaMode] = useState(false);
  const [reservaHora, setReservaHora] = useState("20:00");
  const [reservaDuracao, setReservaDuracao] = useState(120);
  const [resolvingDay, setResolvingDay] = useState(false);

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

  function closeModal() {
    setPendingDay(null);
    setEditingEntry(null);
    setReservaMode(false);
  }

  function handleDayClick(day: Date) {
    setActionError(null);
    setPendingDay(day);
    setReservaMode(false);
    setEditingEntry(null);
  }

  function isPastDay(day: Date) {
    return day.getTime() < getBrazilToday().getTime();
  }

  // Takes the entry directly instead of reading `editingEntry` from state —
  // setEditingEntry(entry) followed by reading `editingEntry` in the same
  // handler would still see the stale value, since the update hasn't
  // applied yet.
  function openReservaForm(entry?: AgendaEntry) {
    const target = entry ?? null;

    if (target && !target.diaInteiro) {
      // Pre-fill from the entry's real start time and duration instead of
      // the defaults, so editing starts from what's already saved.
      const start = new Date(target.dataInicio);
      const end = new Date(target.dataFim);
      setReservaHora(TIME_FORMATTER.format(start));
      setReservaDuracao(
        Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000)),
      );
    } else {
      setReservaHora("20:00");
      setReservaDuracao(120);
    }

    setEditingEntry(target);
    setActionError(null);
    setReservaMode(true);
  }

  async function confirmReserva() {
    if (!pendingDay) return;

    setResolvingDay(true);
    setActionError(null);

    const dataInicio = combineDateAndTime(pendingDay, reservaHora);
    const [hh, mm] = reservaHora.split(":").map(Number);
    const dataFim = addMinutesToDay(
      pendingDay,
      hh * 60 + mm + reservaDuracao,
    );

    try {
      if (editingEntry) {
        await apiFetch(`/api/artist-profile/agenda/${editingEntry.id}`, {
          method: "PUT",
          body: {
            dataInicio,
            dataFim,
            diaInteiro: false,
            status: "RESERVADO",
          },
        });
      } else {
        await apiFetch("/api/artist-profile/agenda", {
          method: "POST",
          body: {
            dataInicio,
            dataFim,
            diaInteiro: false,
            status: "RESERVADO",
            titulo: "Show fechado fora do site",
          },
        });
      }

      // Return to the day's list instead of closing outright — lets the
      // artist keep adding more shows to the same day in one sitting.
      setEditingEntry(null);
      setReservaMode(false);
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar esse compromisso.",
      );
    } finally {
      setResolvingDay(false);
    }
  }

  async function blockPendingDay() {
    if (!pendingDay) return;

    setResolvingDay(true);
    setActionError(null);

    const dayEnd = new Date(pendingDay);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    try {
      await apiFetch("/api/artist-profile/agenda", {
        method: "POST",
        body: {
          dataInicio: pendingDay.toISOString(),
          dataFim: dayEnd.toISOString(),
          diaInteiro: true,
          status: "INDISPONIVEL",
        },
      });

      closeModal();
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível bloquear esse dia.",
      );
    } finally {
      setResolvingDay(false);
    }
  }

  async function removeEntry(entry: AgendaEntry) {
    setResolvingDay(true);

    try {
      await handleDelete(entry.id);
    } finally {
      setResolvingDay(false);
    }
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

  async function cancelSolicitacao(solicitacaoId: string) {
    if (
      !window.confirm(
        "Tem certeza que deseja cancelar essa contratação já confirmada? Isso não pode ser desfeito.",
      )
    ) {
      return;
    }

    setResolvingDay(true);

    try {
      await apiFetch(`/api/hiring-requests/${solicitacaoId}/cancel`, {
        method: "PATCH",
      });
      await load();
    } catch {
      setActionError("Não foi possível cancelar agora. Tente de novo.");
    } finally {
      setResolvingDay(false);
    }
  }

  const pendingDayEntries = pendingDay
    ? getEntriesForDay(pendingDay, entries ?? [])
    : [];
  const pendingDayHasFullBlock = pendingDayEntries.some(
    (entry) => entry.diaInteiro,
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
        {view === "week" ? (
          <div className="flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => setWeekStart((current) => addWeeks(current, -1))}
              aria-label="Semana anterior"
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/[.04] hover:text-zinc-950 "
            >
              ‹
            </button>
            <span className="min-w-[8rem] text-center">
              {weekRangeLabel(weekStart)}
            </span>
            <button
              type="button"
              onClick={() => setWeekStart((current) => addWeeks(current, 1))}
              aria-label="Próxima semana"
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/[.04] hover:text-zinc-950 "
            >
              ›
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => setMonth((current) => addMonths(current, -1))}
              aria-label="Mês anterior"
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/[.04] hover:text-zinc-950 "
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
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/[.04] hover:text-zinc-950 "
            >
              ›
            </button>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-red-600 ">{error}</p>
      ) : view === "week" ? (
        <WeekView
          weekStart={weekStart}
          entries={entries ?? []}
          onDayClick={handleDayClick}
          disabledDays={isPastDay}
        />
      ) : (
        <MonthCalendar
          month={month}
          entries={entries ?? []}
          onDayClick={handleDayClick}
          disabledDays={isPastDay}
        />
      )}

      {actionError ? (
        <p className="mt-2 text-sm text-red-600 ">
          {actionError}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-zinc-500 ">
        Clique num dia livre pra marcar um compromisso ou bloquear. Clique
        num dia já marcado pra editar ou remover.
      </p>

      {pendingDay ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl ">
            <h2 className="text-lg font-semibold tracking-tight capitalize">
              {pendingDay.toLocaleDateString("pt-BR", {
                timeZone: "UTC",
                day: "2-digit",
                month: "long",
              })}
            </h2>

            {reservaMode ? (
              <>
                <p className="mt-1 text-sm text-zinc-500 ">
                  Que horas é o show?
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-zinc-700 ">
                      Horário de início
                    </span>
                    <input
                      type="time"
                      value={reservaHora}
                      onChange={(event) => setReservaHora(event.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-zinc-700 ">
                      Duração
                    </span>
                    <select
                      value={reservaDuracao}
                      onChange={(event) =>
                        setReservaDuracao(Number(event.target.value))
                      }
                      className={inputClass}
                    >
                      {DURACAO_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={resolvingDay}
                    onClick={confirmReserva}
                    className={primaryButtonClass}
                  >
                    {resolvingDay ? "Salvando..." : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReservaMode(false)}
                    className="text-sm text-zinc-500 hover:underline "
                  >
                    Voltar
                  </button>
                </div>
              </>
            ) : pendingDayEntries.length > 0 ? (
              <>
                <p className="mt-1 text-sm text-zinc-500 ">
                  {pendingDayEntries.length === 1
                    ? "Esse dia já tem um compromisso."
                    : `Esse dia já tem ${pendingDayEntries.length} compromissos.`}
                </p>

                <div className="mt-5 flex flex-col gap-2">
                  {pendingDayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 ${cardClass} p-3.5`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {STATUS_LABELS[entry.status]}
                          {!entry.diaInteiro
                            ? ` • ${TIME_FORMATTER.format(new Date(entry.dataInicio))}–${TIME_FORMATTER.format(new Date(entry.dataFim))}`
                            : ""}
                        </p>
                        <p className="truncate text-sm text-zinc-500 ">
                          {entry.origem !== "ARTISTA"
                            ? "Contratação pelo site"
                            : (entry.titulo ?? "")}
                        </p>
                      </div>

                      {entry.origem === "ARTISTA" ? (
                        <div className="flex shrink-0 items-center gap-1">
                          {entry.status === "RESERVADO" ? (
                            <button
                              type="button"
                              disabled={resolvingDay}
                              onClick={() => openReservaForm(entry)}
                              aria-label="Editar horário"
                              title="Editar horário"
                              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 disabled:opacity-50 "
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={resolvingDay}
                            onClick={() => removeEntry(entry)}
                            aria-label="Remover"
                            title="Remover"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 "
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : entry.status === "RESERVADO" && entry.solicitacaoId ? (
                        <button
                          type="button"
                          disabled={resolvingDay}
                          onClick={() => cancelSolicitacao(entry.solicitacaoId!)}
                          className="shrink-0 rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Cancelar contratação
                        </button>
                      ) : null}
                    </div>
                  ))}

                  {!pendingDayHasFullBlock ? (
                    <button
                      type="button"
                      disabled={resolvingDay}
                      onClick={() => openReservaForm()}
                      className={`text-left ${cardClass} p-4 transition hover:bg-black/[.02] disabled:opacity-50 `}
                    >
                      <p className="font-medium">
                        + Marcar outro show nesse dia
                      </p>
                      <p className="text-sm text-zinc-500 ">
                        Fechou mais um horário no mesmo dia? Adiciona aqui.
                      </p>
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 w-full rounded-full border border-red-200 py-2.5 text-center text-sm font-medium text-red-600 transition hover:bg-red-50 "
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-zinc-500 ">
                  O que você quer fazer com esse dia?
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={resolvingDay}
                    onClick={() => openReservaForm()}
                    className={`text-left ${cardClass} p-4 transition hover:bg-black/[.02] disabled:opacity-50 `}
                  >
                    <p className="font-medium">Já fechei um show</p>
                    <p className="text-sm text-zinc-500 ">
                      Combinei fora do site — marcar o horário como
                      reservado.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={resolvingDay}
                    onClick={blockPendingDay}
                    className={`text-left ${cardClass} p-4 transition hover:bg-black/[.02] disabled:opacity-50 `}
                  >
                    <p className="font-medium">Bloquear esse dia</p>
                    <p className="text-sm text-zinc-500 ">
                      Não vou tocar nesse dia, fica indisponível.
                    </p>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 w-full rounded-full border border-red-200 py-2.5 text-center text-sm font-medium text-red-600 transition hover:bg-red-50 "
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        <AgendaLegend />
        <button
          type="button"
          onClick={() => setView(view === "week" ? "month" : "week")}
          className={`shrink-0 ${secondaryButtonClass} px-4 py-1.5 text-xs`}
        >
          {view === "week" ? "Ver mês inteiro" : "Ver semana"}
        </button>
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-zinc-700 ">
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
                <span className="font-medium text-zinc-700 ">
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
              <span className="font-medium text-zinc-700 ">
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
              <span className="font-medium text-zinc-700 ">
                Título (opcional)
              </span>
              <input
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                className={inputClass}
              />
            </label>

            {formError ? (
              <p className="text-sm text-red-600 ">
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
                className="text-sm text-zinc-500 hover:underline "
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
