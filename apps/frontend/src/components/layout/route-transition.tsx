"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isChromelessRoute } from "@/lib/chromeless-routes";

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Chromeless routes (the login/signup split-screen) render edge to edge —
  // the bottom padding elsewhere reserves space for the mobile tab bar,
  // which doesn't show on these routes.
  const bottomPadding = isChromelessRoute(pathname) ? "" : "pb-16 sm:pb-0";

  return (
    <div
      key={pathname}
      className={`flex flex-1 flex-col animate-page-in ${bottomPadding}`}
    >
      {children}
    </div>
  );
}
