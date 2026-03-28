# Migration Plan: Array-Based Generation → Pre-Seeded `randomUserProfile` Table

## Overview

Currently, user profiles are generated on-the-fly from in-memory arrays in `src/data.ts` every time the `/api/v1/users` endpoint is called. The goal is to:

1. Pre-populate a new `randomUserProfile` table (~3,400 rows — one per name in the arrays)
2. Serve random users from the database using `ORDER BY RANDOM() LIMIT N`
3. Guarantee uniqueness within every request without any extra tracking logic

---

## Phase 1 — Add SQL Strings

**File:** `server/db/migrationScript/dbScript.js`

Add two new exported SQL constants alongside the existing `CREATE_USERS_TABLE` and `DROP_USERS_TABLE`:

```js
const CREATE_RANDOM_USER_PROFILE_TABLE = `
  CREATE TABLE IF NOT EXISTS randomUserProfile (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT    NOT NULL,
    last_name  TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    gender     TEXT    NOT NULL,
    age        INTEGER NOT NULL,
    street     TEXT    NOT NULL,
    city       TEXT    NOT NULL,
    state      TEXT    NOT NULL,
    zip        TEXT    NOT NULL,
    profile_pic TEXT   NOT NULL DEFAULT '',
    created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

const DROP_RANDOM_USER_PROFILE_TABLE = `
  DROP TABLE IF EXISTS randomUserProfile
`;

module.exports = {
  CREATE_USERS_TABLE,
  DROP_USERS_TABLE,
  CREATE_RANDOM_USER_PROFILE_TABLE,
  DROP_RANDOM_USER_PROFILE_TABLE,
};
```

**Why separate address columns?** Street, city, state, and zip are queried and displayed independently. Storing them split avoids parsing at read time.

---

## Phase 2 — Create Migration File

Run the following command to generate the migration skeleton:

```bash
cd server && npm run migrate:create -- add-random-user-profile-table
```

Then edit the generated file in `server/migrations/` to match this pattern (same as the existing `20260322115932-add-user-table.js`):

```js
const { CREATE_RANDOM_USER_PROFILE_TABLE, DROP_RANDOM_USER_PROFILE_TABLE } =
  require("../db/migrationScript/dbScript");

exports.up = function (db, callback) {
  db.runSql(CREATE_RANDOM_USER_PROFILE_TABLE, callback);
};

exports.down = function (db, callback) {
  db.runSql(DROP_RANDOM_USER_PROFILE_TABLE, callback);
};
```

---

## Phase 3 — DB Query Helper

**New file:** `server/db/database/randomUserProfile.ts`

Exports two promisified functions that wrap the `db` singleton from `db/database/database.ts`:

```ts
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

// Returns N random users in a single query — all distinct by definition
export function getRandomUsers(count: number): Promise<RandomUserProfile[]>

// Returns total number of pre-seeded profiles
export function getProfileCount(): Promise<number>
```

Both use `db.all` / `db.get` wrapped in a `Promise` for async/await compatibility.

- `getRandomUsers` SQL: `SELECT * FROM randomUserProfile ORDER BY RANDOM() LIMIT ?`
- `getProfileCount` SQL: `SELECT COUNT(*) as count FROM randomUserProfile`

---

## Phase 4 — Seed Script

**New file:** `server/db/seed/seedRandomUserProfile.ts`

### Logic

1. Import `maleNames`, `femaleNames`, `addresses`, `emailDomains` from `../../src/data`
2. Import `randomIntNumber` from `../../src/utils/number`
3. Import the `db` singleton from `../database/database`
4. Loop through all `maleNames` (gender = `'male'`) then all `femaleNames` (gender = `'female'`) — ~3,400 total
5. For each name:
   - Split `"First Last"` into `firstName` and `lastName`
   - Pick a random address string from `addresses`, parse it into `street`, `city`, `state`, `zip` by splitting on `,`
   - Generate a random `age` between 10 and 80
   - Pick a random domain from `emailDomains`
   - Build email: `firstname.lastname@domain.com` (lowercased)
   - Run `INSERT OR IGNORE INTO randomUserProfile (first_name, last_name, email, gender, age, street, city, state, zip)  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
     - `INSERT OR IGNORE` silently skips any row whose email already exists (handles rare duplicate names)
6. Log a summary (`X rows inserted, Y rows skipped`) and close the DB connection

---

## Phase 5 — Add npm Script

**File:** `server/package.json`

Add a `seed` entry to the `scripts` block:

```json
"seed": "tsx db/seed/seedRandomUserProfile.ts"
```

This lets the seed be run as:

```bash
npm run seed
```

---

## Phase 6 — Update Users Route

**File:** `server/routes/v1/users.route.ts`

### Remove
```ts
import { generateRandomUser } from "../../src/utils/userGenerator";
```

### Add
```ts
import { getRandomUsers } from "../../db/database/randomUserProfile";
```

### Change the handler logic

**Before (array-based):**
```ts
// Single user
const user = generateRandomUser();
return res.json({ status: "success", count: 1, data: [user] });

// Multiple users
const users = Array.from({ length: count }, () => generateRandomUser());
return res.json({ status: "success", count, data: users });
```

**After (DB-based):**
```ts
try {
  const users = await getRandomUsers(count); // single call covers both cases
  return res.json({ status: "success", count: users.length, data: users });
} catch (err) {
  return res.status(500).json({ status: "error", message: "Failed to fetch users" });
}
```

- All existing validation (count range 1–50, integer check) stays unchanged
- The route handler becomes `async`

---

## Phase 7 — Execute Migration & Seed

> **Run after all code changes are in place.**

```bash
cd server

# Step 1: Apply the new migration (creates the randomUserProfile table)
npm run migrate

# Step 2: Seed the table with ~3,400 profiles
npm run seed
```

---

## Verification Checklist

| Check | Command / Action | Expected Result |
|---|---|---|
| Migration applied | `npm run migrate:status` | `add-random-user-profile-table` shows as run |
| Row count | SQLite: `SELECT COUNT(*) FROM randomUserProfile;` | ~3,400 rows |
| Single user | `GET /api/v1/users` | 1 user with structured address fields from DB |
| Multiple users | `GET /api/v1/users?count=10` | 10 distinct users in one response |
| Max limit | `GET /api/v1/users?count=50` | 50 distinct users |
| Randomness | Hit the endpoint repeatedly | Different users returned each time |

---

## Files Changed

| File | Type | Change |
|---|---|---|
| `server/db/migrationScript/dbScript.js` | Edit | Add 2 new SQL constants + export them |
| `server/migrations/<timestamp>-add-random-user-profile-table.js` | New | Migration file (generated then edited) |
| `server/db/database/randomUserProfile.ts` | New | Query helper (`getRandomUsers`, `getProfileCount`) |
| `server/db/seed/seedRandomUserProfile.ts` | New | Seed script — inserts ~3,400 profiles |
| `server/package.json` | Edit | Add `"seed"` npm script |
| `server/routes/v1/users.route.ts` | Edit | Swap array logic for `getRandomUsers()` DB call |

## Files Left Unchanged

| File | Reason |
|---|---|
| `server/src/data.ts` | Still needed by the seed script at seed time |
| `server/src/utils/userGenerator.ts` | Kept as reference; no longer called at runtime |
| `server/db/database/database.ts` | The `db` singleton is reused as-is |
| Existing `users` migration | No changes — different table, no rollback risk |
| `server/app.ts`, `server/server.ts` | No changes needed |

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| `ORDER BY RANDOM() LIMIT N` | One SQL query returns N unique users with no application-level deduplication needed |
| `INSERT OR IGNORE` on email UNIQUE | Silently drops rare duplicate emails (e.g. two "John Smith" entries) without crashing the seed |
| Separate address columns | Avoids string parsing at every read; more queryable in the future |
| ~3,400 profiles | Exactly one profile per name — the natural ceiling of the source data |
| Keep `src/data.ts` | Deleting it would break the seed script and is unnecessary |
