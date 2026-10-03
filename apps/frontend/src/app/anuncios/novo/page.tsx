"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  AnuncioForm,
  type AnuncioFormValues,
} from "@/components/anuncio/anuncio-form";
import { containerClass } from "@/lib/ui";

export default function NovoAnuncioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 dark:text-zinc-400">
        Carregando...
      </div>
    );
  }

  async function handleCreate(values: AnuncioFormValues) {
    const result = await apiFetch<{ anuncio: { id: string } }>(
      "/api/anuncios",
      {
        method: "POST",
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
      },
    );

    router.push(`/anuncios/${result.anuncio.id}`);
  }

  return (
    <div className={`${containerClass} flex-1 px-6 py-10`}>
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-7 text-3xl font-semibold tracking-tight">
          Criar anúncio
        </h1>

        <AnuncioForm submitLabel="Publicar anúncio" onSubmit={handleCreate} />
      </div>
    </div>
  );
}
