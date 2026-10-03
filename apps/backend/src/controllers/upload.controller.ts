import type { Response } from "express";
import { uploadService } from "../services/upload.service.js";
import type { AuthRequest } from "../types/auth-request.js";

class UploadController {
  async avatar(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }

    const url = await uploadService.uploadAvatar(
      req.user.id,
      req.file.buffer,
      req.file.mimetype,
    );

    return res.status(200).json({
      mensagem: "Foto de perfil atualizada com sucesso.",
      url,
    });
  }

  async cover(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }

    const url = await uploadService.uploadCover(
      req.user.id,
      req.file.buffer,
      req.file.mimetype,
    );

    return res.status(200).json({
      mensagem: "Foto de capa atualizada com sucesso.",
      url,
    });
  }

  async anuncioPhoto(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }

    const url = await uploadService.uploadAnuncioPhoto(
      req.user.id,
      req.file.buffer,
      req.file.mimetype,
    );

    return res.status(200).json({
      mensagem: "Foto enviada com sucesso.",
      url,
    });
  }
}

export const uploadController = new UploadController();
