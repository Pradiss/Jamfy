"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { EditProfileForm } from "@/components/account/edit-profile-form";
import { ArtistSettingsTabs } from "@/components/artist/artist-settings-tabs";
import { containerClass } from "@/lib/ui";

export default function EditarPerfilPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 dark:text-zinc-400">
        Carregando...
      </div>
    );
  }

  const isArtist = user.tipo === "MUSICO" || user.tipo === "BANDA";

  return (
    <div className={`${containerClass} flex-1 px-6 py-10`}>
      <h1 className="mb-7 text-3xl font-semibold tracking-tight">
        Editar perfil
      </h1>

      <div
        className={
          isArtist
            ? "grid grid-cols-1 gap-10 lg:grid-cols-2"
            : "mx-auto w-full max-w-md"
        }
      >
        <section>
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Conta
          </h2>
          <EditProfileForm user={user} />
        </section>

        {isArtist ? (
          <section>
            <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Perfil público de artista
            </h2>
            <ArtistSettingsTabs />
          </section>
        ) : null}
      </div>
    </div>
  );
}
