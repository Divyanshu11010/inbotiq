import express from "express";
import dotenv from "dotenv";

// Load environment variables early
dotenv.config();
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middlewares/error.middleware.js";

const app = express();

// Fail fast if critical secrets are missing
if (!process.env.ACCESS_TOKEN_SECRET) {
  // eslint-disable-next-line no-console
  console.error('Missing required env: ACCESS_TOKEN_SECRET');
  throw new Error('ACCESS_TOKEN_SECRET is not set in environment');
}

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Use Vite's default port as fallback
const FRONTEND_ORIGINS =
  process.env.FRONTEND_ORIGINS || "http://localhost:5173";

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow mobile apps / curl / same-origin
      if (!origin) return cb(null, true);

      // Check if allowed
      if (FRONTEND_ORIGINS.includes(origin)) return cb(null, true);

      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return cb(new Error(msg), false);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Rate limiter for auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);

// health check
app.get("/health", (req, res) => res.sendStatus(200));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
