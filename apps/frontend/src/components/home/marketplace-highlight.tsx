import Link from "next/link";
import { ShoppingBag, Tag, Guitar, ArrowRight } from "lucide-react";
import { containerClass } from "@/lib/ui";

// Same labels/colors as TIPO_ANUNCIO_LABELS and the anuncio card badges —
// keeps this section visually consistent with the listings it links to.
const ITEMS = [
  {
    key: "COMPRA",
    title: "Comprar",
    description:
      "Procurando um instrumento ou equipamento? Veja o que já tem anunciado.",
    icon: ShoppingBag,
    href: "/anuncios?tipo=COMPRA",
    chip: "bg-accent text-accent-foreground",
    tint: "bg-accent/10",
  },
  {
    key: "VENDA",
    title: "Vender",
    description:
      "Anuncie o instrumento ou equipamento parado em minutos, sem comissão.",
    icon: Tag,
    href: "/anuncios/novo",
    chip: "bg-emerald-600 text-white",
    tint: "bg-emerald-600/10",
  },
  {
    key: "ALUGUEL",
    title: "Alugar",
    description:
      "Som, luz e instrumentos pra um show só, sem precisar comprar.",
    icon: Guitar,
    href: "/anuncios?tipo=ALUGUEL",
    chip: "bg-amber-600 text-white",
    tint: "bg-amber-600/10",
  },
] as const;

export function MarketplaceHighlight() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className={containerClass}>
        <div className="mb-10 max-w-xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:bg-white/10 dark:text-zinc-300">
            <i
              className="hero-dot h-1.5 w-1.5 rounded-full bg-accent"
              aria-hidden="true"
            />
            Mercado de equipamentos
          </span>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Compre, venda ou alugue{" "}
            <span className="text-accent">sem sair do site.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`group relative flex flex-col gap-5 overflow-hidden rounded-[2rem] p-7 transition hover:-translate-y-1 ${item.tint}`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.chip}`}
                >
                  <Icon className="h-6 w-6" />
                </span>

                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-300">
                    {item.description}
                  </p>
                </div>

                <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold">
                  {item.key === "VENDA" ? "Anunciar" : "Ver anúncios"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
