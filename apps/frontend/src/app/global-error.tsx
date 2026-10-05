"use client";

import { useEffect } from "react";

// Only used when the ROOT layout itself crashes — it replaces the whole
// document, so it can't rely on the app's providers, fonts or Tailwind
// build output and must bring its own <html>/<body>. Kept deliberately
// plain (inline styles only) so it still renders even if something in the
// normal styling pipeline is what broke.
export default function GlobalError({
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
    <html lang="pt-BR">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#e9e8e1",
          color: "#1d1d1f",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: "#4f46e5" }}>
          Ops
        </p>
        <h1 style={{ marginTop: 12, fontSize: 28, fontWeight: 600 }}>
          Algo deu muito errado
        </h1>
        <p style={{ marginTop: 12, maxWidth: 420, color: "#71717a" }}>
          Recarregue a página — se o problema continuar, volte mais tarde.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 24,
            borderRadius: 9999,
            background: "#4f46e5",
            color: "#fff",
            padding: "10px 24px",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
