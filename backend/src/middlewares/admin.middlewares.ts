import type { NextFunction, Response } from "express";

import { TipoUsuario } from "../../generated/prisma/client.js";
import type { AuthRequest } from "../types/auth-request.js";

export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({
      message: "Usuário não autenticado.",
    });
  }

  if (req.user.tipo !== TipoUsuario.ADMIN) {
    return res.status(403).json({
      message: "Acesso permitido somente para administradores.",
    });
  }

  return next();
}