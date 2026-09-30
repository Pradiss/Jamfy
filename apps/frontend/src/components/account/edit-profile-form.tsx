"use client";

import { useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { inputClass } from "@/components/ui/form-field";
import { primaryButtonClass, cardClass } from "@/lib/ui";
import type { AuthenticatedUser } from "@/lib/types";

export function EditProfileForm({ user }: { user: AuthenticatedUser }) {
  const { refresh } = useAuth();
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [telefone, setTelefone] = useState(user.telefone);
  const [whatsapp, setWhatsapp] = useState(user.whatsapp ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      await apiFetch("/api/auth/me", {
        method: "PATCH",
        body: {
          name: nome,
          email,
          phone: telefone,
          whatsapp: whatsapp.trim() || undefined,
        },
      });

      await refresh();
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

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 p-5 ${cardClass}`}
    >
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Editar perfil
      </p>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Nome
        </span>
        <input
          required
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          E-mail
        </span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Telefone
        </span>
        <input
          required
          value={telefone}
          onChange={(event) => setTelefone(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          WhatsApp (opcional)
        </span>
        <input
          value={whatsapp}
          onChange={(event) => setWhatsapp(event.target.value)}
          className={inputClass}
        />
      </label>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {success ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Perfil atualizado com sucesso.
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
