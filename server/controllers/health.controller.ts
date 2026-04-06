import { Request, Response } from "express";

export const getHealth = (_req: Request, res: Response): void => {
  const memory = process.memoryUsage();

  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: Date.now(),
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid,
    },
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
    },
    cpu: process.cpuUsage(),
    env: process.env.NODE_ENV || "development",
  });
};
