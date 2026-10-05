import type { StatusAgenda } from "@/lib/types";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export const STATUS_COLORS: Record<StatusAgenda, string> = {
  DISPONIVEL: "bg-emerald-500",
  PENDENTE: "bg-amber-400",
  RESERVADO: "bg-red-500",
  INDISPONIVEL: "bg-zinc-400 dark:bg-zinc-600",
};

export const STATUS_LABELS: Record<StatusAgenda, string> = {
  DISPONIVEL: "Disponível",
  PENDENTE: "Pendente",
  RESERVADO: "Reservado",
  INDISPONIVEL: "Indisponível",
};

// For visitors deciding whether to hire — they just need "can I book this
// day or not", not the artist's internal pending-vs-confirmed distinction.
const SIMPLE_STATUS_COLORS: Record<StatusAgenda, string> = {
  DISPONIVEL: "bg-emerald-500",
  PENDENTE: "bg-red-500",
  RESERVADO: "bg-red-500",
  INDISPONIVEL: "bg-red-500",
};

const SIMPLE_STATUS_LABELS: Record<StatusAgenda, string> = {
  DISPONIVEL: "Livre",
  PENDENTE: "Ocupado",
  RESERVADO: "Ocupado",
  INDISPONIVEL: "Ocupado",
};

export function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addMonths(date: Date, amount: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1),
  );
}

export const MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export type SimpleAgendaEntry = {
  dataInicio: string;
  dataFim: string;
  status: StatusAgenda;
  diaInteiro?: boolean;
};

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

// Brazil is fixed at UTC-3 year-round (DST was abolished in 2019). Whole-day
// entries are stored as nominal UTC midnight-to-midnight (no real-world
// instant attached — the artist just clicked "day N"), so they line up with
// the UTC-midnight day cells as-is. Timed entries (from hiring requests) are
// real UTC instants, so we shift them back 3h to find which Brazil calendar
// day they actually fall on before checking overlap with the day cell.
const BRAZIL_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

export function getEntryForDay<T extends SimpleAgendaEntry>(
  day: Date,
  entries: T[],
): T | null {
  const dayStart = day.getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  for (const entry of entries) {
    const offset = entry.diaInteiro ? 0 : BRAZIL_UTC_OFFSET_MS;
    const start = new Date(entry.dataInicio).getTime() - offset;
    const end = new Date(entry.dataFim).getTime() - offset;

    if (start < dayEnd && end > dayStart) {
      return entry;
    }
  }

  return null;
}

function entryTooltip(entry: SimpleAgendaEntry, simplified?: boolean) {
  const label = simplified
    ? SIMPLE_STATUS_LABELS[entry.status]
    : STATUS_LABELS[entry.status];

  if (entry.diaInteiro) {
    return label;
  }

  const start = TIME_FORMATTER.format(new Date(entry.dataInicio));
  const end = TIME_FORMATTER.format(new Date(entry.dataFim));

  return `${label} • ${start}–${end}`;
}

export function MonthCalendar({
  month,
  entries,
  onDayClick,
  disabledDays,
  simplified,
}: {
  month: Date;
  entries: SimpleAgendaEntry[];
  onDayClick?: (day: Date) => void;
  disabledDays?: (day: Date) => boolean;
  // Collapses the 4 internal statuses down to just Livre/Ocupado — meant
  // for visitors deciding whether to hire, not the artist managing their
  // own agenda.
  simplified?: boolean;
}) {
  const colors = simplified ? SIMPLE_STATUS_COLORS : STATUS_COLORS;
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const totalDays = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const startWeekday = firstDay.getUTCDay();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: totalDays }, (_, index) =>
      new Date(Date.UTC(year, monthIndex, index + 1)),
    ),
  ];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
        {WEEKDAYS.map((day, index) => (
          <span key={index}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) {
            return <div key={index} />;
          }

          const entry = getEntryForDay(day, entries);
          // A timed entry only occupies part of the day — painting the
          // whole cell would read as "fully unavailable" even though the
          // rest of the day may still be free. Only whole-day entries get
          // the solid fill; timed ones just get a small status dot.
          const isFullDayBlock = Boolean(entry?.diaInteiro);
          const clickable = Boolean(onDayClick) && !disabledDays?.(day);

          const className = `relative flex aspect-square items-center justify-center rounded-md text-xs transition ${
            isFullDayBlock
              ? `${colors[entry!.status]} text-white`
              : "bg-black/[.03] text-zinc-700 dark:bg-white/[.06] dark:text-zinc-300"
          } ${clickable ? "cursor-pointer hover:ring-2 hover:ring-accent" : ""}`;

          const dot =
            entry && !isFullDayBlock ? (
              <span
                className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${colors[entry.status]}`}
              />
            ) : null;

          if (!clickable) {
            return (
              <div
                key={index}
                title={entry ? entryTooltip(entry, simplified) : undefined}
                className={className}
              >
                {day.getUTCDate()}
                {dot}
              </div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onDayClick?.(day)}
              title={
                entry
                  ? entryTooltip(entry, simplified)
                  : "Marcar disponibilidade"
              }
              className={className}
            >
              {day.getUTCDate()}
              {dot}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AgendaLegend({ simplified }: { simplified?: boolean } = {}) {
  const colors = simplified ? SIMPLE_STATUS_COLORS : STATUS_COLORS;
  const labels = simplified ? SIMPLE_STATUS_LABELS : STATUS_LABELS;
  const statuses = simplified
    ? (["DISPONIVEL", "RESERVADO"] as const)
    : (Object.keys(STATUS_LABELS) as StatusAgenda[]);

  return (
    <div className="flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      <div className="flex flex-wrap gap-4">
        {statuses.map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${colors[status]}`} />
            {labels[status]}
          </span>
        ))}
      </div>
      <p>
        Dia pintado inteiro = dia todo ocupado. Bolinha = só um horário
        específico, o resto do dia ainda pode estar livre.
      </p>
    </div>
  );
}
