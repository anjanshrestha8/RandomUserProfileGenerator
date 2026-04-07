import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";
import { config } from "../config";
import { fetchRandomUsers, fetchUserById } from "../services/user.service";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const raw = req.query.count;
    const count = raw !== undefined ? Number(raw) : 1;

    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > config.maxUsersPerRequest
    ) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        `'count' must be a positive integer between 1 and ${config.maxUsersPerRequest}.`,
      );
    }

    const users = await fetchRandomUsers(count);
    res.json({ status: "success", count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "'id' must be a positive integer.",
      );
    }

    const user = await fetchUserById(id);

    if (!user) {
      throw new ApiError(404, "NOT_FOUND", `User with id ${id} not found.`);
    }

    res.json({ status: "success", data: user });
  } catch (err) {
    next(err);
  }
};
