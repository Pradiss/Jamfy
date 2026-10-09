import Link from "next/link";
import type { Metadata } from "next";

import { ArtistCard } from "@/components/artist/artist-card";
import { GenreCategoryGrid } from "@/components/search/genre-category-grid";
import { InstrumentChips } from "@/components/search/instrument-chips";
import { FilterSheet } from "@/components/search/filter-sheet";
import { apiFetch, ApiError } from "@/lib/api";
import type { ArtistProfileListResponse } from "@/lib/types";
import { toQueryString } from "@/lib/query";
import {
  sortGenresByPopularity,
  sortInstrumentsByPopularity,
} from "@/lib/popularity";
import { inputClass } from "@/components/ui/form-field";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Buscar artistas | Jamfy",
  description:
    "Encontre músicos e bandas por cidade, gênero e instrumento, veja a agenda e solicite a contratação para o seu evento.",
};

function getParam(
  searchParams: Awaited<PageProps<"/artistas">["searchParams"]>,
  key: string,
) {
  const value = searchParams[key];
  return typeof value === "string" ? value : undefined;
}

export default async function ArtistasPage(props: PageProps<"/artistas">) {
  const searchParams = await props.searchParams;

  const busca = getParam(searchParams, "busca");
  const cidade = getParam(searchParams, "cidade");
  const estado = getParam(searchParams, "estado");
  const tipo = getParam(searchParams, "tipo");
  const generoId = getParam(searchParams, "generoId");
  const instrumentoId = getParam(searchParams, "instrumentoId");
  const disponivel = getParam(searchParams, "disponivel");
  const precoMin = getParam(searchParams, "precoMin");
  const precoMax = getParam(searchParams, "precoMax");
  const page = getParam(searchParams, "page") ?? "1";

  const allFilters = {
    busca,
    cidade,
    estado,
    tipo,
    generoId,
    instrumentoId,
    disponivel,
    precoMin,
    precoMax,
  };

  const query = toQueryString({ ...allFilters, page, limit: "12" });

  let data: ArtistProfileListResponse | null = null;
  let error: string | null = null;

  try {
    data = await apiFetch<ArtistProfileListResponse>(
      `/api/artist-profile?${query}`,
      { next: { revalidate: 60 } },
    );
  } catch (err) {
    error =
      err instanceof ApiError
        ? err.message
        : "Não foi possível carregar os artistas agora.";
  }

  let generoNome: string | null = null;

  if (generoId) {
    try {
      const genero = await apiFetch<{ nome: string }>(
        `/api/genre/${generoId}`,
        { next: { revalidate: 3600 } },
      );
      generoNome = genero.nome;
    } catch {
      // The filter still applies even if we can't fetch its label.
    }
  }

  const [generos, instrumentos] = await Promise.all([
    !generoId
      ? apiFetch<{ id: string; nome: string }[]>("/api/genre", {
          next: { revalidate: 3600 },
        })
          .then(sortGenresByPopularity)
          .catch(() => [] as { id: string; nome: string }[])
      : Promise.resolve([] as { id: string; nome: string }[]),
    apiFetch<{ id: string; nome: string }[]>("/api/instruments", {
      next: { revalidate: 3600 },
    })
      .then(sortInstrumentsByPopularity)
      .catch(() => [] as { id: string; nome: string }[]),
  ]);

  const activeAdvancedCount = [
    tipo,
    cidade,
    estado,
    disponivel,
    precoMin,
    precoMax,
  ].filter(Boolean).length;

  return (
    <div className={`${containerClass} flex-1 px-6 py-8 sm:py-10`}>
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">
        Buscar artistas
      </h1>

      <div className="mb-5 flex gap-2">
        <form method="get" className="flex flex-1 gap-2">
          {generoId ? (
            <input type="hidden" name="generoId" value={generoId} />
          ) : null}
          {instrumentoId ? (
            <input type="hidden" name="instrumentoId" value={instrumentoId} />
          ) : null}
          {tipo ? <input type="hidden" name="tipo" value={tipo} /> : null}
          {cidade ? (
            <input type="hidden" name="cidade" value={cidade} />
          ) : null}
          {estado ? (
            <input type="hidden" name="estado" value={estado} />
          ) : null}
          {disponivel ? (
            <input type="hidden" name="disponivel" value={disponivel} />
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
            placeholder="Nome do artista"
            defaultValue={busca}
            className={`flex-1 ${inputClass}`}
          />
        </form>

        <FilterSheet
          basePath="/artistas"
          preserved={{ busca, generoId, instrumentoId }}
          initialTipo={tipo}
          initialCidade={cidade}
          initialEstado={estado}
          initialDisponivel={disponivel}
          initialPrecoMin={precoMin}
          initialPrecoMax={precoMax}
          activeCount={activeAdvancedCount}
        />
      </div>

      <InstrumentChips
        instruments={instrumentos}
        activeId={instrumentoId}
        basePath="/artistas"
        query={{
          busca,
          cidade,
          estado,
          tipo,
          generoId,
          disponivel,
          precoMin,
          precoMax,
        }}
      />

      {!generoId ? <GenreCategoryGrid genres={generos} /> : null}

      {generoNome ? (
        <div className="mb-7 flex items-center gap-2 text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            Estilo:{" "}
            <span className="font-medium text-accent">{generoNome}</span>
          </span>
          <Link
            href={`/artistas?${toQueryString({
              busca,
              cidade,
              estado,
              tipo,
              instrumentoId,
              disponivel,
              precoMin,
              precoMax,
            })}`}
            className="text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            ✕
          </Link>
        </div>
      ) : null}

      {error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : data && data.artistas.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          Nenhum artista encontrado com esses filtros.
        </p>
      ) : data ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.artistas.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>

          {data.paginacao.totalPaginas > 1 ? (
            <div className="mt-12 flex items-center justify-center gap-4 text-sm">
              <Link
                href={`/artistas?${toQueryString({ ...allFilters, page: String(data.paginacao.pagina - 1) })}`}
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
                href={`/artistas?${toQueryString({ ...allFilters, page: String(data.paginacao.pagina + 1) })}`}
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
