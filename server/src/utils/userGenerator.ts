import { maleNames, femaleNames, addresses, emailDomains } from "../data";

type Gender = "male" | "female";

export interface User {
  name: string;
  email: string;
  gender: Gender;
  country: string;
  age: number;
  profile_pic: string;
}

export const generateRandomUser = (): User => {
  const gender: Gender = Math.random() > 0.5 ? "male" : "female";
};
