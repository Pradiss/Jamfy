"use client";

import { useEffect, useState, type ReactNode } from "react";

const TABS = [
  { key: "agenda", label: "Agenda" },
  { key: "portfolio", label: "Portfólio" },
  { key: "sobre", label: "Sobre" },
  { key: "avaliacoes", label: "Avaliações" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ArtistProfileTabs({
  portfolio,
  sobre,
  avaliacoes,
  agenda,
}: Record<TabKey, ReactNode>) {
  const [active, setActive] = useState<TabKey>("agenda");

  // The "Solicitar contratação" sticky bar and the mobile tab bar both link
  // to #agenda, which lives inside the Agenda tab. Agenda is already the
  // default tab, so on first load this only needs to scroll (no setState).
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#agenda" || hash === "#contratar") {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }

    // A click on one of those links *during* the same visit (e.g. after
    // switching to Sobre or Portfólio) only changes the URL hash — it
    // doesn't remount this component — so without this listener the tab
    // would never switch back once the visitor has moved to another tab.
    function handleHashChange() {
      const newHash = window.location.hash;
      if (newHash === "#agenda" || newHash === "#contratar") {
        setActive("agenda");
        requestAnimationFrame(() => {
          document.getElementById(newHash.slice(1))?.scrollIntoView();
        });
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const content: Record<TabKey, ReactNode> = {
    portfolio,
    sobre,
    avaliacoes,
    agenda,
  };

  return (
    <div className="mt-8">
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto border-b border-black/5"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
              active === tab.key
                ? "border-zinc-950 text-zinc-950"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-6">{content[active]}</div>
    </div>
  );
}
