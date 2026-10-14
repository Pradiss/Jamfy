"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import { secondaryButtonClass, cardClass, containerClass } from "@/lib/ui";

const TIPO_LABELS: Record<string, string> = {
  MUSICO: "Músico(a)",
  BANDA: "Banda",
  CONTRATANTE: "Contratante",
  ADMIN: "Administrador",
};

const SUPPORT_EMAIL = "suporte@jamfy.com.br";

export default function ConfiguracoesPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-zinc-500 ">
        Carregando...
      </div>
    );
  }

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  async function handleExportData() {
    setExporting(true);

    try {
      const result = await apiFetch<{ dados: unknown }>(
        "/api/auth/me/export",
      );
      const blob = new Blob([JSON.stringify(result.dados, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "jamfy-meus-dados.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // Nothing was downloaded — the button staying enabled lets them try again.
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);

    try {
      await apiFetch("/api/auth/me", { method: "DELETE" });
      await logout();
      router.push("/");
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível excluir a conta.",
      );
      setDeleting(false);
    }
  }

  return (
    <div className={`${containerClass} flex-1 px-6 py-10`}>
      <div className="mx-auto w-full max-w-md">
      <h1 className="mb-7 text-3xl font-semibold tracking-tight">
        Configurações
      </h1>

      <div className={`flex flex-col gap-1 p-5 ${cardClass}`}>
        <p className="text-xs font-medium text-zinc-500 ">
          Tipo de conta
        </p>
        <p className="text-sm">{TIPO_LABELS[user.tipo] ?? user.tipo}</p>
      </div>

      <div className={`mt-6 flex flex-col divide-y divide-black/5 p-1.5 ${cardClass} `}>
        <Link
          href="/perfil/editar"
          className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition hover:bg-black/[.03] "
        >
          Editar perfil
          <span className="text-zinc-400">›</span>
        </Link>
        <Link
          href="/esqueci-senha"
          className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition hover:bg-black/[.03] "
        >
          Trocar senha
          <span className="text-zinc-400">›</span>
        </Link>
      </div>

      <div className={`mt-6 p-5 ${cardClass}`}>
        <p className="mb-2 text-xs font-medium text-zinc-500 ">
          Suporte
        </p>
        <p className="mb-3 text-sm text-zinc-600 ">
          Encontrou um problema ou precisa de ajuda com sua conta?
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-sm font-medium text-accent hover:underline"
        >
          Falar com o suporte ↗
        </a>
      </div>

      <div className={`mt-6 p-5 ${cardClass}`}>
        <p className="mb-2 text-xs font-medium text-zinc-500 ">
          Privacidade e dados
        </p>
        <p className="mb-3 text-sm text-zinc-600 ">
          Baixe uma cópia de tudo que temos sobre sua conta, ou exclua sua
          conta e todos os seus dados permanentemente.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            className={`${secondaryButtonClass} disabled:opacity-50`}
          >
            {exporting ? "Preparando..." : "Exportar meus dados"}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 "
          >
            Excluir minha conta
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className={`mt-6 ${secondaryButtonClass}`}
      >
        Sair da conta
      </button>
      </div>

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl ">
            <h2 className="text-lg font-semibold tracking-tight">
              Excluir sua conta?
            </h2>
            <p className="mt-2 text-sm text-zinc-500 ">
              Isso apaga seu perfil, anúncios, portfólio, agenda, conversas e
              todo o resto permanentemente. Não é possível desfazer.
            </p>

            {deleteError ? (
              <p className="mt-3 text-sm text-red-600 ">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="w-full rounded-full bg-red-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Excluindo..." : "Sim, excluir permanentemente"}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm text-zinc-500 hover:underline disabled:opacity-50 "
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
