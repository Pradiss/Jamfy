"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  MonthCalendar,
  WeekView,
  AgendaLegend,
  startOfMonth,
  addMonths,
  startOfWeek,
  addWeeks,
  weekRangeLabel,
  MONTH_FORMATTER,
  type SimpleAgendaEntry,
} from "@/components/artist/month-calendar";
import { secondaryButtonClass } from "@/lib/ui";

export function ArtistAvailability({ artistId }: { artistId: string }) {
  const [view, setView] = useState<"week" | "month">("week");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [entries, setEntries] = useState<SimpleAgendaEntry[]>([]);

  useEffect(() => {
    let active = true;

    const rangeStart = view === "week" ? weekStart : month;
    const rangeEnd =
      view === "week" ? addWeeks(weekStart, 1) : addMonths(month, 1);

    const de = encodeURIComponent(rangeStart.toISOString());
    const ate = encodeURIComponent(rangeEnd.toISOString());

    apiFetch<{ agenda: SimpleAgendaEntry[] }>(
      `/api/artist-profile/agenda/artist/${artistId}?de=${de}&ate=${ate}`,
    )
      .then((data) => {
        if (active) setEntries(data.agenda);
      })
      .catch(() => {
        if (active) setEntries([]);
      });

    return () => {
      active = false;
    };
  }, [artistId, view, month, weekStart]);

  function handleMonthDayClick(day: Date) {
    setWeekStart(startOfWeek(day));
    setView("week");
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Agenda</h2>

        {view === "week" ? (
          <div className="flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => setWeekStart((current) => addWeeks(current, -1))}
              aria-label="Semana anterior"
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/[.04] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[.08] dark:hover:text-zinc-50"
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
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/[.04] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[.08] dark:hover:text-zinc-50"
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
        )}
      </div>

      {view === "week" ? (
        <WeekView weekStart={weekStart} entries={entries} simplified />
      ) : (
        <MonthCalendar
          month={month}
          entries={entries}
          onDayClick={handleMonthDayClick}
          simplified
        />
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <AgendaLegend simplified />
        <button
          type="button"
          onClick={() => setView(view === "week" ? "month" : "week")}
          className={`shrink-0 ${secondaryButtonClass} px-4 py-1.5 text-xs`}
        >
          {view === "week" ? "Ver mês inteiro" : "Ver semana"}
        </button>
      </div>
    </section>
  );
}
