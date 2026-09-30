import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import type { AuthRequest } from "../types/auth-request.js";
import { setAuthCookies, clearAuthCookies } from "../config/auth-cookies.js";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Internal server error.",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);

      setAuthCookies(
        res,
        result.accessToken,
        result.refreshToken,
        result.expiresIn,
      );

      return res.status(200).json({
        user: result.user,
        expiresAt: result.expiresAt,
      });
    } catch {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }
  }

  async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    return res.status(200).json({
      user: req.user,
    });
  }

  async updateProfile(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    try {
      const user = await authService.updateProfile({
        userId: req.user.id,
        ...req.body,
      });

      return res.status(200).json({
        mensagem: "Perfil atualizado com sucesso.",
        message: "Perfil atualizado com sucesso.",
        user,
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Internal server error.",
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      await authService.forgotPassword(req.body.email);

      const message =
        "Se o e-mail informado existir, enviamos um link para redefinir a senha.";

      return res.status(200).json({
        mensagem: message,
        message,
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Internal server error.",
      });
    }
  }

  async logout(_req: Request, res: Response) {
    clearAuthCookies(res);

    return res.status(200).json({
      message: "Logout sucessful.",
    });
  }

  async refresh(req: Request, res: Response) {
    try{
      const refreshToken = req.cookies?.refreshToken;

      if(!refreshToken){
        return res.status(401).json({
          message: "Refresh token not provided.",
        })
      }

      const result = await authService.refreshSession(refreshToken);

      setAuthCookies(
        res,
        result.accessToken,
        result.refreshToken,
        result.expiresIn,
      );

      return res.status(200).json({
        message: "Session Refreshed Successfully",
        expiresAt: result.expiresAt,
      });


    }catch(error){
      clearAuthCookies(res);

      return res.status(401).json({
        message: "Invalid or expired refresh token.",
      })
    }
  }
}

export const authController = new AuthController();
