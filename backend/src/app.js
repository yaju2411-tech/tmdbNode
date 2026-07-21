import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import passport from "passport"

import "../src/config/passport.js";
import authRoutes from "../src/routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import cronRoutes from "./routes/cronRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import tmdbRoutes from "./routes/tmdbRoutes.js";
import helpRoutes from "./routes/helpRoutes.js";
import { errorHandler } from "./middleware/errorMiddlware.js";

const app = express();

// Security Middleware
app.use(helmet());

// Compress responses
app.use(compression());

// Request logger
app.use(morgan("dev"));

// Parse JSON
app.use(express.json());

// Parse Form Data
app.use(express.urlencoded({ extended: true }));

//for google oauth strtagies
app.use(passport.initialize());

// Parse Cookies
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TMDB Backend Running 🚀",
  });
});
//auth
app.use("/api/auth", authRoutes);
//payment
app.use("/api/payment", paymentRoutes);
//admin
app.use("/api/admin", adminRoutes);
//watchlist
app.use("/api/watchlist", watchlistRoutes);
//cron
app.use("/api/cron", cronRoutes);
//notifications
app.use("/api/notifications", notificationRoutes);
//tmdb proxy
app.use("/api/tmdb", tmdbRoutes);
//help center (public)
app.use("/api/help", helpRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

//for dont use error in all controller
app.use(errorHandler);

export default app;