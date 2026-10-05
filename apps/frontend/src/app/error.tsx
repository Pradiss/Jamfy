"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  containerClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className={`${containerClass} flex flex-1 flex-col items-center justify-center px-6 py-24 text-center`}
    >
      <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
        Ops
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Algo deu errado
      </h1>
      <p className="mt-3 max-w-md text-zinc-500 dark:text-zinc-400">
        Tente novamente — se o problema continuar, volte mais tarde.
      </p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className={primaryButtonClass}>
          Tentar de novo
        </button>
        <Link href="/" className={secondaryButtonClass}>
          Voltar para a home
        </Link>
      </div>
    </div>
  );
}
