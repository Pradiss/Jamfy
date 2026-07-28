import type { Request, Response } from "express";
import { portfolioService } from "../services/portfolio.service.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

class PortfolioController {
  async list(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const portfolio = await portfolioService.list(userId);

    return res.status(200).json({
      portfolio,
    });
  }

  async findById(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const portfolio = await portfolioService.findById({
      userId,
      id: req.params.id,
    });

    return res.status(200).json(portfolio);
  }

  async create(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const portfolio = await portfolioService.create({
      userId,
      ...req.body,
    });

    return res.status(201).json({
      mensagem: "Item do portfólio cadastrado com sucesso.",
      portfolio,
    });
  }

  async update(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const portfolio = await portfolioService.update({
      userId,
      portfolioId: req.params.id,
      ...req.body,
    });

    return res.status(200).json({
      mensagem: "Item do portfólio atualizado com sucesso.",
      portfolio,
    });
  }

  async delete(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    await portfolioService.delete({
      userId,
      id: req.params.id,
    });

    return res.status(200).json({
      mensagem: "Item do portfólio removido com sucesso.",
    });
  }

  async setHighlight(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const portfolio = await portfolioService.setHighlight({
      userId,
      id: req.params.id,
    });

    return res.status(200).json({
      mensagem: "Item definido como destaque com sucesso.",
      portfolio,
    });
  }
}

export const portfolioController = new PortfolioController();