"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import { inputClass } from "@/components/ui/form-field";
import { primaryButtonClass, containerClass } from "@/lib/ui";

export default function EsqueciSenhaPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível enviar o link agora.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`${containerClass} flex flex-1 flex-col items-center justify-center px-6 py-16`}
    >
      <div className="w-full max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Trocar senha</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Informe seu e-mail e enviaremos um link para você definir uma nova
        senha.
      </p>

      {sent ? (
        <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-500/10">
          Se esse e-mail estiver cadastrado, você vai receber um link para
          redefinir a senha em instantes. Confira também a caixa de spam.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              E-mail
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={user?.email ?? "seuemail@exemplo.com"}
              className={inputClass}
            />
          </label>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className={`mt-2 ${primaryButtonClass}`}
          >
            {submitting ? "Enviando..." : "Enviar link de redefinição"}
          </button>
        </form>
      )}
      </div>
    </div>
  );
}
