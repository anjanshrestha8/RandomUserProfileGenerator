type Range = {
  min: number;
  max: number;
};

export const randomIntNumber = ({ min, max }: Range): number => {
  return Math.floor(Math.random() * (max - min) + max);
};

export const randomItem = <T>(arr: T[]): T => {
  return arr[randomIntNumber({ min: 0, max: arr.length - 1 })];
};
