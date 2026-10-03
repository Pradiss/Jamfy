import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { apiFetch, ApiError } from "@/lib/api";
import type { AnuncioDetail } from "@/lib/types";
import { TIPO_ANUNCIO_LABELS } from "@/lib/types";
import { AnuncioGallery } from "@/components/anuncio/anuncio-gallery";
import { AnuncioContactSection } from "@/components/anuncio/anuncio-contact-section";
import { containerClass } from "@/lib/ui";

const getAnuncioById = cache((id: string) =>
  apiFetch<AnuncioDetail>(`/api/anuncios/${id}`),
);

export async function generateMetadata(
  props: PageProps<"/anuncios/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;

  try {
    const anuncio = await getAnuncioById(id);
    const description = anuncio.descricao.slice(0, 160);

    return {
      title: `${anuncio.titulo} | Jamfy`,
      description,
      openGraph: {
        title: anuncio.titulo,
        description,
        images: anuncio.fotos[0] ? [{ url: anuncio.fotos[0] }] : undefined,
      },
    };
  } catch {
    return { title: "Anúncio não encontrado | Jamfy" };
  }
}

export default async function AnuncioDetailPage(
  props: PageProps<"/anuncios/[id]">,
) {
  const { id } = await props.params;

  let anuncio: AnuncioDetail;

  try {
    anuncio = await getAnuncioById(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <div className={`${containerClass} flex-1 px-6 py-8 sm:py-10`}>
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <AnuncioGallery fotos={anuncio.fotos} titulo={anuncio.titulo} />

        <div>
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            {TIPO_ANUNCIO_LABELS[anuncio.tipo]}
          </span>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {anuncio.titulo}
          </h1>

          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            {anuncio.categoria} · {anuncio.cidade}, {anuncio.estado}
          </p>

          <p className="mt-4 text-2xl font-semibold">
            {anuncio.preco
              ? `R$ ${Number(anuncio.preco).toLocaleString("pt-BR")}`
              : "A combinar"}
          </p>

          <p className="mt-6 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
            {anuncio.descricao}
          </p>

          <div className="mt-6 flex items-center gap-3 border-t border-black/5 pt-6 dark:border-white/10">
            {anuncio.usuario.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={anuncio.usuario.fotoUrl}
                alt={anuncio.usuario.nome}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-sm font-semibold text-zinc-500">
                {anuncio.usuario.nome.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="text-sm">
              <p className="font-medium">{anuncio.usuario.nome}</p>
              <p className="text-zinc-500 dark:text-zinc-400">Anunciante</p>
            </div>
          </div>

          <div className="mt-6">
            <AnuncioContactSection anuncioId={anuncio.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
