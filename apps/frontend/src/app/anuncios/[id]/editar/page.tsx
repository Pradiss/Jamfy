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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    apiFetch<AnuncioDetail>(`/api/anuncios/${params.id}`)
      .then((data) => {
        setAnuncio(data);
        setNotFound(false);
        setLoadError(null);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
          setLoadError(null);
        } else {
          setLoadError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar o anúncio agora.",
          );
          setNotFound(false);
        }
      });
  }, [params.id, reloadKey]);

  if (loading || !user || (!anuncio && !notFound && !loadError)) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 ">
        Carregando...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 ">
        Anúncio não encontrado.
      </div>
    );
  }

  if (loadError || !anuncio) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center text-zinc-500 ">
        <p>{loadError ?? "Não foi possível carregar o anúncio agora."}</p>
        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="text-sm font-medium text-accent hover:underline"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (anuncio.usuarioId !== user.id) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 ">
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

        <div className="mt-6 border-t border-black/5 pt-6 ">
          {deleteError ? (
            <p className="mb-3 text-sm text-red-600 ">
              {deleteError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={`${secondaryButtonClass} text-red-600 `}
          >
            {deleting ? "Removendo..." : "Remover anúncio"}
          </button>
        </div>
      </div>
    </div>
  );
}
