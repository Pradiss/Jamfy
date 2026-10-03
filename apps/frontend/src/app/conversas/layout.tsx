"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ConversaSidebar } from "@/components/conversa/conversa-sidebar";
import { containerClass } from "@/lib/ui";

export default function ConversasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  // /conversas/[id] has an active thread — on mobile that fills the whole
  // screen and the sidebar is reached via a "Voltar" link instead, like a
  // typical two-pane inbox (Facebook Marketplace messages, Instagram DMs).
  const hasActiveThread = pathname !== "/conversas";

  return (
    <div
      className={`${containerClass} flex h-[calc(100dvh-7.75rem)] flex-col sm:h-[calc(100dvh-3.75rem)] sm:px-6 sm:py-6`}
    >
      <div className="flex min-h-0 flex-1 overflow-hidden border-black/5 sm:rounded-2xl sm:border sm:dark:border-white/10">
        <div
          className={`min-h-0 w-full shrink-0 flex-col border-black/5 dark:border-white/10 sm:flex sm:w-80 sm:border-r ${
            hasActiveThread ? "hidden sm:flex" : "flex"
          }`}
        >
          <ConversaSidebar
            activeId={hasActiveThread ? pathname.split("/").pop() : undefined}
          />
        </div>

        <div
          className={`min-h-0 min-w-0 flex-1 ${hasActiveThread ? "flex" : "hidden sm:flex"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
