import { describe, expect, it } from "vitest";
import {
  getEntryForDay,
  getEntriesForDay,
  type SimpleAgendaEntry,
} from "./month-calendar";

// This overlap logic used to be a simple point-in-range check, which broke
// as soon as a timed entry's Brazil-local time crossed into the next UTC
// day (e.g. a 23:00 show stored as 02:00Z the next day would show up under
// the wrong calendar day). Keeping these cases pinned down so that bug
// class can't come back silently.

function day(year: number, month: number, date: number) {
  return new Date(Date.UTC(year, month - 1, date));
}

describe("getEntryForDay", () => {
  it("matches a whole-day entry on its exact nominal UTC day only", () => {
    const entry: SimpleAgendaEntry = {
      dataInicio: "2026-11-20T00:00:00.000Z",
      dataFim: "2026-11-21T00:00:00.000Z",
      status: "INDISPONIVEL",
      diaInteiro: true,
    };

    expect(getEntryForDay(day(2026, 11, 20), [entry])).toBe(entry);
    expect(getEntryForDay(day(2026, 11, 19), [entry])).toBeNull();
    expect(getEntryForDay(day(2026, 11, 21), [entry])).toBeNull();
  });

  it("maps a late-night Brazil-time entry to the Brazil day it belongs to, not the UTC day it crosses into", () => {
    // 21:00-23:00 on Nov 20 in Brazil (UTC-3) is stored as
    // 2026-11-21T00:00:00Z-2026-11-21T02:00:00Z — the start instant lands
    // exactly on the next UTC calendar day, but the show itself never
    // crosses Brazil midnight, so it belongs to Nov 20 only.
    const entry: SimpleAgendaEntry = {
      dataInicio: "2026-11-21T00:00:00.000Z",
      dataFim: "2026-11-21T02:00:00.000Z",
      status: "RESERVADO",
      diaInteiro: false,
    };

    expect(getEntryForDay(day(2026, 11, 20), [entry])).toBe(entry);
    expect(getEntryForDay(day(2026, 11, 21), [entry])).toBeNull();
  });

  it("returns null when no entry overlaps the day", () => {
    const entry: SimpleAgendaEntry = {
      dataInicio: "2026-11-25T00:00:00.000Z",
      dataFim: "2026-11-26T00:00:00.000Z",
      status: "DISPONIVEL",
      diaInteiro: true,
    };

    expect(getEntryForDay(day(2026, 11, 20), [entry])).toBeNull();
  });
});

describe("getEntriesForDay", () => {
  it("returns every entry overlapping the day, sorted by start time", () => {
    const earlier: SimpleAgendaEntry = {
      dataInicio: "2026-11-20T21:00:00.000Z", // 18:00 Brazil
      dataFim: "2026-11-20T23:00:00.000Z",
      status: "RESERVADO",
      diaInteiro: false,
    };
    const later: SimpleAgendaEntry = {
      dataInicio: "2026-11-21T00:00:00.000Z", // 21:00 Brazil, same Brazil day
      dataFim: "2026-11-21T02:00:00.000Z",
      status: "RESERVADO",
      diaInteiro: false,
    };

    const result = getEntriesForDay(day(2026, 11, 20), [later, earlier]);

    expect(result).toEqual([earlier, later]);
  });

  it("returns an empty array when nothing overlaps the day", () => {
    const entry: SimpleAgendaEntry = {
      dataInicio: "2026-11-25T00:00:00.000Z",
      dataFim: "2026-11-26T00:00:00.000Z",
      status: "DISPONIVEL",
      diaInteiro: true,
    };

    expect(getEntriesForDay(day(2026, 11, 20), [entry])).toEqual([]);
  });
});
