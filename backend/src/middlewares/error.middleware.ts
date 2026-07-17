import type { NextFunction, Request, Response } from "express";

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error);

  if (error instanceof Error) {
    return res.status(400).json({
      mensagem: error.message,
    });
  }

  return res.status(500).json({
    mensagem: "Erro interno do servidor.",
  });
}