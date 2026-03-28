import db from "./database";

export interface RandomUserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  age: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  profile_pic: string;
  created_at: string;
}

export const getRandomUsers = (count: number): Promise<RandomUserProfile[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM randomUserProfile ORDER BY RANDOM() LIMIT ?",
      [count],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows as RandomUserProfile[]);
      },
    );
  });
};

export const getProfileCount = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) as count FROM randomUserProfile",
      [],
      (err, row: { count: number }) => {
        if (err) reject(err);
        else resolve(row.count);
      },
    );
  });
};
