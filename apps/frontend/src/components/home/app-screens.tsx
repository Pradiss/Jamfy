"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListChecks,
  Calendar,
  MessageCircle,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import { containerClass } from "@/lib/ui";

const SCREENS = [
  {
    icon: LayoutDashboard,
    title: "Hoje",
    caption: "Seus próximos shows e o que fazer primeiro, num só lugar.",
  },
  {
    icon: Calendar,
    title: "Agenda",
    caption: "Marque bloqueios e veja seus compromissos sem perder uma data.",
  },
  {
    icon: ListChecks,
    title: "Solicitações",
    caption: "Aceite ou recuse pedidos de contratação com um toque.",
  },
  {
    icon: MessageCircle,
    title: "Mensagens",
    caption: "Combine os detalhes do show direto pelo chat do site.",
  },
  {
    icon: Star,
    title: "Avaliações",
    caption: "Veja o que quem já te contratou está dizendo sobre o show.",
  },
  {
    icon: ImageIcon,
    title: "Portfólio",
    caption: "Fotos, vídeos e repertório pra quem vai te contratar conhecer o seu trabalho.",
  },
];

function ScreenPhone({ icon: Icon, title }: { icon: (typeof SCREENS)[number]["icon"]; title: string }) {
  return (
    <div className="w-[170px] rounded-[1.6rem] border-[6px] border-zinc-950 bg-zinc-950 shadow-xl ">
      <div className="relative aspect-[9/18.5] overflow-hidden rounded-[1.2rem] bg-white ">
        <div className="absolute top-0 left-1/2 h-3.5 w-14 -translate-x-1/2 rounded-b-lg bg-zinc-950 " />
        <div className="flex h-full flex-col items-center justify-center gap-2.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
            <Icon className="h-6 w-6 text-accent" strokeWidth={1.6} />
          </span>
          <span className="text-xs font-semibold">{title}</span>
        </div>
      </div>
    </div>
  );
}

// A stack of app screens the visitor browses through — the artist-facing
// side of Jamfy (agenda, requests, chat, reviews, portfolio) shown as a
// quick, clickable tour instead of a wall of screenshots.
export function AppScreens() {
  const [active, setActive] = useState(0);
  const current = SCREENS[active];

  function go(delta: number) {
    setActive((value) =>
      Math.min(Math.max(value + delta, 0), SCREENS.length - 1),
    );
  }

  return (
    <section className="bg-accent/5 px-6 py-20 sm:py-28">
      <div className={containerClass}>
        <div className="mb-14 max-w-xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-zinc-600 uppercase ">
            <i
              className="hero-dot h-1.5 w-1.5 rounded-full bg-accent"
              aria-hidden="true"
            />
            Por dentro do site
          </span>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Cada etapa do show,{" "}
            <span className="text-accent">a um clique.</span>
          </h2>
        </div>

        <div className="relative flex h-[280px] items-center justify-center sm:h-[320px]">
          {SCREENS.map((screen, index) => {
            const offset = index - active;
            if (Math.abs(offset) > 2) return null;

            return (
              <div
                key={screen.title}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  transform: `translateX(${offset * 72}px) scale(${1 - Math.abs(offset) * 0.14}) rotate(${offset * 5}deg)`,
                  zIndex: 10 - Math.abs(offset),
                  opacity: Math.abs(offset) === 2 ? 0.5 : 1,
                }}
              >
                <ScreenPhone icon={screen.icon} title={screen.title} />
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-[auto_1fr_auto] items-center gap-4 sm:mx-auto sm:max-w-md">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={active === 0}
            aria-label="Tela anterior"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-black/5 disabled:opacity-30 "
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="font-semibold tracking-tight">{current.title}</p>
            <p className="mt-0.5 text-sm text-zinc-500 ">
              {current.caption}
            </p>
            <p className="mt-2 text-xs tracking-widest text-zinc-400">
              {String(active + 1).padStart(2, "0")} / {String(SCREENS.length).padStart(2, "0")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            disabled={active === SCREENS.length - 1}
            aria-label="Próxima tela"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-black/5 disabled:opacity-30 "
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
