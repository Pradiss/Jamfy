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

function entryTooltip(entry: SimpleAgendaEntry) {
  const label = STATUS_LABELS[entry.status];

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
}: {
  month: Date;
  entries: SimpleAgendaEntry[];
  onDayClick?: (day: Date) => void;
  disabledDays?: (day: Date) => boolean;
}) {
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
          const status = entry?.status ?? null;
          const clickable = Boolean(onDayClick) && !disabledDays?.(day);

          const className = `flex aspect-square items-center justify-center rounded-md text-xs transition ${
            status
              ? `${STATUS_COLORS[status]} text-white`
              : "bg-black/[.03] dark:bg-white/[.06]"
          } ${clickable ? "cursor-pointer hover:ring-2 hover:ring-accent" : ""}`;

          if (!clickable) {
            return (
              <div
                key={index}
                title={entry ? entryTooltip(entry) : undefined}
                className={className}
              >
                {day.getUTCDate()}
              </div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onDayClick?.(day)}
              title={entry ? entryTooltip(entry) : "Marcar disponibilidade"}
              className={className}
            >
              {day.getUTCDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AgendaLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
      {(Object.keys(STATUS_LABELS) as StatusAgenda[]).map((status) => (
        <span key={status} className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`}
          />
          {STATUS_LABELS[status]}
        </span>
      ))}
    </div>
  );
}
