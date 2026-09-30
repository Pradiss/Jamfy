"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass } from "@/components/ui/form-field";
import { EstadoCidadeFields } from "@/components/ui/estado-cidade-fields";
import { primaryButtonClass } from "@/lib/ui";
import { toQueryString } from "@/lib/query";

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

const TIPO_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "MUSICO", label: "Músico(a)" },
  { value: "BANDA", label: "Banda" },
];

export function FilterSheet({
  basePath,
  preserved,
  initialTipo,
  initialCidade,
  initialEstado,
  initialDisponivel,
  initialPrecoMin,
  initialPrecoMax,
  activeCount,
}: {
  basePath: string;
  preserved: Record<string, string | undefined>;
  initialTipo?: string;
  initialCidade?: string;
  initialEstado?: string;
  initialDisponivel?: string;
  initialPrecoMin?: string;
  initialPrecoMax?: string;
  activeCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState(initialTipo ?? "");
  const [cidade, setCidade] = useState(initialCidade ?? "");
  const [estado, setEstado] = useState(initialEstado ?? "");
  const [disponivel, setDisponivel] = useState(initialDisponivel === "true");
  const [precoMin, setPrecoMin] = useState(initialPrecoMin ?? "");
  const [precoMax, setPrecoMax] = useState(initialPrecoMax ?? "");

  function apply() {
    const query = toQueryString({
      ...preserved,
      tipo: tipo || undefined,
      cidade: cidade || undefined,
      estado: estado || undefined,
      disponivel: disponivel ? "true" : undefined,
      precoMin: precoMin || undefined,
      precoMax: precoMax || undefined,
    });
    setOpen(false);
    router.push(`${basePath}?${query}`);
  }

  function clear() {
    setTipo("");
    setCidade("");
    setEstado("");
    setDisponivel(false);
    setPrecoMin("");
    setPrecoMax("");
    setOpen(false);
    router.push(`${basePath}?${toQueryString(preserved)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-black/10 px-4 text-sm font-medium whitespace-nowrap transition hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
      >
        <FilterIcon className="h-4 w-4" />
        Filtros
        {activeCount > 0 ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
            {activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:max-w-md sm:rounded-3xl dark:bg-zinc-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Filtros
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tipo
                </p>
                <div className="flex gap-2">
                  {TIPO_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTipo(option.value)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${
                        tipo === option.value
                          ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                          : "border-black/10 dark:border-white/15"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <EstadoCidadeFields
                state={estado}
                city={cidade}
                onStateChange={setEstado}
                onCityChange={setCidade}
                required={false}
              />

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Cachê mín. (R$)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={precoMin}
                    onChange={(event) => setPrecoMin(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Cachê máx. (R$)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={precoMax}
                    onChange={(event) => setPrecoMax(event.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={disponivel}
                  onChange={(event) => setDisponivel(event.target.checked)}
                  className="accent-accent"
                />
                Só mostrar quem está disponível
              </label>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={apply}
                className={`flex-1 ${primaryButtonClass}`}
              >
                Aplicar filtros
              </button>
              <button
                type="button"
                onClick={clear}
                className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
