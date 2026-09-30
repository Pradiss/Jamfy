import express from "express";
import type { Express } from "express";
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
import { hiringRequestRoutes } from "./routes/hiring-request.routes.js";
import { artistScheduleRoutes } from "./routes/artist-schedule.routes.js";
import { bandMemberRoutes } from "./routes/band-member.routes.js";
import { notificationRoutes } from "./routes/notification.routes.js";
import { uploadRoutes } from "./routes/upload.routes.js";
import { functionRoutes } from "./routes/function.routes.js";
import { cidadeRoutes } from "./routes/cidade.routes.js";

const app: Express = express();

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

// Mounted before "/api/artist-profile" on purpose: that router has a
// public GET "/:slug" catch-all, which would otherwise swallow these
// more specific sub-resource paths (Express matches mounts in order).
app.use("/api/artist-profile/functions", artistFunctionRoutes);
app.use("/api/artist-profile/instruments", artistInstrumentRoutes);
app.use("/api/artist-profile/genres", artistGenreRoutes);
app.use("/api/artist-profile/portfolio", portfolioRoutes);
app.use("/api/artist-profile/agenda", artistScheduleRoutes);
app.use("/api/artist-profile/band-members", bandMemberRoutes);
app.use("/api/artist-profile", artistProfileRoutes);

app.use("/api/instruments", instrumentRoutes);
app.use("/api/genre", genreRoutes);
app.use("/api/functions", functionRoutes);
app.use("/api/cidades", cidadeRoutes);
app.use("/api/hiring-requests", hiringRequestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(errorMiddleware);

export { app };