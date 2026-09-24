import type { NextFunction, Response } from "express";
import { authService } from "../services/auth.service.js";
import type { AuthRequest } from "../types/auth-request.js";

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        message: "Access token not provided.",
      });
    }

    const user = await authService.getAuthenticatedUser(accessToken);

    req.user = user;

    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired access token.",
    });
  }
}