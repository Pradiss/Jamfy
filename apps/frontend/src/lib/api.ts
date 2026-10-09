import { API_URL } from "./config";

export type ApiFieldError = {
  field: string;
  message: string;
};

export class ApiError extends Error {
  status: number;
  errors?: ApiFieldError[];

  constructor(status: number, message: string, errors?: ApiFieldError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  // Only meaningful for GET calls made from server components reading
  // public data (home, artist/anuncio listings and details) — lets a page
  // opt into Next's fetch cache, e.g. `{ next: { revalidate: 60 } }`. Left
  // unset, nothing is cached, which is required for every client-side call
  // (those carry the session cookie and must always hit the backend fresh).
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
};

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const hasBody = options.body !== undefined;
  const isForm = isFormData(options.body);

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(hasBody && !isForm ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: hasBody
      ? isForm
        ? (options.body as FormData)
        : JSON.stringify(options.body)
      : undefined,
    credentials: "include",
    cache: options.cache,
    next: options.next,
  });

  const text = await response.text();
  let data: Record<string, unknown> | undefined;
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : undefined;
  } catch {
    // A non-JSON body (e.g. a platform-level error page while the backend
    // is cold-starting) — fall back to the generic message below instead
    // of throwing a confusing JSON parse error.
    data = undefined;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (data?.message as string | undefined) ??
        "Não foi possível completar a solicitação.",
      data?.errors as ApiFieldError[] | undefined,
    );
  }

  return data as T;
}
