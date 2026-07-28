import { Router } from "express";
import { genreController } from "../controllers/genre.controllers.js";


const genreRoutes = Router();



genreRoutes.get("/", genreController.list);
genreRoutes.get("/:id", genreController.findById);



genreRoutes.post("/", genreController.create);
genreRoutes.put("/:id", genreController.update);
genreRoutes.delete("/:id", genreController.delete);

export { genreRoutes };