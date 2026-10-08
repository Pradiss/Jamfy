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

const STATUS_TEXT_COLORS: Record<StatusAgenda, string> = {
  DISPONIVEL: "text-emerald-600 dark:text-emerald-400",
  PENDENTE: "text-amber-600 dark:text-amber-400",
  RESERVADO: "text-red-600 dark:text-red-400",
  INDISPONIVEL: "text-zinc-500 dark:text-zinc-400",
};

// A day with just a specific-time booking shouldn't look as "fully blocked"
// as a whole-day one (that's what the solid STATUS_COLORS fill is for) —
// but a plain neutral cell made that reservation too easy to miss. A light
// tint in the status color flags it clearly without claiming the whole day.
const STATUS_TINTS: Record<StatusAgenda, string> = {
  DISPONIVEL: "bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100",
  PENDENTE: "bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100",
  RESERVADO: "bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-100",
  INDISPONIVEL: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const SIMPLE_STATUS_TINTS: Record<StatusAgenda, string> = {
  DISPONIVEL: "bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100",
  PENDENTE: "bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-100",
  RESERVADO: "bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-100",
  INDISPONIVEL: "bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-100",
};

export function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addMonths(date: Date, amount: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1),
  );
}

export function startOfWeek(date: Date) {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return start;
}

export function addWeeks(date: Date, amount: number) {
  return new Date(date.getTime() + amount * 7 * 24 * 60 * 60 * 1000);
}

export const MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const WEEK_DAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  timeZone: "UTC",
});

const WEEK_RANGE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
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

// Unlike getEntryForDay (used by the month grid, where one color per cell is
// enough), the week view needs every booking that day — an artist can have
// more than one show in the same day at different times.
export function getEntriesForDay<T extends SimpleAgendaEntry>(
  day: Date,
  entries: T[],
): T[] {
  const dayStart = day.getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  return entries
    .filter((entry) => {
      const offset = entry.diaInteiro ? 0 : BRAZIL_UTC_OFFSET_MS;
      const start = new Date(entry.dataInicio).getTime() - offset;
      const end = new Date(entry.dataFim).getTime() - offset;
      return start < dayEnd && end > dayStart;
    })
    .sort(
      (a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime(),
    );
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
  const tints = simplified ? SIMPLE_STATUS_TINTS : STATUS_TINTS;
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
              : entry
                ? tints[entry.status]
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

export function weekRangeLabel(weekStart: Date) {
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  return `${WEEK_RANGE_FORMATTER.format(weekStart)} – ${WEEK_RANGE_FORMATTER.format(weekEnd)}`;
}

export function WeekView({
  weekStart,
  entries,
  onDayClick,
  disabledDays,
  simplified,
}: {
  weekStart: Date;
  entries: SimpleAgendaEntry[];
  onDayClick?: (day: Date) => void;
  disabledDays?: (day: Date) => boolean;
  simplified?: boolean;
}) {
  const colors = simplified ? SIMPLE_STATUS_COLORS : STATUS_COLORS;
  const labels = simplified ? SIMPLE_STATUS_LABELS : STATUS_LABELS;

  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  const days = Array.from(
    { length: 7 },
    (_, index) => new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000),
  );

  return (
    <div className="flex flex-col divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 dark:divide-white/10 dark:border-white/10">
      {days.map((day) => {
        const dayEntries = getEntriesForDay(day, entries);
        const wholeDay = dayEntries.find((entry) => entry.diaInteiro);
        const isToday = day.getTime() === todayUtc;
        const clickable = Boolean(onDayClick) && !disabledDays?.(day);

        return (
          <div
            key={day.getTime()}
            onClick={clickable ? () => onDayClick?.(day) : undefined}
            className={`flex items-start gap-3 p-3 transition ${
              clickable ? "cursor-pointer hover:bg-black/[.02] dark:hover:bg-white/[.04]" : ""
            } ${isToday ? "bg-accent/5" : ""}`}
          >
            <div className="flex w-12 shrink-0 flex-col items-center">
              <span className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
                {WEEK_DAY_FORMATTER.format(day).replace(".", "")}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                {day.getUTCDate()}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1.5 text-sm">
              {wholeDay ? (
                <span
                  className={`break-words font-medium ${STATUS_TEXT_COLORS[wholeDay.status]}`}
                >
                  Dia todo: {labels[wholeDay.status]}
                </span>
              ) : dayEntries.length === 0 ? (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Livre o dia todo
                </span>
              ) : (
                dayEntries.map((entry, index) => (
                  <span key={index} className="flex min-w-0 items-start gap-1.5">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colors[entry.status]}`}
                    />
                    <span className="min-w-0 break-words">
                      {labels[entry.status]} •{" "}
                      {TIME_FORMATTER.format(new Date(entry.dataInicio))}–
                      {TIME_FORMATTER.format(new Date(entry.dataFim))}
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
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
