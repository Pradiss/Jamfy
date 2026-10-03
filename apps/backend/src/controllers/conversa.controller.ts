import type { Response } from "express";
import { conversaService } from "../services/conversa.service.js";
import { requireParam } from "../utils/require-param.js";
import type { AuthRequest } from "../types/auth-request.js";

class ConversaController {
  async start(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const conversa = await conversaService.startOrSend(req.user.id, req.body);

    return res.status(201).json({
      mensagem: "Mensagem enviada com sucesso.",
      conversa,
    });
  }

  async list(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const conversas = await conversaService.list(req.user.id);

    return res.status(200).json({ conversas });
  }

  async findById(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const conversa = await conversaService.findById(
      req.user.id,
      requireParam(req.params.id, "ID da conversa não informado."),
    );

    return res.status(200).json(conversa);
  }

  async sendMessage(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const novaMensagem = await conversaService.sendMessage(
      req.user.id,
      requireParam(req.params.id, "ID da conversa não informado."),
      req.body,
    );

    return res.status(201).json({ novaMensagem });
  }

  async accept(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const conversa = await conversaService.accept(
      req.user.id,
      requireParam(req.params.id, "ID da conversa não informado."),
    );

    return res.status(200).json({
      mensagem: "Conversa aceita com sucesso.",
      conversa,
    });
  }

  async decline(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const conversa = await conversaService.decline(
      req.user.id,
      requireParam(req.params.id, "ID da conversa não informado."),
    );

    return res.status(200).json({
      mensagem: "Conversa recusada com sucesso.",
      conversa,
    });
  }
}

export const conversaController = new ConversaController();
