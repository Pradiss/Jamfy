"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  TIPO_EVENTO_LABELS,
  type PublicAgendaEntry,
  type TipoEvento,
} from "@/lib/types";
import { inputClass } from "@/components/ui/form-field";
import { EstadoCidadeFields } from "@/components/ui/estado-cidade-fields";
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
}: {
  artistId: string;
  artistUserId: string;
}) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [tipoEvento, setTipoEvento] = useState<TipoEvento | "">("");
  const [dataEvento, setDataEvento] = useState("");
  const [horaEvento, setHoraEvento] = useState("20:00");
  const [numeroSets, setNumeroSets] = useState(1);
  const [duracaoSetMinutos, setDuracaoSetMinutos] = useState(120);
  const [intervaloMinutos, setIntervaloMinutos] = useState(0);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [busyWindows, setBusyWindows] = useState<PublicAgendaEntry[]>([]);

  useEffect(() => {
    if (!dataEvento) {
      setBusyWindows([]);
      return;
    }

    let active = true;

    // Brazil is fixed at UTC-3 — shift the day's UTC-midnight boundaries by
    // +3h to get the real [Brazil midnight, Brazil midnight next day) window.
    const dayStartUtc = new Date(`${dataEvento}T00:00:00.000Z`);
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
  }, [artistId, dataEvento]);

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
      <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm shadow-sm dark:border-emerald-900 dark:bg-emerald-500/10">
        Solicitação enviada! Acompanhe o status em{" "}
        <Link href="/dashboard" className="font-medium underline">
          Minhas solicitações
        </Link>
        .
      </div>
    );
  }

  const totalMinutos =
    numeroSets * duracaoSetMinutos + (numeroSets - 1) * intervaloMinutos;

  let horarioFim: string | null = null;

  if (dataEvento && horaEvento) {
    const inicio = new Date(`${dataEvento}T${horaEvento}:00`);
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
          tipoEvento: tipoEvento || undefined,
          dataEvento: dataEvento
            ? `${dataEvento}T${horaEvento || "20:00"}:00`
            : undefined,
          numeroSets,
          duracaoSetMinutos,
          intervaloMinutos,
          cidade,
          estado: estado.toUpperCase(),
          orcamento: orcamento ? Number(orcamento) : undefined,
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-10 ${primaryButtonClass}`}
      >
        Solicitar contratação
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-10 flex flex-col gap-4 p-5 ${cardClass}`}
    >
      <h3 className="font-semibold tracking-tight">Solicitar contratação</h3>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
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
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Tipo de evento
        </span>
        <select
          value={tipoEvento}
          onChange={(event) =>
            setTipoEvento(event.target.value as TipoEvento | "")
          }
          className={inputClass}
        >
          <option value="">Selecione</option>
          {Object.entries(TIPO_EVENTO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Data do evento
          </span>
          <input
            type="date"
            value={dataEvento}
            onChange={(event) => setDataEvento(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Horário de início
          </span>
          <input
            type="time"
            value={horaEvento}
            onChange={(event) => setHoraEvento(event.target.value)}
            disabled={!dataEvento}
            className={`${inputClass} disabled:opacity-50`}
          />
        </label>
      </div>

      {busyWindows.length > 0 ? (
        <div className="-mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-400">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
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
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
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
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
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

      <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Duração total: {formatDuration(totalMinutos)}
        {horarioFim ? ` (termina por volta das ${horarioFim})` : ""}. O
        horário ajuda o artista a ver se tem outro compromisso só numa parte
        do dia, em vez de bloquear o dia inteiro.
      </p>

      <div>
        <p className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Cidade do evento
        </p>
        <EstadoCidadeFields
          state={estado}
          city={cidade}
          onStateChange={setEstado}
          onCityChange={setCidade}
        />
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Orçamento (R$, opcional)
        </span>
        <input
          type="number"
          min={0}
          value={orcamento}
          onChange={(event) => setOrcamento(event.target.value)}
          className={inputClass}
        />
      </label>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Enviando..." : "Enviar solicitação"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
