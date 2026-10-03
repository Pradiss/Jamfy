"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { inputClass } from "@/components/ui/form-field";
import { EstadoCidadeFields } from "@/components/ui/estado-cidade-fields";
import { primaryButtonClass, cardClass } from "@/lib/ui";

type ContratanteProfile = {
  nomeResponsavel: string | null;
  nomeEmpresa: string | null;
  cidade: string | null;
  estado: string | null;
} | null;

export function ContratanteProfileForm() {
  const [loading, setLoading] = useState(true);
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch<ContratanteProfile>("/api/contratante-profile/me")
      .then((data) => {
        if (!data) return;
        setNomeResponsavel(data.nomeResponsavel ?? "");
        setNomeEmpresa(data.nomeEmpresa ?? "");
        setCidade(data.cidade ?? "");
        setEstado(data.estado ?? "");
      })
      .catch(() => {
        // No profile yet — keep the blank form, user is creating it now.
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      await apiFetch("/api/contratante-profile", {
        method: "PUT",
        body: {
          nomeResponsavel: nomeResponsavel.trim() || undefined,
          nomeEmpresa: nomeEmpresa.trim() || undefined,
          cidade: cidade.trim() || undefined,
          estado: estado.trim() || undefined,
        },
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar agora.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Carregando...
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 p-5 ${cardClass}`}
    >
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Dados de quem contrata
      </p>
      <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Essas informações ajudam o artista a saber quem está chamando —
        aparecem pra ele quando você envia uma solicitação.
      </p>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Nome do responsável (opcional)
        </span>
        <input
          value={nomeResponsavel}
          onChange={(event) => setNomeResponsavel(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Empresa (opcional)
        </span>
        <input
          value={nomeEmpresa}
          onChange={(event) => setNomeEmpresa(event.target.value)}
          placeholder="Deixe em branco se for pessoa física"
          className={inputClass}
        />
      </label>

      <EstadoCidadeFields
        state={estado}
        city={cidade}
        onStateChange={setEstado}
        onCityChange={setCidade}
        required={false}
      />

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {success ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Dados atualizados com sucesso.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className={`${primaryButtonClass} self-start`}
      >
        {submitting ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
