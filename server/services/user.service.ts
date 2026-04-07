import {
  getProfileCount,
  getRandomUsersById,
  getUserById,
  RandomUserProfile,
} from "../db/database/randomUserProfile";
import { randomIntNumbers } from "../utils/random";

export const fetchRandomUsers = async (
  count: number,
): Promise<RandomUserProfile[]> => {
  const totalUserCount = await getProfileCount();

  const randomIds = randomIntNumbers(count, totalUserCount);
  return getRandomUsersById(randomIds);
};

export const fetchUserById = async (
  id: number,
): Promise<RandomUserProfile | null> => {
  return getUserById(id);
};
