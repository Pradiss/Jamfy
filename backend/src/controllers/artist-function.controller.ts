import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { artistFunctionService } from "../services/artist-function.service.js";

import type {
  RemoveArtistFunctionParams,
  SaveArtistFunctionsInput,
} from "../validations/artist-function.validation.js";

interface AuthenticatedUser {
  id: string;
}

type AuthenticatedRequest<
  Params = Record<string, string>,
  Body = unknown,
> = Request<Params, unknown, Body> & {
  user?: AuthenticatedUser;
};

class ArtistFunctionController {
  async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const functions =
        await artistFunctionService.list(userId);

      return res.status(200).json({
        funcoes: functions,
      });
    } catch (error) {
      next(error);
    }
  }

  async save(
    req: AuthenticatedRequest<
      Record<string, string>,
      SaveArtistFunctionsInput
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const functions =
        await artistFunctionService.save(
          userId,
          req.body,
        );

      return res.status(200).json({
        mensagem:
          "Funções artísticas salvas com sucesso.",
        funcoes: functions,
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(
    req: AuthenticatedRequest<
      RemoveArtistFunctionParams
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("Usuário não autenticado.");
      }

      const result =
        await artistFunctionService.remove(
          userId,
          req.params.functionId,
        );

      return res.status(200).json({
        mensagem: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const artistFunctionController =
  new ArtistFunctionController();