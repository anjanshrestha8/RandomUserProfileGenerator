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

export default db;
