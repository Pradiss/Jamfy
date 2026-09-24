"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  MonthCalendar,
  AgendaLegend,
  startOfMonth,
  addMonths,
  MONTH_FORMATTER,
  type SimpleAgendaEntry,
} from "@/components/artist/month-calendar";

export function ArtistAvailability({ artistId }: { artistId: string }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [entries, setEntries] = useState<SimpleAgendaEntry[]>([]);

  useEffect(() => {
    let active = true;

    const de = encodeURIComponent(month.toISOString());
    const ate = encodeURIComponent(addMonths(month, 1).toISOString());

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
  }, [artistId, month]);

  return (
    <section className="mt-10">
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

      <MonthCalendar month={month} entries={entries} />

      <div className="mt-3">
        <AgendaLegend />
      </div>
    </section>
  );
}
