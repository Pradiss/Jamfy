import { Router } from "express";
import { artistGenreController } from "../controllers/artist-genre.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { saveArtistGenresSchema } from "../validations/artist-genre.validation.js";

const artistGenreRoutes = Router();

artistGenreRoutes.use(authMiddleware);

artistGenreRoutes.get("/", artistGenreController.list);

artistGenreRoutes.put(
  "/",
  validate(saveArtistGenresSchema),
  artistGenreController.save,
);

export { artistGenreRoutes };