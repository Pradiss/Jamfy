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
};

function getStatusForDay(
  day: Date,
  entries: SimpleAgendaEntry[],
): StatusAgenda | null {
  const time = day.getTime();

  for (const entry of entries) {
    const start = new Date(entry.dataInicio).getTime();
    const end = new Date(entry.dataFim).getTime();

    if (time >= start && time < end) {
      return entry.status;
    }
  }

  return null;
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

          const status = getStatusForDay(day, entries);
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
                title={status ? STATUS_LABELS[status] : undefined}
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
              title={status ? STATUS_LABELS[status] : "Marcar disponibilidade"}
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
