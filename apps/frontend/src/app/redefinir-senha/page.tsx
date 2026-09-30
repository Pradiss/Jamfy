"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { inputClass } from "@/components/ui/form-field";
import { primaryButtonClass, containerClass } from "@/lib/ui";

export default function RedefinirSenhaPage() {
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        setInvalid(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("A confirmação não bate com a nova senha.");
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabaseBrowser.auth.updateUser({
      password: newPassword,
    });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabaseBrowser.auth.signOut();
    setSuccess(true);
  }

  if (success) {
    return (
      <div
        className={`${containerClass} flex flex-1 flex-col items-center justify-center px-6 py-16 text-center`}
      >
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight">
            Senha atualizada!
          </h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Agora é só entrar com a sua nova senha.
          </p>
          <Link href="/login" className={`mt-6 ${primaryButtonClass}`}>
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  if (invalid) {
    return (
      <div
        className={`${containerClass} flex flex-1 flex-col items-center justify-center px-6 py-16 text-center`}
      >
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight">
            Link inválido ou expirado
          </h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Solicite um novo link de redefinição de senha.
          </p>
          <Link href="/esqueci-senha" className={`mt-6 ${primaryButtonClass}`}>
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 dark:text-zinc-400">
        Carregando...
      </div>
    );
  }

  return (
    <div
      className={`${containerClass} flex flex-1 flex-col items-center justify-center px-6 py-16`}
    >
      <div className="w-full max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">
        Defina sua nova senha
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Nova senha
          </span>
          <input
            required
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Confirmar nova senha
          </span>
          <input
            required
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          {submitting ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
      </div>
    </div>
  );
}
