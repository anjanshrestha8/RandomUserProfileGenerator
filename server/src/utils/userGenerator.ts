import { maleNames, femaleNames, addresses, emailDomains } from "../data";
import { randomIntNumber, randomItem } from "./number";

type Gender = "male" | "female";

export interface User {
  firstName: string | "UserFirstName";
  lastName: string | "UserLastName";
  fullName: string | "UserFullNamex";
  email: string | "";
  gender: Gender;
  addressess: string | "USA";
  age: number | 18;
  profile_pic: string;
}

export const generateRandomUser = (): User => {
  const gender: Gender = Math.random() > 0.5 ? "male" : "female";
  const fullName =
    gender === "male" ? randomItem(maleNames) : randomItem(femaleNames);

  const [firstName, lastname] = fullName.split(" ");
  const addressess = randomItem(addresses);
  const age = randomIntNumber({ min: 10, max: 80 });
  const emailDomain = randomItem(emailDomains);

  const email = `${firstName}.${lastname}@${emailDomain}.com`;

  return {
    firstName: firstName,
    lastName: lastname,
    fullName: fullName,
    email: email,
    gender: gender,
    addressess: addressess || "USA",
    age: age,
    profile_pic: "",
  };
};
