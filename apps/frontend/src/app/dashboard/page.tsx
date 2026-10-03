"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { ArtistOnboarding } from "@/components/artist/artist-onboarding";
import { ContratanteDashboard } from "@/components/hiring/contratante-dashboard";
import { secondaryButtonClass } from "@/lib/ui";

function ArtistDashboard() {
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ slug: string }>("/api/artist-profile/me")
      .then((data) => setSlug(data.slug))
      .catch(() => setSlug(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-zinc-500 dark:text-zinc-400">Carregando...</p>;
  }

  if (!slug) {
    return <ArtistOnboarding />;
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link href={`/artistas/${slug}`} className={secondaryButtonClass}>
          Ver meu perfil
        </Link>
        <Link href="/perfil/editar" className={secondaryButtonClass}>
          Editar perfil
        </Link>
      </div>

      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Além de receber solicitações no seu perfil, você também pode chamar
        outros músicos e bandas — as solicitações que você enviar aparecem
        aqui.
      </p>

      <ContratanteDashboard />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.tipo === "MUSICO" || user.tipo === "BANDA") {
    return <ArtistDashboard />;
  }

  if (user.tipo === "CONTRATANTE") {
    return <ContratanteDashboard />;
  }

  return (
    <p className="text-zinc-500 dark:text-zinc-400">
      Este painel ainda não está disponível para o seu tipo de usuário.
    </p>
  );
}
