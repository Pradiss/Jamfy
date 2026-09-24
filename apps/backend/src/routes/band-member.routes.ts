import { Router } from "express";

import { bandMemberController } from "../controllers/band-member.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createBandMemberSchema,
  updateBandMemberSchema,
  bandMemberIdSchema,
} from "@jamfy/shared";

const bandMemberRoutes: Router = Router();

bandMemberRoutes.use(authMiddleware);

bandMemberRoutes.get("/", bandMemberController.list);

bandMemberRoutes.post(
  "/",
  validate(createBandMemberSchema),
  bandMemberController.create,
);

bandMemberRoutes.put(
  "/:id",
  validate(updateBandMemberSchema),
  bandMemberController.update,
);

bandMemberRoutes.delete(
  "/:id",
  validate(bandMemberIdSchema),
  bandMemberController.delete,
);

export { bandMemberRoutes };
