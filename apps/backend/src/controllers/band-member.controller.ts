import type { Response } from "express";
import { bandMemberService } from "../services/band-member.service.js";
import { requireParam } from "../utils/require-param.js";
import type { AuthRequest } from "../types/auth-request.js";

class BandMemberController {
  async list(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const members = await bandMemberService.list(req.user.id);

    return res.status(200).json({
      integrantes: members,
    });
  }

  async create(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const member = await bandMemberService.create({
      userId: req.user.id,
      ...req.body,
    });

    return res.status(201).json({
      mensagem: "Integrante cadastrado com sucesso.",
      integrante: member,
    });
  }

  async update(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const member = await bandMemberService.update({
      userId: req.user.id,
      id: requireParam(req.params.id, "ID do integrante não informado."),
      ...req.body,
    });

    return res.status(200).json({
      mensagem: "Integrante atualizado com sucesso.",
      integrante: member,
    });
  }

  async delete(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    await bandMemberService.delete(
      req.user.id,
      requireParam(req.params.id, "ID do integrante não informado."),
    );

    return res.status(200).json({
      mensagem: "Integrante removido com sucesso.",
    });
  }
}

export const bandMemberController = new BandMemberController();
