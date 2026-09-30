"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { TIPO_EVENTO_LABELS, type TipoEvento } from "@/lib/types";
import { inputClass } from "@/components/ui/form-field";
import { EstadoCidadeFields } from "@/components/ui/estado-cidade-fields";
import { primaryButtonClass, cardClass } from "@/lib/ui";

export function HiringRequestForm({
  artistId,
  artistUserId,
}: {
  artistId: string;
  artistUserId: string;
}) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [tipoEvento, setTipoEvento] = useState<TipoEvento | "">("");
  const [dataEvento, setDataEvento] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className={`mt-10 p-4 text-sm ${cardClass}`}>
        <Link href="/login" className="font-medium text-accent underline">
          Entre na sua conta
        </Link>{" "}
        para solicitar a contratação deste artista.
      </div>
    );
  }

  if (user.tipo !== "CONTRATANTE" || user.id === artistUserId) {
    return null;
  }

  if (sent) {
    return (
      <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm shadow-sm dark:border-emerald-900 dark:bg-emerald-500/10">
        Solicitação enviada! Acompanhe o status em{" "}
        <Link href="/dashboard" className="font-medium underline">
          Minhas solicitações
        </Link>
        .
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch("/api/hiring-requests", {
        method: "POST",
        body: {
          artistaId: artistId,
          descricao,
          tipoEvento: tipoEvento || undefined,
          dataEvento: dataEvento || undefined,
          cidade,
          estado: estado.toUpperCase(),
          orcamento: orcamento ? Number(orcamento) : undefined,
        },
      });

      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar a solicitação.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-10 ${primaryButtonClass}`}
      >
        Solicitar contratação
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-10 flex flex-col gap-4 p-5 ${cardClass}`}
    >
      <h3 className="font-semibold tracking-tight">Solicitar contratação</h3>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Descreva o evento
        </span>
        <textarea
          required
          minLength={10}
          rows={3}
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Tipo de evento
          </span>
          <select
            value={tipoEvento}
            onChange={(event) =>
              setTipoEvento(event.target.value as TipoEvento | "")
            }
            className={inputClass}
          >
            <option value="">Selecione</option>
            {Object.entries(TIPO_EVENTO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Data do evento
          </span>
          <input
            type="date"
            value={dataEvento}
            onChange={(event) => setDataEvento(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Cidade do evento
        </p>
        <EstadoCidadeFields
          state={estado}
          city={cidade}
          onStateChange={setEstado}
          onCityChange={setCidade}
        />
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Orçamento (R$, opcional)
        </span>
        <input
          type="number"
          min={0}
          value={orcamento}
          onChange={(event) => setOrcamento(event.target.value)}
          className={inputClass}
        />
      </label>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Enviando..." : "Enviar solicitação"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
