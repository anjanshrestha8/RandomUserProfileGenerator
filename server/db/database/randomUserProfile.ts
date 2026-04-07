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

export const getRandomUsersById = (
  randomIds: number[],
): Promise<RandomUserProfile[]> => {
  return new Promise((resolve, reject) => {
    const placeholders = randomIds.map(() => "?").join(", ");
    const query = `SELECT * FROM randomUserProfile WHERE id IN (${placeholders})`;

    db.all(query, randomIds, (err, rows) => {
      console.log(randomIds);
      if (err) reject(err);
      else resolve(rows as RandomUserProfile[]);
    });
  });
};

export const getUserById = (id: number): Promise<RandomUserProfile | null> => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM randomUserProfile WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      else resolve(row ? (row as RandomUserProfile) : null);
    });
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
