import type { AuthenticatedUser } from "./types";

export function profileHref(user: AuthenticatedUser) {
  if (user.tipo === "MUSICO" || user.tipo === "BANDA") {
    return user.perfilArtista
      ? `/artistas/${user.perfilArtista.slug}`
      : "/dashboard";
  }

  return "/dashboard";
}

export function profileLabel(user: AuthenticatedUser) {
  return user.tipo === "MUSICO" || user.tipo === "BANDA"
    ? "Meu perfil"
    : "Painel";
}
