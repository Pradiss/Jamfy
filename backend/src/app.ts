import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { authRoutes } from "./routes/auth.routes.js";
import { artistProfileRoutes  } from  "./routes/artist-profile.routes.js";
import { instrumentRoutes } from "./routes/instrument.routes.js";
import { artistFunctionRoutes } from "./routes/artist-function.routes.js";
import { artistInstrumentRoutes } from "./routes/artist-instrument.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { genreRoutes } from "./routes/genre.routes.js";
import { artistGenreRoutes } from "./routes/artist-genre.routes.js";
import { portfolioRoutes } from "./routes/portfolio.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_, res) => {
  return res.status(200).json({
    success: true,
    message: "API online",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/artist-profile", artistProfileRoutes);
app.use("/api/artist-profile/functions", artistFunctionRoutes);
app.use("/api/artist-profile/instruments", artistInstrumentRoutes);
app.use("/api/instruments",instrumentRoutes)
app.use("/api/artist-profile/genres", artistGenreRoutes);
app.use("/api/artist-profile/portfolio", portfolioRoutes);
app.use("/api/genre", genreRoutes);

app.use(errorMiddleware);

export { app };