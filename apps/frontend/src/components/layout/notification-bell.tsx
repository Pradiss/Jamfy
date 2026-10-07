"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Notification, NotificationListResponse } from "@/lib/types";

const POLL_INTERVAL_MS = 30_000;

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M6 8a6 6 0 1 1 12 0c0 3.4 1 5.3 1.6 6.2a1 1 0 0 1-.8 1.6H5.2a1 1 0 0 1-.8-1.6C5 13.3 6 11.4 6 8Z" />
      <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<NotificationListResponse>(
        "/api/notifications?limit=8",
      );
      setNotifications(data.notificacoes);
      setUnreadCount(data.naoLidas);
    } catch {
      // Silently ignore — the bell just stays as-is until the next poll.
    }
  }, []);

  useEffect(() => {
    let active = true;

    apiFetch<NotificationListResponse>("/api/notifications?limit=8")
      .then((data) => {
        if (active) {
          setNotifications(data.notificacoes);
          setUnreadCount(data.naoLidas);
        }
      })
      .catch(() => {
        // Silently ignore — the bell just stays as-is until the next poll.
      });

    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [load]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAsRead(id: string) {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, lida: true } : item)),
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      load();
    }
  }

  function handleNotificationClick(notification: Notification) {
    setOpen(false);
    markAsRead(notification.id);

    if (notification.conversaId) {
      router.push(`/conversas/${notification.conversaId}`);
    } else if (notification.solicitacaoId) {
      router.push("/dashboard");
    }
  }

  async function markAllAsRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, lida: true })),
    );
    setUnreadCount(0);

    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
    } catch {
      load();
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notificações"
        className="relative flex items-center justify-center rounded-full p-2 text-zinc-600 transition hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white ring-2 ring-white dark:ring-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="fixed inset-x-4 top-16 z-10 rounded-2xl border border-black/5 bg-white/95 p-2 shadow-xl backdrop-blur-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-80 dark:border-white/10 dark:bg-zinc-900/95"
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold tracking-tight">
              Notificações
            </span>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-accent hover:underline"
              >
                Marcar todas como lidas
              </button>
            ) : null}
          </div>

          {notifications.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-black/[.04] dark:hover:bg-white/[.06] ${
                      notification.lida ? "opacity-60" : ""
                    }`}
                  >
                    <p className="font-medium">{notification.titulo}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {notification.mensagem}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
