import type { Response } from "express";
import { hiringRequestService } from "../services/hiring-request.service.js";
import { requireParam } from "../utils/require-param.js";
import type { AuthRequest } from "../types/auth-request.js";

class HiringRequestController {
  async create(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const hiringRequest = await hiringRequestService.create({
      userId: req.user.id,
      ...req.body,
    });

    return res.status(201).json({
      mensagem: "Solicitação de contratação enviada com sucesso.",
      solicitacao: hiringRequest,
    });
  }

  async listSent(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const requests = await hiringRequestService.listSent(req.user.id);

    return res.status(200).json({
      solicitacoes: requests,
    });
  }

  async listReceived(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const requests = await hiringRequestService.listReceived(req.user.id);

    return res.status(200).json({
      solicitacoes: requests,
    });
  }

  async findById(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const hiringRequest = await hiringRequestService.findById(
      req.user.id,
      requireParam(req.params.id, "ID da solicitação não informado."),
    );

    return res.status(200).json(hiringRequest);
  }

  async accept(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const hiringRequest = await hiringRequestService.accept(
      req.user.id,
      requireParam(req.params.id, "ID da solicitação não informado."),
    );

    return res.status(200).json({
      mensagem: "Solicitação aceita com sucesso.",
      solicitacao: hiringRequest,
    });
  }

  async decline(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const hiringRequest = await hiringRequestService.decline(
      req.user.id,
      requireParam(req.params.id, "ID da solicitação não informado."),
    );

    return res.status(200).json({
      mensagem: "Solicitação recusada com sucesso.",
      solicitacao: hiringRequest,
    });
  }

  async cancel(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const hiringRequest = await hiringRequestService.cancel(
      req.user.id,
      requireParam(req.params.id, "ID da solicitação não informado."),
    );

    return res.status(200).json({
      mensagem: "Solicitação cancelada com sucesso.",
      solicitacao: hiringRequest,
    });
  }
}

export const hiringRequestController = new HiringRequestController();
