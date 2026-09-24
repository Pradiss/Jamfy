import { Router } from "express";
import { artistProfileController } from "../controllers/artist-profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const artistProfileRoutes: Router = Router();

artistProfileRoutes.get("/", artistProfileController.list);

artistProfileRoutes.post("/", authMiddleware, artistProfileController.create);

artistProfileRoutes.get("/me", authMiddleware, artistProfileController.me);

artistProfileRoutes.put("/", authMiddleware, artistProfileController.update);

artistProfileRoutes.get("/:slug", artistProfileController.findBySlug);

export { artistProfileRoutes };
