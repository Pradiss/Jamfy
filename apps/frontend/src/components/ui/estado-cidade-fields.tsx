"use client";

import { useEffect, useState } from "react";
import { ESTADOS_BRASIL } from "@jamfy/shared";
import { apiFetch } from "@/lib/api";
import { inputClass } from "@/components/ui/form-field";

type Cidade = { id: string; nome: string; uf: string };

export function EstadoCidadeFields({
  state,
  city,
  onStateChange,
  onCityChange,
  required = true,
}: {
  state: string;
  city: string;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  required?: boolean;
}) {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state) {
      Promise.resolve().then(() => setCidades([]));
      return;
    }

    Promise.resolve().then(() => setLoading(true));

    apiFetch<Cidade[]>(`/api/cidades?uf=${state}`)
      .then((data) => setCidades(data))
      .catch(() => setCidades([]))
      .finally(() => setLoading(false));
  }, [state]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Estado
        </span>
        <select
          required={required}
          value={state}
          onChange={(event) => {
            onStateChange(event.target.value);
            onCityChange("");
          }}
          className={inputClass}
        >
          <option value="">UF</option>
          {ESTADOS_BRASIL.map((estado) => (
            <option key={estado.sigla} value={estado.sigla}>
              {estado.sigla}
            </option>
          ))}
        </select>
      </label>

      <div className="col-span-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Cidade
          </span>
          <select
            required={required}
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            disabled={!state || loading}
            className={`${inputClass} disabled:opacity-50`}
          >
            <option value="">
              {!state
                ? "Selecione o estado primeiro"
                : loading
                  ? "Carregando..."
                  : "Selecione a cidade"}
            </option>
            {cidades.map((cidade) => (
              <option key={cidade.id} value={cidade.nome}>
                {cidade.nome}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
