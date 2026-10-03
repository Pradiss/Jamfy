import Link from "next/link";
import type { Metadata } from "next";

import { AnuncioCard } from "@/components/anuncio/anuncio-card";
import { AnuncioFilterSheet } from "@/components/anuncio/anuncio-filter-sheet";
import { apiFetch, ApiError } from "@/lib/api";
import type { AnuncioListResponse, TipoAnuncio } from "@/lib/types";
import { toQueryString } from "@/lib/query";
import { inputClass } from "@/components/ui/form-field";
import { primaryButtonClass, containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Comprar e vender instrumentos | Jamfy",
  description:
    "Anúncios de músicos e bandas para comprar, vender ou alugar instrumentos e equipamentos.",
};

const TIPO_OPTIONS: { value: TipoAnuncio | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "VENDA", label: "Venda" },
  { value: "COMPRA", label: "Compra" },
  { value: "ALUGUEL", label: "Aluguel" },
];

function getParam(
  searchParams: Awaited<PageProps<"/anuncios">["searchParams"]>,
  key: string,
) {
  const value = searchParams[key];
  return typeof value === "string" ? value : undefined;
}

export default async function AnunciosPage(props: PageProps<"/anuncios">) {
  const searchParams = await props.searchParams;

  const busca = getParam(searchParams, "busca");
  const tipo = getParam(searchParams, "tipo");
  const cidade = getParam(searchParams, "cidade");
  const estado = getParam(searchParams, "estado");
  const precoMin = getParam(searchParams, "precoMin");
  const precoMax = getParam(searchParams, "precoMax");
  const page = getParam(searchParams, "page") ?? "1";

  const allFilters = { busca, tipo, cidade, estado, precoMin, precoMax };

  const query = toQueryString({ ...allFilters, page, limit: "12" });

  let data: AnuncioListResponse | null = null;
  let error: string | null = null;

  try {
    data = await apiFetch<AnuncioListResponse>(`/api/anuncios?${query}`);
  } catch (err) {
    error =
      err instanceof ApiError
        ? err.message
        : "Não foi possível carregar os anúncios agora.";
  }

  const activeAdvancedCount = [cidade, estado, precoMin, precoMax].filter(
    Boolean,
  ).length;

  return (
    <div className={`${containerClass} flex-1 px-6 py-8 sm:py-10`}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Comprar e vender
        </h1>
        <Link href="/anuncios/novo" className={primaryButtonClass}>
          Anunciar
        </Link>
      </div>

      <div className="mb-5 flex gap-2">
        <form method="get" className="flex flex-1 gap-2">
          {tipo ? <input type="hidden" name="tipo" value={tipo} /> : null}
          {cidade ? (
            <input type="hidden" name="cidade" value={cidade} />
          ) : null}
          {estado ? (
            <input type="hidden" name="estado" value={estado} />
          ) : null}
          {precoMin ? (
            <input type="hidden" name="precoMin" value={precoMin} />
          ) : null}
          {precoMax ? (
            <input type="hidden" name="precoMax" value={precoMax} />
          ) : null}
          <input
            type="text"
            name="busca"
            placeholder="O que você está procurando?"
            defaultValue={busca}
            className={`flex-1 ${inputClass}`}
          />
        </form>

        <AnuncioFilterSheet
          basePath="/anuncios"
          preserved={{ busca, tipo }}
          initialCidade={cidade}
          initialEstado={estado}
          initialPrecoMin={precoMin}
          initialPrecoMax={precoMax}
          activeCount={activeAdvancedCount}
        />
      </div>

      <div className="mb-7 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TIPO_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={`/anuncios?${toQueryString({ ...allFilters, tipo: option.value || undefined })}`}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              (tipo ?? "") === option.value
                ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                : "border-black/10 hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : data && data.anuncios.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          Nenhum anúncio encontrado com esses filtros.
        </p>
      ) : data ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.anuncios.map((anuncio) => (
              <AnuncioCard key={anuncio.id} anuncio={anuncio} />
            ))}
          </div>

          {data.paginacao.totalPaginas > 1 ? (
            <div className="mt-12 flex items-center justify-center gap-4 text-sm">
              <Link
                href={`/anuncios?${toQueryString({ ...allFilters, page: String(data.paginacao.pagina - 1) })}`}
                className={`rounded-full border border-black/10 px-4 py-1.5 transition hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06] ${
                  data.paginacao.pagina <= 1
                    ? "pointer-events-none opacity-40"
                    : ""
                }`}
              >
                Anterior
              </Link>
              <span className="text-zinc-500 dark:text-zinc-400">
                Página {data.paginacao.pagina} de {data.paginacao.totalPaginas}
              </span>
              <Link
                href={`/anuncios?${toQueryString({ ...allFilters, page: String(data.paginacao.pagina + 1) })}`}
                className={`rounded-full border border-black/10 px-4 py-1.5 transition hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06] ${
                  data.paginacao.pagina >= data.paginacao.totalPaginas
                    ? "pointer-events-none opacity-40"
                    : ""
                }`}
              >
                Próxima
              </Link>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
