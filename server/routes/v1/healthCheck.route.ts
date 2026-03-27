import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
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
});

export default router;
