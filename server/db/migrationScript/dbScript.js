module.exports = {
  CREATE_USERS_TABLE: `
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
  `,
  DROP_USERS_TABLE: "DROP TABLE IF EXISTS users",
};
