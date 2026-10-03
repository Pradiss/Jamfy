"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Music, Heart, GraduationCap, Cake, PartyPopper } from "lucide-react";

import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AuthSplitLayout, type HeroCategory } from "@/components/auth/auth-split-layout";
import { FormField } from "@/components/ui/form-field";
import { PasswordField } from "@/components/ui/password-field";
import { primaryButtonClass } from "@/lib/ui";
import type { AuthenticatedUser } from "@/lib/types";

const HERO_CATEGORIES: HeroCategory[] = [
  {
    label: "Shows",
    title: "O artista certo. Pro seu show.",
    subtitle: "Busque músicos e bandas e veja a agenda em tempo real.",
    color: "#6366f1",
    Icon: Music,
  },
  {
    label: "Casamentos",
    title: "A trilha sonora do seu casamento.",
    subtitle: "De cerimônia à pista de dança, encontre quem vai tocar.",
    color: "#f43f5e",
    Icon: Heart,
  },
  {
    label: "Formaturas",
    title: "Comemore a formatura com música ao vivo.",
    subtitle: "Bandas e DJs prontos pra fazer a festa da sua turma.",
    color: "#f59e0b",
    Icon: GraduationCap,
  },
  {
    label: "Aniversários",
    title: "Todo aniversário merece uma boa festa.",
    subtitle: "Contrate em minutos pro seu próximo grande dia.",
    color: "#fb923c",
    Icon: Cake,
  },
  {
    label: "Eventos",
    title: "Pra qualquer tipo de evento.",
    subtitle: "Corporativo, religioso, público ou privado — tem artista.",
    color: "#14b8a6",
    Icon: PartyPopper,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await apiFetch<{ user: AuthenticatedUser }>(
        "/api/auth/login",
        { method: "POST", body: { email, password } },
      );

      await refresh();

      const needsOnboarding =
        (result.user.tipo === "MUSICO" || result.user.tipo === "BANDA") &&
        !result.user.perfilArtista;

      router.push(needsOnboarding ? "/dashboard" : "/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível entrar.",
      );
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout categories={HERO_CATEGORIES}>
      <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
        Bem-vindo(a) de volta
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="E-mail"
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <PasswordField
          label="Senha"
          required
          value={password}
          onChange={setPassword}
        />

        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-black/20 text-accent focus:ring-accent/30 dark:border-white/20"
          />
          Manter conectado(a)
        </label>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className={`mt-1 w-full ${primaryButtonClass}`}
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2 text-sm">
        <Link href="/esqueci-senha" className="text-accent hover:underline">
          Esqueci minha senha
        </Link>
        <p className="text-zinc-500 dark:text-zinc-400">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-accent underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
