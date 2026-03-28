const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    name        TEXT     NOT NULL,
    email       TEXT     UNIQUE NOT NULL,
    gender      TEXT,
    country     TEXT,
    age         INTEGER,
    profile_pic TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

const DROP_USERS_TABLE = "DROP TABLE IF EXISTS users";

const CREATE_RANDOM_USER_PROFILE_TABLE = `
  CREATE TABLE IF NOT EXISTS randomUserProfile (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name  TEXT    NOT NULL,
    last_name   TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    gender      TEXT    NOT NULL,
    age         INTEGER NOT NULL,
    street      TEXT    NOT NULL,
    city        TEXT    NOT NULL,
    state       TEXT    NOT NULL,
    zip         TEXT    NOT NULL,
    profile_pic TEXT    NOT NULL DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

const DROP_RANDOM_USER_PROFILE_TABLE = `DROP TABLE IF EXISTS randomUserProfile`;

module.exports = {
  CREATE_USERS_TABLE,
  DROP_USERS_TABLE,
  CREATE_RANDOM_USER_PROFILE_TABLE,
  DROP_RANDOM_USER_PROFILE_TABLE,
};
