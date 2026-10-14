import {
  ShoppingBag,
  MessageCircle,
  Users,
  Image as ImageIcon,
  Percent,
  Guitar,
} from "lucide-react";
import { containerClass } from "@/lib/ui";

function MiniListings() {
  return (
    <div className="flex w-full flex-col gap-2 px-2">
      <div className="flex items-center justify-between gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs shadow-sm ">
        <span className="min-w-0 truncate font-medium">
          Guitarra Tagima Woodstock
        </span>
        <span className="shrink-0 font-semibold text-emerald-600">
          R$ 1.200
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 rounded-xl bg-white/90 px-3 py-2 text-xs shadow-sm ">
        <span className="min-w-0 truncate font-medium">
          Caixa de som JBL 15&quot;
        </span>
        <span className="shrink-0 font-semibold text-amber-600">
          R$ 80/dia
        </span>
      </div>
    </div>
  );
}

function MiniRental() {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white">
        ALUGUEL
      </span>
      <span className="text-sm font-medium">Som, luz e instrumentos</span>
    </div>
  );
}

function MiniBandMembers() {
  const colors = ["bg-accent", "bg-emerald-500", "bg-amber-500"];

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex -space-x-3">
        {colors.map((color, index) => (
          <span
            key={color}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white ${color}`}
          >
            {String.fromCharCode(65 + index)}
          </span>
        ))}
        <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-black/10 text-sm font-semibold ">
          +
        </span>
      </div>
      <span className="text-xs font-medium">Baterista procurado</span>
    </div>
  );
}

function MiniGallery() {
  return (
    <div className="grid grid-cols-3 gap-1.5 px-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <span
          key={index}
          className="aspect-square rounded-md bg-gradient-to-br from-accent/50 to-accent/10"
        />
      ))}
    </div>
  );
}

function MiniChat() {
  return (
    <div className="flex w-full flex-col gap-2 px-1">
      <div className="max-w-[75%] self-start rounded-2xl rounded-bl-sm bg-white/90 px-3 py-2 text-xs shadow-sm ">
        Ainda tem a guitarra? Aceita troca?
      </div>
      <div className="max-w-[75%] self-end rounded-2xl rounded-br-sm bg-accent px-3 py-2 text-xs text-accent-foreground shadow-sm">
        Tenho sim, me chama que combinamos!
      </div>
    </div>
  );
}

function MiniFee() {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-4xl font-semibold tracking-tight text-accent">0%</p>
      <p className="text-xs text-zinc-500 ">de comissão</p>
    </div>
  );
}

type Feature = {
  icon: typeof ShoppingBag;
  title: string;
  description: string;
  stat: string;
  span: string;
  visual: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    icon: ShoppingBag,
    title: "Compre e venda sem sair do site",
    description:
      "Anuncie instrumentos, equipamentos e acessórios — ou encontre o que procura perto de você.",
    stat: "Anúncio pronto em minutos",
    span: "sm:col-span-2 sm:row-span-2",
    visual: <MiniListings />,
  },
  {
    icon: Guitar,
    title: "Alugue equipamento de som",
    description:
      "Não precisa comprar pra fazer um show só — alugue caixa de som, luz e instrumentos direto com quem tem.",
    stat: "Categoria própria no site",
    span: "sm:col-span-2",
    visual: <MiniRental />,
  },
  {
    icon: Users,
    title: "Bandas em busca de integrante",
    description:
      "Procurando baterista, vocalista ou guitarrista? Publique a vaga e encontre quem toca no seu estilo.",
    stat: "Monte sua formação",
    span: "",
    visual: <MiniBandMembers />,
  },
  {
    icon: ImageIcon,
    title: "Fotos e vídeos no anúncio",
    description:
      "Mostre o estado real do instrumento ou do equipamento antes de fechar negócio.",
    stat: "Fotos e vídeos",
    span: "",
    visual: <MiniGallery />,
  },
  {
    icon: MessageCircle,
    title: "Chat direto com quem anunciou",
    description:
      "Combine preço, troca e entrega sem precisar trocar WhatsApp com desconhecido antes de ter certeza do negócio.",
    stat: "Sem expor seu número",
    span: "sm:col-span-2",
    visual: <MiniChat />,
  },
  {
    icon: Percent,
    title: "Sem comissão na venda",
    description: "O valor combinado com o comprador é o valor que cai no seu bolso.",
    stat: "Você recebe o combinado",
    span: "sm:col-span-2",
    visual: <MiniFee />,
  },
];

const CARD_BACKGROUNDS = [
  "bg-zinc-950 text-white",
  "bg-surface",
  "bg-accent text-accent-foreground",
  "bg-surface",
  "bg-surface",
  "bg-accent/10",
];

export function FeatureBento() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className={containerClass}>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-zinc-600 uppercase ">
              <i
                className="hero-dot h-1.5 w-1.5 rounded-full bg-accent"
                aria-hidden="true"
              />
              Comprar, vender e alugar
            </span>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              Equipamento e banda também{" "}
              <span className="text-accent">se resolvem aqui.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:[grid-auto-flow:dense] sm:grid-cols-4 sm:auto-rows-[260px]">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col gap-5 rounded-[2rem] p-6 shadow-sm ${CARD_BACKGROUNDS[index]} ${feature.span}`}
            >
              <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black/[.03] ">
                {feature.visual}
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm opacity-80">
                  {feature.description}
                </p>
                <span className="mt-3 inline-block rounded-full bg-black/10 px-2.5 py-1 text-[11px] font-medium ">
                  {feature.stat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
