import axios from "axios";
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

export const httpClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  try {
    const response = await httpClient.request<T>({
      url: path,
      method: options.method ?? "GET",
      data: options.body,
      headers: options.headers,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as
        | { message?: string; errors?: ApiFieldError[] }
        | undefined;

      throw new ApiError(
        error.response?.status ?? 0,
        data?.message ?? "Não foi possível completar a solicitação.",
        data?.errors,
      );
    }

    throw error;
  }
}
