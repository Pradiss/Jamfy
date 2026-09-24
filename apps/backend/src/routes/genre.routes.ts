import { Router } from "express";
import { genreController } from "../controllers/genre.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middlewares.js";

const genreRoutes: Router = Router();

genreRoutes.get("/", genreController.list);
genreRoutes.get("/:id", genreController.findById);

genreRoutes.post("/", authMiddleware, adminMiddleware, genreController.create);
genreRoutes.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  genreController.update,
);
genreRoutes.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  genreController.delete,
);

export { genreRoutes };