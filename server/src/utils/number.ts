type Range = {
  min: number;
  max: number;
};

export const randomIntNumber = ({ min, max }: Range): number => {
  const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
  return randomNumber;
};

export const randomItem = <T>(arr: T[]): T => {
  const randomItem = arr[randomIntNumber({ min: 0, max: arr.length - 1 })];
  return randomItem;
};
