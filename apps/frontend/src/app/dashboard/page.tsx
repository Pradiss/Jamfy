"use client";

import { useAuth } from "@/lib/auth-context";
import { ArtistOnboarding } from "@/components/artist/artist-onboarding";
import { ContratanteDashboard } from "@/components/hiring/contratante-dashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.tipo === "MUSICO" || user.tipo === "BANDA") {
    return <ArtistOnboarding />;
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
