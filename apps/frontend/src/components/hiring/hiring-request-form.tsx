"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { PublicAgendaEntry } from "@/lib/types";
import { inputClass } from "@/components/ui/form-field";
import { primaryButtonClass, cardClass } from "@/lib/ui";

const DURACAO_SET_OPTIONS = [
  { value: 45, label: "45 min" },
  { value: 60, label: "1h" },
  { value: 75, label: "1h15" },
  { value: 90, label: "1h30" },
  { value: 105, label: "1h45" },
  { value: 120, label: "2h" },
  { value: 150, label: "2h30" },
  { value: 180, label: "3h" },
];

const NUMERO_SETS_OPTIONS = [1, 2, 3, 4];

const INTERVALO_OPTIONS = [
  { value: 0, label: "Sem intervalo" },
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1h" },
];

const BUSY_STATUSES = new Set(["RESERVADO", "PENDENTE", "INDISPONIVEL"]);
const BRAZIL_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

const HOUR_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  timeZone: "UTC",
});

function formatDuration(minutos: number) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto}min`;
  if (resto === 0) return `${horas}h`;
  return `${horas}h${resto}`;
}

export function HiringRequestForm({
  artistId,
  artistUserId,
  initialDate,
  cidade,
  estado,
}: {
  artistId: string;
  artistUserId: string;
  // The day is always chosen by clicking it on the artist's agenda — this
  // form no longer has its own date picker. Cidade/estado ride along
  // silently (the artist's own city), since the backend still requires a
  // location but asking for it again here would just repeat what picking
  // this artist already implied.
  initialDate?: string;
  cidade: string;
  estado: string;
}) {
  const { user, loading } = useAuth();
  const [descricao, setDescricao] = useState("");
  const [horaEvento, setHoraEvento] = useState("20:00");
  const [numeroSets, setNumeroSets] = useState(1);
  const [duracaoSetMinutos, setDuracaoSetMinutos] = useState(120);
  const [intervaloMinutos, setIntervaloMinutos] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [busyWindows, setBusyWindows] = useState<PublicAgendaEntry[]>([]);

  useEffect(() => {
    if (!initialDate) {
      return;
    }

    let active = true;

    // Brazil is fixed at UTC-3 — shift the day's UTC-midnight boundaries by
    // +3h to get the real [Brazil midnight, Brazil midnight next day) window.
    const dayStartUtc = new Date(`${initialDate}T00:00:00.000Z`);
    const de = new Date(dayStartUtc.getTime() + BRAZIL_UTC_OFFSET_MS);
    const ate = new Date(de.getTime() + 24 * 60 * 60 * 1000);

    apiFetch<{ agenda: PublicAgendaEntry[] }>(
      `/api/artist-profile/agenda/artist/${artistId}?de=${encodeURIComponent(de.toISOString())}&ate=${encodeURIComponent(ate.toISOString())}`,
    )
      .then((data) => {
        if (active) {
          setBusyWindows(
            data.agenda.filter((entry) => BUSY_STATUSES.has(entry.status)),
          );
        }
      })
      .catch(() => {
        if (active) setBusyWindows([]);
      });

    return () => {
      active = false;
    };
  }, [artistId, initialDate]);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className={`mt-10 p-4 text-sm ${cardClass}`}>
        <Link href="/login" className="font-medium text-accent underline">
          Entre na sua conta
        </Link>{" "}
        para solicitar a contratação deste artista.
      </div>
    );
  }

  if (user.id === artistUserId) {
    return null;
  }

  if (sent) {
    return (
      <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm shadow-sm ">
        Solicitação enviada! Acompanhe o status em{" "}
        <Link href="/dashboard" className="font-medium underline">
          Minhas solicitações
        </Link>
        .
      </div>
    );
  }

  if (!initialDate) {
    return null;
  }

  const totalMinutos =
    numeroSets * duracaoSetMinutos + (numeroSets - 1) * intervaloMinutos;

  let horarioFim: string | null = null;

  if (horaEvento) {
    const inicio = new Date(`${initialDate}T${horaEvento}:00`);
    horarioFim = HOUR_FORMATTER.format(
      new Date(inicio.getTime() + totalMinutos * 60 * 1000),
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch("/api/hiring-requests", {
        method: "POST",
        body: {
          artistaId: artistId,
          descricao,
          dataEvento: `${initialDate}T${horaEvento || "20:00"}:00`,
          numeroSets,
          duracaoSetMinutos,
          intervaloMinutos,
          cidade,
          estado: estado.toUpperCase(),
        },
      });

      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar a solicitação.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const dataLabel = DATE_FORMATTER.format(new Date(`${initialDate}T12:00:00Z`));

  return (
    <form
      onSubmit={handleSubmit}
      className={` flex flex-col gap-4  `}
    >
      <div>
        <h3 className="font-semibold tracking-tight">Solicitar contratação</h3>
        <p className="mt-0.5 text-sm text-zinc-500 capitalize ">
          {dataLabel}
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 ">
          Descreva o evento
        </span>
        <textarea
          required
          minLength={10}
          rows={3}
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 ">
          Horário de início
        </span>
        <input
          type="time"
          value={horaEvento}
          onChange={(event) => setHoraEvento(event.target.value)}
          className={inputClass}
        />
      </label>

      {busyWindows.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 ">
          Já ocupado nesse dia:{" "}
          {busyWindows
            .map((entry) =>
              entry.diaInteiro
                ? "dia inteiro"
                : `${HOUR_FORMATTER.format(new Date(entry.dataInicio))}–${HOUR_FORMATTER.format(new Date(entry.dataFim))}`,
            )
            .join(", ")}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 ">
            Duração de cada set
          </span>
          <select
            value={duracaoSetMinutos}
            onChange={(event) =>
              setDuracaoSetMinutos(Number(event.target.value))
            }
            className={inputClass}
          >
            {DURACAO_SET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 ">
            Quantos sets
          </span>
          <select
            value={numeroSets}
            onChange={(event) => setNumeroSets(Number(event.target.value))}
            className={inputClass}
          >
            {NUMERO_SETS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 ">
            Intervalo entre sets
          </span>
          <select
            value={intervaloMinutos}
            onChange={(event) =>
              setIntervaloMinutos(Number(event.target.value))
            }
            disabled={numeroSets < 2}
            className={`${inputClass} disabled:opacity-50`}
          >
            {INTERVALO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-xs text-zinc-500 ">
        Duração total: {formatDuration(totalMinutos)}
        {horarioFim ? ` (termina por volta das ${horarioFim})` : ""}. O
        horário ajuda o artista a ver se tem outro compromisso só numa parte
        do dia, em vez de bloquear o dia inteiro.
      </p>

      {error ? (
        <p className="text-sm text-red-600 ">{error}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-black/5 pt-5 pb-1 ">
        <button
          type="submit"
          disabled={submitting}
          className={primaryButtonClass}
        >
          {submitting ? "Enviando..." : "Enviar solicitação"}
        </button>
      </div>
    </form>
  );
}
