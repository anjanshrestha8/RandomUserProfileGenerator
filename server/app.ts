import express, { Request, Response, NextFunction } from "express";

const app = express();

const db = require("../server/db/database/database");

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Random User Generator API",
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status: number = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

export default app;
