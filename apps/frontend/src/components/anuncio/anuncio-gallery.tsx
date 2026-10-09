"use client";

import { useState } from "react";
import Image from "next/image";
import { PortfolioLightbox } from "@/components/artist/portfolio-lightbox";

export function AnuncioGallery({
  fotos,
  titulo,
}: {
  fotos: string[];
  titulo: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (fotos.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-surface text-6xl">
        🎸
      </div>
    );
  }

  const items = fotos.map((url, index) => ({
    id: String(index),
    titulo,
    arquivoUrl: url,
    tipo: "FOTO" as const,
  }));

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        {fotos.length > 1 ? (
          <div className="order-2 flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {fotos.map((foto, index) => (
              <button
                key={foto}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver foto ${index + 1}`}
                className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-surface ring-2 transition sm:w-full ${
                  index === activeIndex
                    ? "ring-accent"
                    : "ring-transparent hover:ring-black/10 dark:hover:ring-white/15"
                }`}
              >
                <Image src={foto} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setLightboxIndex(activeIndex)}
          className="relative order-1 aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-surface sm:order-2"
        >
          <Image
            src={fotos[activeIndex]}
            alt={titulo}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        </button>
      </div>

      {lightboxIndex !== null ? (
        <PortfolioLightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </>
  );
}
