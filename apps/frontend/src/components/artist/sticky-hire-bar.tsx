"use client";

import { useAuth } from "@/lib/auth-context";
import { primaryButtonClass } from "@/lib/ui";

// Mobile-only — a persistent shortcut back to the agenda calendar while
// browsing Portfólio/Sobre/Avaliações, so a visitor doesn't have to hunt
// for the Agenda tab again. Links to #agenda (the calendar itself, always
// populated) rather than #contratar (the hiring form, which only renders
// once a day is picked and would otherwise land on an empty area). Sits
// just above the site's own mobile tab bar, not over it.
export function StickyHireBar({
  ownerUserId,
  cache,
}: {
  ownerUserId: string;
  cache: number | string | null;
}) {
  const { user } = useAuth();

  if (user?.id === ownerUserId) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-14 z-30 border-t border-black/5 bg-white/95 px-4 py-2.5 backdrop-blur-xl sm:hidden "
      style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom))" }}
    >
      <a
        href="#agenda"
        className={`flex w-full items-center justify-center gap-2 ${primaryButtonClass} py-2.5`}
      >
        Solicitar contratação
        {cache ? (
          <span className="opacity-80">
            · R$ {Number(cache).toLocaleString("pt-BR")}
          </span>
        ) : null}
      </a>
    </div>
  );
}
