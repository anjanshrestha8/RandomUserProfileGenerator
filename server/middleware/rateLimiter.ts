import { rateLimit } from "express-rate-limit";
import { config } from "../config";

export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many requests, please try again later.",
    });
  },
});
