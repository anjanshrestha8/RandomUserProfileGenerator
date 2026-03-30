import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
    });
    return;
  }

  console.error("Unhandled error:", err);

  const isProduction = process.env.NODE_ENV === "production";

  res.status(500).json({
    status: "error",
    message: isProduction ? "Internal server error" : err.message,
    code: "INTERNAL_SERVER_ERROR",
    ...(!isProduction && { details: { stack: err.stack } }),
  });
};
