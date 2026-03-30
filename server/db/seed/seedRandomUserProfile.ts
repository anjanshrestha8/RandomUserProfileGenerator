import {
  maleNames,
  femaleNames,
  addresses,
  emailDomains,
} from "../../src/data";
import { randomIntNumber, randomItem } from "../../src/utils/number";
import db from "../database/database";

const INSERT_SQL = `
  INSERT OR IGNORE INTO randomUserProfile
    (first_name, last_name, email, gender, age, street, city, state, zip)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

async function seed(): Promise<void> {
  const allNames: { name: string; gender: string }[] = [
    ...maleNames.map((name) => ({ name, gender: "male" })),
    ...femaleNames.map((name) => ({ name, gender: "female" })),
  ];

  let inserted = 0;
  let skipped = 0;

  for (const { name, gender } of allNames) {
    const [firstName, lastName] = name.split(" ");

    const addressStr = randomItem(addresses);
    const parts = addressStr.split(",").map((s) => s.trim());
    const stateZipPart = parts[parts.length - 1];
    const lastSpace = stateZipPart.lastIndexOf(" ");
    const state = stateZipPart.substring(0, lastSpace);
    const zip = stateZipPart.substring(lastSpace + 1);
    const city = parts[parts.length - 2];
    const street = parts.slice(0, -2).join(", ");

    const age = randomIntNumber({ min: 10, max: 80 });

    const domain = randomItem(emailDomains);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}.com`;

    await new Promise<void>((resolve, reject) => {
      db.run(
        INSERT_SQL,
        [firstName, lastName, email, gender, age, street, city, state, zip],
        function (err) {
          if (err) {
            reject(err);
          } else {
            if (this.changes === 0) {
              skipped++;
            } else {
              inserted++;
            }
            resolve();
          }
        },
      );
    });
  }

  console.log(
    `Seed complete: ${inserted} rows inserted, ${skipped} rows skipped.`,
  );
  db.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  db.close();
  process.exit(1);
});
