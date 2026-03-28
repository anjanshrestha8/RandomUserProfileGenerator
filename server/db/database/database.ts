import sqlite3 from "sqlite3";
import dotenv from "dotenv";

dotenv.config();

const DB_PATH = process.env.DB_PATH;

type SQL_PARAMS = {
  sqlQuery: string;
  params: [];
};

if (!DB_PATH) {
  throw new Error("DB_PATH is not defined in environment variables");
}

const db = new sqlite3.Database(DB_PATH, (error) => {
  if (error) {
    console.error("Failed to connect to database");
  } else {
    console.log(`Database is connected sucessfully at ${DB_PATH}`);
  }
});

export function get<T>(
  sql: string,
  params: any[] = [],
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: any, row: T) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function all<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: any, rows: T[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export default db;
