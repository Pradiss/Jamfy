"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { containerClass } from "@/lib/ui";
import { isFooterlessRoute } from "@/lib/chromeless-routes";

export function Footer() {
  const pathname = usePathname();

  if (isFooterlessRoute(pathname)) {
    return null;
  }

  return (
    <footer className="border-t border-black/5 px-6 py-8 ">
      <div
        className={`${containerClass} flex flex-col items-center gap-3 text-center text-[13px] text-zinc-400 sm:flex-row sm:justify-between `}
      >
        <span>Jamfy — conectando artistas e contratantes.</span>
        <div className="flex items-center gap-4">
          <Link href="/termos" className="hover:text-zinc-600 ">
            Termos de Uso
          </Link>
          <Link
            href="/privacidade"
            className="hover:text-zinc-600 "
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
