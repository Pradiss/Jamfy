import { Router } from "express";
import { artistProfileController } from "../controllers/artist-profile.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const artistProfileRoutes = Router();

artistProfileRoutes.use(authMiddleware);

artistProfileRoutes.post("/", artistProfileController.create);

artistProfileRoutes.get("/me", artistProfileController.me);

artistProfileRoutes.put("/", artistProfileController.update);

export { artistProfileRoutes };