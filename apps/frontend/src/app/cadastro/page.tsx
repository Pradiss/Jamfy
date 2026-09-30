"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { FormField } from "@/components/ui/form-field";
import { primaryButtonClass, containerClass } from "@/lib/ui";

const TIPO_OPTIONS = [
  { value: "MUSICO", label: "Sou músico(a) solo" },
  { value: "BANDA", label: "Sou uma banda" },
  { value: "CONTRATANTE", label: "Quero contratar artistas" },
] as const;

export default function CadastroPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] =
    useState<(typeof TIPO_OPTIONS)[number]["value"]>("MUSICO");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: { name, email, password, phone, type },
      });

      await refresh();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível concluir o cadastro.",
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
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">
        Criar conta
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Eu sou...
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            {TIPO_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm transition ${
                  type === option.value
                    ? "border-accent bg-accent text-accent-foreground shadow-sm"
                    : "border-black/10 hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={type === option.value}
                  onChange={() => setType(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <FormField
          label="Nome"
          required
          minLength={3}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <FormField
          label="E-mail"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <FormField
          label="Telefone"
          type="tel"
          required
          minLength={10}
          placeholder="(11) 91234-5678"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />

        <FormField
          label="Senha"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className={`mt-2 ${primaryButtonClass}`}
        >
          {submitting ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Ao criar uma conta, você concorda com os{" "}
          <Link href="/termos" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link
            href="/privacidade"
            className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Política de Privacidade
          </Link>{" "}
          do Jamfy.
        </p>
      </form>

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-accent underline">
          Entrar
        </Link>
      </p>
      </div>
    </div>
  );
}
