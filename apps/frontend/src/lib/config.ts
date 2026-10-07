// In the browser, calls go through this same origin's "/api/*" rewrite
// (see next.config.ts) instead of the backend's own domain directly — a
// relative path keeps the request same-site, which Safari/iOS requires to
// actually persist the session cookie. Server-side rendering has no
// browser/cookie to protect and no page origin to resolve a relative path
// against, so it talks to the backend directly.
export const API_URL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002")
    : "";

// Set NEXT_PUBLIC_SITE_URL once the production domain is defined.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
