import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Response } from "express";

import { authMiddleware } from "./auth.middleware.js";
import { authService } from "../services/auth.service.js";
import type { AuthRequest } from "../types/auth-request.js";

vi.mock("../services/auth.service.js", () => ({
  authService: {
    getAuthenticatedUser: vi.fn(),
  },
}));

function mockResponse() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("authMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects with 401 when no accessToken cookie is present", async () => {
    const req = { cookies: {} } as unknown as AuthRequest;
    const res = mockResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(authService.getAuthenticatedUser).not.toHaveBeenCalled();
  });

  it("rejects with 401 when the token is invalid or expired", async () => {
    vi.mocked(authService.getAuthenticatedUser).mockRejectedValue(
      new Error("Invalid or expired access token."),
    );

    const req = { cookies: { accessToken: "bad-token" } } as unknown as AuthRequest;
    const res = mockResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the user and calls next() when the token is valid", async () => {
    const user = { id: "user-1" } as Awaited<
      ReturnType<typeof authService.getAuthenticatedUser>
    >;
    vi.mocked(authService.getAuthenticatedUser).mockResolvedValue(user);

    const req = { cookies: { accessToken: "good-token" } } as unknown as AuthRequest;
    const res = mockResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
