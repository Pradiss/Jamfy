"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { apiFetch, ApiError } from "@/lib/api";
import { FormField, inputClass } from "@/components/ui/form-field";
import { EstadoCidadeFields } from "@/components/ui/estado-cidade-fields";
import { primaryButtonClass } from "@/lib/ui";
import type { TipoAnuncio } from "@/lib/types";
import { TIPO_ANUNCIO_LABELS } from "@/lib/types";

export type AnuncioFormValues = {
  tipo: TipoAnuncio;
  titulo: string;
  descricao: string;
  categoria: string;
  preco: string;
  cidade: string;
  estado: string;
  fotos: string[];
};

type AnuncioFormProps = {
  initialValues?: Partial<AnuncioFormValues>;
  submitLabel: string;
  onSubmit: (values: AnuncioFormValues) => Promise<void>;
};

const EMPTY_VALUES: AnuncioFormValues = {
  tipo: "VENDA",
  titulo: "",
  descricao: "",
  categoria: "",
  preco: "",
  cidade: "",
  estado: "",
  fotos: [],
};

const CATEGORIA_SUGESTOES = [
  "Violão",
  "Guitarra",
  "Baixo",
  "Bateria",
  "Teclado",
  "Amplificador",
  "Caixa de som",
  "Microfone",
  "Pedal/Efeito",
  "Outro",
];

const MAX_FOTOS = 8;

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7" />
    </svg>
  );
}

export function AnuncioForm({
  initialValues,
  submitLabel,
  onSubmit,
}: AnuncioFormProps) {
  const [values, setValues] = useState<AnuncioFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof AnuncioFormValues>(
    key: K,
    value: AnuncioFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await apiFetch<{ url: string }>(
        "/api/uploads/anuncio-photo",
        { method: "POST", body: formData },
      );

      update("fotos", [...values.fotos, result.url]);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar a foto agora.",
      );
    } finally {
      setUploading(false);
    }
  }

  function removeFoto(url: string) {
    update(
      "fotos",
      values.fotos.filter((foto) => foto !== url),
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit(values);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível salvar.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          O que você quer fazer?
        </p>
        <div className="flex gap-2">
          {(Object.keys(TIPO_ANUNCIO_LABELS) as TipoAnuncio[]).map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => update("tipo", tipo)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                values.tipo === tipo
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-black/10 hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
              }`}
            >
              {TIPO_ANUNCIO_LABELS[tipo]}
            </button>
          ))}
        </div>
      </div>

      <FormField
        label="Título do anúncio"
        required
        value={values.titulo}
        onChange={(event) => update("titulo", event.target.value)}
        placeholder="Ex: Violão Yamaha NX em ótimo estado"
      />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Categoria
        </span>
        <input
          required
          list="categoria-sugestoes"
          value={values.categoria}
          onChange={(event) => update("categoria", event.target.value)}
          placeholder="Ex: Violão"
          className={inputClass}
        />
        <datalist id="categoria-sugestoes">
          {CATEGORIA_SUGESTOES.map((categoria) => (
            <option key={categoria} value={categoria} />
          ))}
        </datalist>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Descrição
        </span>
        <textarea
          required
          rows={4}
          minLength={10}
          value={values.descricao}
          onChange={(event) => update("descricao", event.target.value)}
          className={inputClass}
        />
      </label>

      <FormField
        label="Preço (R$, deixe em branco se for a combinar)"
        type="number"
        min={0}
        value={values.preco}
        onChange={(event) => update("preco", event.target.value)}
      />

      <EstadoCidadeFields
        state={values.estado}
        city={values.cidade}
        onStateChange={(value) => update("estado", value)}
        onCityChange={(value) => update("cidade", value)}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Fotos ({values.fotos.length}/{MAX_FOTOS})
        </p>
        <div className="flex flex-wrap gap-3">
          {values.fotos.map((foto) => (
            <div
              key={foto}
              className="relative h-24 w-24 overflow-hidden rounded-xl bg-surface"
            >
              <Image src={foto} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeFoto(foto)}
                aria-label="Remover foto"
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <TrashIcon />
              </button>
            </div>
          ))}

          {values.fotos.length < MAX_FOTOS ? (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-black/15 text-sm text-zinc-500 transition hover:bg-black/[.03] disabled:opacity-50 dark:border-white/20 dark:text-zinc-400 dark:hover:bg-white/[.06]"
              >
                {uploading ? "..." : "+ Foto"}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || uploading}
        className={`self-start ${primaryButtonClass}`}
      >
        {submitting ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
