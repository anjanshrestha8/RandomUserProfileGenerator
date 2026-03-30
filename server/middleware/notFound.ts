import { Request, Response } from "express";

/**
 * Catch-all handler for routes that don't match any registered handler.
 * Must be registered after all routes in app.ts, before the error handler.
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.path}`,
    code: "NOT_FOUND",
  });
};
