import { Router } from "express";
import userRoute from "./v1/users.route";
import healthRoute from "./v1/healthCheck.route";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.use("/v1/users", rateLimiter, userRoute);
router.use("/v1/health", healthRoute);

export default router;
