import { CheckCircle2, Clock, Eye, Star } from "lucide-react";

// Decorative preview of an artist's dashboard — illustrative only, not real
// account data. Sits beside the hero search as the visual payoff of "veja a
// agenda em tempo real" from the copy next to it.
export function HeroMockup() {
  return (
    <div className="relative">
      <div className="relative mx-auto w-full max-w-[290px] rounded-[2.5rem] border-[10px] border-zinc-950 bg-zinc-950 shadow-2xl shadow-black/30 ">
        <div className="absolute top-0 left-1/2 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-zinc-950 " />

        <div className="overflow-hidden rounded-[2rem] bg-white ">
          <div className="flex flex-col gap-4 p-5 pt-9">
            <div className="text-center">
              <p className="text-[11px] font-medium tracking-wide text-zinc-400">
                Qui, 12 de outubro
              </p>
              <p className="mt-0.5 text-base font-semibold tracking-tight">
                Boa tarde, Marina
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-accent/10 p-3.5">
              <svg viewBox="0 0 36 36" className="h-11 w-11 shrink-0">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-accent/20"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="94.2"
                  strokeDashoffset="23.5"
                  className="-rotate-90 origin-center text-accent"
                />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-semibold">3 shows este mês</p>
                <p className="truncate text-xs text-zinc-500 ">
                  2 confirmados, 1 pendente
                </p>
              </div>
            </div>

            <ul className="flex flex-col gap-2">
              <li className="flex items-center gap-2.5 rounded-xl border border-black/5 px-3 py-2.5 text-sm ">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="min-w-0 flex-1 truncate">
                  Casa de Shows Vitrola
                </span>
                <span className="shrink-0 text-xs text-zinc-400">20h</span>
              </li>
              <li className="flex items-center gap-2.5 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm">
                <Clock className="h-4 w-4 shrink-0 text-accent" />
                <span className="min-w-0 flex-1 truncate">
                  Aniversário — Studio B
                </span>
                <span className="shrink-0 text-xs text-zinc-400">22h</span>
              </li>
            </ul>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-black/[.03] p-3 ">
                <p className="flex items-center gap-1 text-[11px] text-zinc-500 ">
                  <Star className="h-3 w-3" /> Avaliação
                </p>
                <p className="mt-0.5 text-lg font-semibold">4.9</p>
              </div>
              <div className="rounded-xl bg-black/[.03] p-3 ">
                <p className="flex items-center gap-1 text-[11px] text-zinc-500 ">
                  <Eye className="h-3 w-3" /> Visitas
                </p>
                <p className="mt-0.5 text-lg font-semibold">238</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-float-1 absolute -left-6 top-10 hidden w-56 rounded-2xl border border-black/5 bg-white p-3.5 shadow-lg sm:block">
        <p className="text-xs font-semibold text-accent">Nova solicitação</p>
        <p className="mt-0.5 text-sm">João quer te contratar pro dia 20/11.</p>
      </div>

      <div className="hero-float-2 absolute -right-6 bottom-10 hidden w-52 rounded-2xl border border-black/5 bg-white p-3.5 shadow-lg sm:block">
        <p className="text-xs font-semibold text-emerald-600">
          Proposta aceita
        </p>
        <p className="mt-0.5 text-sm">Você fechou com o Studio B 🎉</p>
      </div>
    </div>
  );
}
