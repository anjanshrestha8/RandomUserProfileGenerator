import { getProfileCount } from "../db/database/randomUserProfile";

type Range = {
  min: number;
  max: number;
};

export const randomIntNumber = ({ min, max }: Range): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const randomItem = <T>(arr: T[]): T => {
  return arr[randomIntNumber({ min: 0, max: arr.length - 1 })];
};

export const randomIntNumbers = (
  count: number,
  totalRandomData: number,
): number[] => {
  const randomIds: number[] = [];

  for (let i = 0; i < count; i++) {
    randomIds.push(randomIntNumber({ min: 1, max: totalRandomData }));
  }
  return randomIds;
};
