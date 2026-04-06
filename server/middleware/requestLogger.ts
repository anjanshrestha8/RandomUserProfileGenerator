import morgan from "morgan";
import { RequestHandler } from "express";

const format = process.env.NODE_ENV === "production" ? "combined" : "dev";

export const requestLogger: RequestHandler = morgan(format);
