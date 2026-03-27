import { Request, Response, Router } from "express";
import { generateRandomUser } from "../../src/utils/userGenerator";
import { MAX_LIMIT } from "../../src/data";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const countQuery = req.query.count;

  if (!countQuery) {
    const user = generateRandomUser();
    return res.json({
      status: "success",
      count: 1,
      data: [user],
    });
  }

  const count = Number(countQuery);

  if (!Number.isInteger(count) || count < 1 || count > MAX_LIMIT) {
    return res.status(400).json({
      status: "error",
      message: `'count' must be a positive integer between 1 and ${MAX_LIMIT}.`,
    });
  }

  const data = [];

  for (let i = 0; i < count; i++) {
    data.push(generateRandomUser());
  }

  res.json({
    status: "success",
    count: countQuery,
    data,
  });
});

export default router;
