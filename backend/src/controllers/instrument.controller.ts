import type { NextFunction, Request, Response } from "express";
import { instrumentService } from "../services/instrument.service.js";

import {
  createInstrumentSchema,
  updateInstrumentSchema,
} from "../validations/instrument.validation.js";

class InstrumentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const instruments = await instrumentService.list();

      return res.status(200).json(instruments);
    } catch (error) {
      return next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("ID do instrumento não informado");
      }

      const instrument = await instrumentService.findById(id);
      return res.status(200).json(instrument);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createInstrumentSchema.parse(req.body);

      const instrument = await instrumentService.create(data);
      return res.status(201).json(instrument);
    } catch (error) {
      return next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Id do instrumento não informado.");
      }
      const data = updateInstrumentSchema.parse(req.body);

      const instrument = await instrumentService.update(id, data);

      return res.status(200).json(instrument);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if(!id){
        throw new Error("ID do instrumento não informado.")
      }

      const result = await instrumentService.delete(id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const instrumentController = new InstrumentController();
