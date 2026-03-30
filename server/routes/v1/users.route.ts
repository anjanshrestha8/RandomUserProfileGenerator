import { Request, Response, Router } from "express";
import { getRandomUsers } from "../../db/database/randomUserProfile";
import { MAX_LIMIT } from "../../src/data";
import { ApiError } from "../../errors/ApiError";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const count = req.query.count !== undefined ? Number(req.query.count) : 1;

  if (!Number.isInteger(count) || count < 1 || count > MAX_LIMIT) {
    throw new ApiError(400, "BAD_REQUEST", `'count' must be a positive integer between 1 and ${MAX_LIMIT}.`);
  }

  const users = await getRandomUsers(count);
  res.json({ status: "success", count: users.length, data: users });
});

export default router;
