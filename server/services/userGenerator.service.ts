import {
  getRandomUsers,
  RandomUserProfile,
} from "../db/database/randomUserProfile";

export const fetchRandomUsers = async (
  count: number,
): Promise<RandomUserProfile[]> => {
  return getRandomUsers(count);
};
