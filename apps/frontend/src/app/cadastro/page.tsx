"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Music, Users, Search, Mic2, PartyPopper } from "lucide-react";

import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AuthSplitLayout, type HeroCategory } from "@/components/auth/auth-split-layout";
import { FormField } from "@/components/ui/form-field";
import { PasswordField } from "@/components/ui/password-field";
import { formatBrazilPhone } from "@/lib/phone-mask";
import { primaryButtonClass } from "@/lib/ui";

const TIPO_OPTIONS = [
  {
    value: "MUSICO",
    label: "Músico(a)",
    description: "Toco sozinho(a)",
    Icon: Music,
  },
  {
    value: "BANDA",
    label: "Banda",
    description: "Temos vários integrantes",
    Icon: Users,
  },
  {
    value: "CONTRATANTE",
    label: "Contratante",
    description: "Quero contratar artistas",
    Icon: Search,
  },
] as const;

const HERO_CATEGORIES: HeroCategory[] = [
  {
    label: "Músicos",
    title: "Mostre seu talento.",
    subtitle: "Monte seu perfil e receba solicitações de shows direto aqui.",
    color: "#6366f1",
    Icon: Music,
  },
  {
    label: "Bandas",
    title: "Sua banda, visível pra quem contrata.",
    subtitle: "Agenda, integrantes e portfólio num perfil só.",
    color: "#8b5cf6",
    Icon: Users,
  },
  {
    label: "Contratantes",
    title: "Encontre o artista certo.",
    subtitle: "Busque por cidade, gênero e instrumento em minutos.",
    color: "#0ea5e9",
    Icon: Search,
  },
  {
    label: "Shows",
    title: "Toque mais. Contrate melhor.",
    subtitle: "Artistas encontram shows. Contratantes encontram talento.",
    color: "#f43f5e",
    Icon: Mic2,
  },
  {
    label: "Eventos",
    title: "Pra qualquer tipo de evento.",
    subtitle: "Casamentos, formaturas, aniversários e muito mais.",
    color: "#14b8a6",
    Icon: PartyPopper,
  },
];

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
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await apiFetch<{ requireEmailConfirmation: boolean }>(
        "/api/auth/register",
        { method: "POST", body: { name, email, password, phone, type } },
      );

      if (result.requireEmailConfirmation) {
        setCheckEmail(true);
        setSubmitting(false);
        return;
      }

      await refresh();

      const needsOnboarding = type === "MUSICO" || type === "BANDA";
      router.push(needsOnboarding ? "/dashboard" : "/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível concluir o cadastro.",
      );
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout categories={HERO_CATEGORIES}>
      <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
        Criar sua conta
      </h1>

      {checkEmail ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm dark:border-emerald-900 dark:bg-emerald-500/10">
          Enviamos um link de confirmação para o seu e-mail. Confirme para
          poder entrar.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Eu sou...
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {TIPO_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border px-2 py-4 text-center transition ${
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
                  <option.Icon className="h-5 w-5" strokeWidth={1.75} />
                  <span className="text-sm font-semibold">
                    {option.label}
                  </span>
                  <span
                    className={`text-[11px] leading-tight ${
                      type === option.value
                        ? "text-accent-foreground/80"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {option.description}
                  </span>
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
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <FormField
            label="Telefone"
            type="tel"
            inputMode="numeric"
            required
            minLength={14}
            maxLength={16}
            placeholder="(11) 91234-5678"
            value={phone}
            onChange={(event) =>
              setPhone(formatBrazilPhone(event.target.value))
            }
          />

          <PasswordField
            label="Senha"
            required
            minLength={8}
            value={password}
            onChange={setPassword}
          />

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className={`mt-1 w-full ${primaryButtonClass}`}
          >
            {submitting ? "Criando conta..." : "Criar conta"}
          </button>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            Ao criar uma conta, você concorda com os{" "}
            <Link
              href="/termos"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
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
      )}

      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-accent underline">
          Entrar
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
