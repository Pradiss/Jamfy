import { Router } from "express";

import { artistScheduleController } from "../controllers/artist-schedule.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createAgendaEntrySchema,
  updateAgendaEntrySchema,
  agendaIdSchema,
  agendaQuerySchema,
  publicAgendaParamsSchema,
} from "@jamfy/shared";

const artistScheduleRoutes: Router = Router();

artistScheduleRoutes.get(
  "/artist/:artistaId",
  validate(publicAgendaParamsSchema),
  artistScheduleController.listPublic,
);

artistScheduleRoutes.use(authMiddleware);

artistScheduleRoutes.get(
  "/me",
  validate(agendaQuerySchema),
  artistScheduleController.list,
);

artistScheduleRoutes.post(
  "/",
  validate(createAgendaEntrySchema),
  artistScheduleController.create,
);

artistScheduleRoutes.put(
  "/:id",
  validate(updateAgendaEntrySchema),
  artistScheduleController.update,
);

artistScheduleRoutes.delete(
  "/:id",
  validate(agendaIdSchema),
  artistScheduleController.delete,
);

export { artistScheduleRoutes };
