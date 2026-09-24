import { Router } from "express";
import { instrumentController } from "../controllers/instrument.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middlewares.js";

const instrumentRoutes: Router = Router();

instrumentRoutes.get("/", instrumentController.list);
instrumentRoutes.get("/:id", instrumentController.findById);

instrumentRoutes.post(
  "/",
  authMiddleware,
  adminMiddleware,
  instrumentController.create,
);
instrumentRoutes.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  instrumentController.update,
);
instrumentRoutes.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  instrumentController.delete,
);

export { instrumentRoutes };