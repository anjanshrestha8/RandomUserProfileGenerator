import { Request, Response, Router } from "express";
import { getRandomUsers } from "../../db/database/randomUserProfile";
import { MAX_LIMIT } from "../../src/data";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const countQuery = req.query.count;
  const count = countQuery ? Number(countQuery) : 1;

  if (!Number.isInteger(count) || count < 1 || count > MAX_LIMIT) {
    return res.status(400).json({
      status: "error",
      message: `'count' must be a positive integer between 1 and ${MAX_LIMIT}.`,
    });
  }

  try {
    const users = await getRandomUsers(count);
    return res.json({ status: "success", count: users.length, data: users });
  } catch (err) {
    return res
      .status(500)
      .json({ status: "error", message: "Failed to fetch users" });
  }
});

export default router;
