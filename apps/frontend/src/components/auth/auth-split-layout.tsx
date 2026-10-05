"use client";

import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";

export type HeroCategory = {
  label: string;
  title: string;
  subtitle: string;
  color: string;
  Icon: ComponentType<{ className?: string }>;
};

export function AuthSplitLayout({
  categories,
  children,
}: {
  categories: HeroCategory[];
  children: ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = categories[activeIndex];

  function advance() {
    setActiveIndex((current) => (current + 1) % categories.length);
  }

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-background p-2">
      <div className="relative hidden h-full overflow-hidden rounded-3xl bg-zinc-950 lg:flex lg:w-1/2 lg:flex-col lg:justify-end">
        <div
          key={active.label}
          className="animate-page-in absolute inset-0 opacity-70"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 20%, ${active.color} 0%, transparent 55%)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(255,255,255,0.12)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/95" />

       

        <div
          key={`${active.label}-copy`}
          className="animate-page-in relative z-10 px-8 pt-20 pb-6"
        >
          <h2 className="text-balance text-3xl leading-tight font-semibold tracking-tight text-white">
            {active.title}
          </h2>
          <p className="mt-2 max-w-sm text-sm font-medium text-white/60">
            {active.subtitle}
          </p>
        </div>

        <div className="relative z-10 flex gap-2 px-6 pb-6">
          {categories.map((category, index) => (
            <button
              key={category.label}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="flex flex-1 flex-col items-stretch gap-2 text-left"
            >
              <span
                className={`truncate text-[10px] font-medium tracking-wide uppercase transition ${
                  index === activeIndex ? "text-white" : "text-white/50"
                }`}
              >
                {category.label}
              </span>
              <span className="block h-1 w-full overflow-hidden rounded-full bg-white/15">
                {index === activeIndex ? (
                  <span
                    key={activeIndex}
                    onAnimationEnd={advance}
                    className="animate-[hero-tab-fill_5000ms_linear_forwards] motion-reduce:w-full motion-reduce:animate-none block h-full w-0 bg-white"
                  />
                ) : (
                  <span className="block h-full w-0 bg-white" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex h-full w-full flex-col overflow-y-auto rounded-3xl bg-white lg:w-1/2 dark:bg-zinc-950">
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-black/[.04] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[.06] dark:hover:text-zinc-50"
          >
            ← Voltar
          </Link>
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-10">
          <div className="flex w-full max-w-xs flex-col items-stretch gap-6">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-lg font-bold text-white dark:bg-white dark:text-zinc-950">
              J
            </span>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
