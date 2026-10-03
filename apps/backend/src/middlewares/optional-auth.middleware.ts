import type { NextFunction, Response } from "express";
import { authService } from "../services/auth.service.js";
import type { AuthRequest } from "../types/auth-request.js";

// Unlike authMiddleware, this never blocks the request — it just attaches
// req.user when a valid session cookie is present, for routes that are
// public but behave differently for logged-in visitors (e.g. revealing
// contact info only to authenticated users).
export async function optionalAuthMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return next();
  }

  try {
    req.user = await authService.getAuthenticatedUser(accessToken);
  } catch {
    // Invalid/expired token — treat as anonymous instead of failing.
  }

  return next();
}
