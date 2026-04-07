import { Request, Response } from "express";
import { config } from "../config";

export const getHome = (_req: Request, res: Response): void => {
  res.render("home", {
    port: config.port,
    env: config.nodeEnv,
    maxUsers: config.maxUsersPerRequest,
    rateLimit: config.rateLimitMax,
  });
};
