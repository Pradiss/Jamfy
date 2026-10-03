"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import {
  AnuncioForm,
  type AnuncioFormValues,
} from "@/components/anuncio/anuncio-form";
import type { AnuncioDetail } from "@/lib/types";
import { containerClass, secondaryButtonClass } from "@/lib/ui";

export default function EditarAnuncioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [anuncio, setAnuncio] = useState<AnuncioDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    apiFetch<AnuncioDetail>(`/api/anuncios/${params.id}`)
      .then((data) => setAnuncio(data))
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (loading || !user || (!anuncio && !notFound)) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 dark:text-zinc-400">
        Carregando...
      </div>
    );
  }

  if (notFound || !anuncio) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 dark:text-zinc-400">
        Anúncio não encontrado.
      </div>
    );
  }

  if (anuncio.usuarioId !== user.id) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 dark:text-zinc-400">
        Você não tem permissão para editar este anúncio.
      </div>
    );
  }

  async function handleUpdate(values: AnuncioFormValues) {
    await apiFetch(`/api/anuncios/${params.id}`, {
      method: "PUT",
      body: {
        tipo: values.tipo,
        titulo: values.titulo,
        descricao: values.descricao,
        categoria: values.categoria,
        preco: values.preco ? Number(values.preco) : undefined,
        cidade: values.cidade,
        estado: values.estado,
        fotos: values.fotos,
      },
    });

    router.push(`/anuncios/${params.id}`);
  }

  async function handleDelete() {
    setDeleteError(null);

    if (!window.confirm("Tem certeza que deseja remover este anúncio?")) {
      return;
    }

    setDeleting(true);

    try {
      await apiFetch(`/api/anuncios/${params.id}`, { method: "DELETE" });
      router.push("/anuncios/meus");
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível remover o anúncio agora.",
      );
      setDeleting(false);
    }
  }

  return (
    <div className={`${containerClass} flex-1 px-6 py-10`}>
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-7 text-3xl font-semibold tracking-tight">
          Editar anúncio
        </h1>

        <AnuncioForm
          initialValues={{
            tipo: anuncio.tipo,
            titulo: anuncio.titulo,
            descricao: anuncio.descricao,
            categoria: anuncio.categoria,
            preco: anuncio.preco ?? "",
            cidade: anuncio.cidade,
            estado: anuncio.estado,
            fotos: anuncio.fotos,
          }}
          submitLabel="Salvar alterações"
          onSubmit={handleUpdate}
        />

        <div className="mt-6 border-t border-black/5 pt-6 dark:border-white/10">
          {deleteError ? (
            <p className="mb-3 text-sm text-red-600 dark:text-red-400">
              {deleteError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={`${secondaryButtonClass} text-red-600 dark:text-red-400`}
          >
            {deleting ? "Removendo..." : "Remover anúncio"}
          </button>
        </div>
      </div>
    </div>
  );
}
