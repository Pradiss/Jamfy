"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { FormField, inputClass } from "@/components/ui/form-field";
import { primaryButtonClass } from "@/lib/ui";

export type ArtistProfileFormValues = {
  artisticName: string;
  city: string;
  state: string;
  biography: string;
  fee: string;
  available: boolean;
  acceptsTravel: boolean;
};

type ArtistProfileFormProps = {
  initialValues?: Partial<ArtistProfileFormValues>;
  submitLabel: string;
  onSubmit: (values: ArtistProfileFormValues) => Promise<void>;
  onCancel?: () => void;
};

const EMPTY_VALUES: ArtistProfileFormValues = {
  artisticName: "",
  city: "",
  state: "",
  biography: "",
  fee: "",
  available: true,
  acceptsTravel: false,
};

export function ArtistProfileForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ArtistProfileFormProps) {
  const [values, setValues] = useState<ArtistProfileFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ArtistProfileFormValues>(
    key: K,
    value: ArtistProfileFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
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
      <FormField
        label="Nome artístico"
        required
        value={values.artisticName}
        onChange={(event) => update("artisticName", event.target.value)}
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <FormField
            label="Cidade"
            required
            value={values.city}
            onChange={(event) => update("city", event.target.value)}
          />
        </div>
        <FormField
          label="Estado (UF)"
          required
          maxLength={2}
          value={values.state}
          onChange={(event) =>
            update("state", event.target.value.toUpperCase())
          }
        />
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Biografia
        </span>
        <textarea
          rows={4}
          value={values.biography}
          onChange={(event) => update("biography", event.target.value)}
          className={inputClass}
        />
      </label>

      <FormField
        label="Cachê (R$)"
        type="number"
        min={0}
        value={values.fee}
        onChange={(event) => update("fee", event.target.value)}
      />

      <div className="flex flex-wrap gap-6 text-sm text-zinc-700 dark:text-zinc-300">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.available}
            onChange={(event) => update("available", event.target.checked)}
            className="accent-accent"
          />
          Disponível para contratação
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.acceptsTravel}
            onChange={(event) =>
              update("acceptsTravel", event.target.checked)
            }
            className="accent-accent"
          />
          Aceita viajar
        </label>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Salvando..." : submitLabel}
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
