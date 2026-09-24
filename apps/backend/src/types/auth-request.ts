import type { Request } from "express";
import type { Prisma } from "../../generated/prisma/client.js";

export type AuthenticatedUser = Prisma.UsuarioGetPayload<{
  include: {
    perfilArtista: true;
    perfilContratante: true;
  };
}>;

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}