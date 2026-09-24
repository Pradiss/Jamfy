import type { NextFunction, Request, Response } from "express";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);

  if (error instanceof Error) {
    return res.status(400).json({
      mensagem: error.message,
      message: error.message,
    });
  }

  return res.status(500).json({
    mensagem: "Erro interno do servidor.",
    message: "Erro interno do servidor.",
  });
}