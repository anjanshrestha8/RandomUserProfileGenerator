import { Router } from "express";
import userRoute from "./v1/users.route";
import healthRoute from "./v1/healthCheck.route";

const router = Router();

router.use("/v1/users", userRoute);
router.use("/v1/health", healthRoute);

export default router;
