import { maleNames, femaleNames, addresses, emailDomains } from "../data";
import { randomIntNumber, randomItem } from "./number";

type Gender = "male" | "female";

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  gender: Gender;
  addressess: Address;
  age: number;
  profile_pic: string;
}

export const generateRandomUser = (): User => {
  const gender: Gender = Math.random() > 0.5 ? "male" : "female";
  const fullName =
    gender === "male" ? randomItem(maleNames) : randomItem(femaleNames);

  const [firstName, lastname] = fullName.split(" ");
  const rawAddress = randomItem(addresses);
  const age = randomIntNumber({ min: 10, max: 80 });
  const emailDomain = randomItem(emailDomains);

  const email = `${firstName}.${lastname}@${emailDomain}.com`;
  const [street, city, stateZip] = rawAddress.split(",").map((s) => s.trim());
  const [state, zip] = stateZip.split(" ");
  const address: Address = {
    street,
    city,
    state,
    zip,
    country: "USA",
  };

  return {
    firstName: firstName,
    lastName: lastname,
    fullName: fullName,
    email: email,
    gender: gender,
    addressess: address,
    age: age,
    profile_pic: "",
  };
};
