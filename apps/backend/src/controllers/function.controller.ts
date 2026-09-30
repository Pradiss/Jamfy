import type { Request, Response, NextFunction } from "express";
import { functionService } from "../services/function.service.js";

class FunctionController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const functions = await functionService.list();

      return res.status(200).json(functions);
    } catch (error) {
      return next(error);
    }
  }
}

export const functionController = new FunctionController();
