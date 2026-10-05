"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { ArtistOnboarding } from "@/components/artist/artist-onboarding";
import { ContratanteDashboard } from "@/components/hiring/contratante-dashboard";
import { ReceivedHiringRequests } from "@/components/hiring/received-hiring-requests";
import { secondaryButtonClass } from "@/lib/ui";

function ArtistDashboard() {
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string | null>(null);
  const [tab, setTab] = useState<"recebidas" | "enviadas">("recebidas");

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

      <div className="mb-6 flex gap-1 rounded-full border border-black/10 p-1 text-sm font-medium dark:border-white/15">
        <button
          type="button"
          onClick={() => setTab("recebidas")}
          className={`flex-1 rounded-full px-4 py-2 transition ${
            tab === "recebidas"
              ? "bg-accent text-accent-foreground"
              : "text-zinc-600 hover:bg-black/[.03] dark:text-zinc-400 dark:hover:bg-white/[.06]"
          }`}
        >
          Recebidas
        </button>
        <button
          type="button"
          onClick={() => setTab("enviadas")}
          className={`flex-1 rounded-full px-4 py-2 transition ${
            tab === "enviadas"
              ? "bg-accent text-accent-foreground"
              : "text-zinc-600 hover:bg-black/[.03] dark:text-zinc-400 dark:hover:bg-white/[.06]"
          }`}
        >
          Enviadas
        </button>
      </div>

      {tab === "recebidas" ? (
        <ReceivedHiringRequests />
      ) : (
        <>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Além de receber solicitações no seu perfil, você também pode
            chamar outros músicos e bandas — as solicitações que você enviar
            aparecem aqui.
          </p>
          <ContratanteDashboard />
        </>
      )}
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
