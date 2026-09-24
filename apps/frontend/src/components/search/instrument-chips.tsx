import Link from "next/link";
import { toQueryString } from "@/lib/query";

export function InstrumentChips({
  instruments,
  activeId,
  basePath,
  query,
}: {
  instruments: { id: string; nome: string }[];
  activeId?: string;
  basePath: string;
  query: Record<string, string | undefined>;
}) {
  if (instruments.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {instruments.map((instrument) => {
        const isActive = instrument.id === activeId;
        const href = `${basePath}?${toQueryString({
          ...query,
          instrumentoId: isActive ? undefined : instrument.id,
        })}`;

        return (
          <Link
            key={instrument.id}
            href={href}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                : "border-black/10 text-zinc-600 hover:bg-black/[.03] dark:border-white/15 dark:text-zinc-400 dark:hover:bg-white/[.06]"
            }`}
          >
            {instrument.nome}
          </Link>
        );
      })}
    </div>
  );
}
