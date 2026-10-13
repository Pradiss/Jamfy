"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  MonthCalendar,
  WeekView,
  AgendaLegend,
  startOfMonth,
  addMonths,
  addWeeks,
  weekRangeLabel,
  getBrazilToday,
  MONTH_FORMATTER,
  type SimpleAgendaEntry,
} from "@/components/artist/month-calendar";
import { HiringRequestForm } from "@/components/hiring/hiring-request-form";
import { secondaryButtonClass } from "@/lib/ui";

export function ArtistAvailability(props: {
  artistId: string;
  ownerUserId: string;
  slug: string;
}) {
  return (
    <Suspense fallback={null}>
      <ArtistAvailabilityInner {...props} />
    </Suspense>
  );
}

function ArtistAvailabilityInner({
  artistId,
  ownerUserId,
  slug,
}: {
  artistId: string;
  ownerUserId: string;
  slug: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"week" | "month">("week");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [weekStart, setWeekStart] = useState(() => getBrazilToday());
  const [entries, setEntries] = useState<SimpleAgendaEntry[]>([]);
  const [manualRequestDate, setManualRequestDate] = useState<string | null>(
    null,
  );
  const [dismissedUrlDate, setDismissedUrlDate] = useState(false);

  // Coming back here right after signing up/logging in to schedule a
  // specific day reopens the request popup for it — derived straight from
  // the URL instead of synced through an effect, so there's no extra
  // render in between.
  const urlRequestDate = searchParams.get("data");
  const requestDate =
    manualRequestDate ??
    (!dismissedUrlDate && user ? urlRequestDate : null);

  function closeRequestModal() {
    setManualRequestDate(null);
    setDismissedUrlDate(true);
  }

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

  // Clicking a day is the main way to start scheduling with the artist — it
  // opens the hiring request right there with that date already filled in,
  // instead of making the visitor scroll down and fill the date by hand.
  function handleDayClick(day: Date) {
    const data = day.toISOString().slice(0, 10);

    if (!user) {
      const target = `/artistas/${slug}?data=${data}`;
      router.push(`/cadastro?redirect=${encodeURIComponent(target)}`);
      return;
    }

    setManualRequestDate(data);
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
        <WeekView
          weekStart={weekStart}
          entries={entries}
          onDayClick={handleDayClick}
          simplified
        />
      ) : (
        <MonthCalendar
          month={month}
          entries={entries}
          onDayClick={handleDayClick}
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

      {requestDate ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeRequestModal} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl sm:p-6 dark:bg-zinc-900">
            <button
              type="button"
              onClick={closeRequestModal}
              aria-label="Fechar"
              className="absolute top-4 right-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
            <HiringRequestForm
              artistId={artistId}
              artistUserId={ownerUserId}
              initialDate={requestDate}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
