import { Router } from "express";

import { conversaController } from "../controllers/conversa.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  startConversaSchema,
  conversaIdSchema,
  sendMensagemSchema,
} from "@jamfy/shared";

const conversaRoutes: Router = Router();

conversaRoutes.use(authMiddleware);

conversaRoutes.post("/", validate(startConversaSchema), conversaController.start);

conversaRoutes.get("/", conversaController.list);

conversaRoutes.get(
  "/:id",
  validate(conversaIdSchema),
  conversaController.findById,
);

conversaRoutes.post(
  "/:id/mensagens",
  validate(sendMensagemSchema),
  conversaController.sendMessage,
);

conversaRoutes.patch(
  "/:id/accept",
  validate(conversaIdSchema),
  conversaController.accept,
);

conversaRoutes.patch(
  "/:id/decline",
  validate(conversaIdSchema),
  conversaController.decline,
);

export { conversaRoutes };
