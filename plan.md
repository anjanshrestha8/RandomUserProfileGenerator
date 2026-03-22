
---

## Step-by-Step Plan

### Step 1 — Initialize Project
- `npm init -y`
- Install dependencies:
  - Runtime: `express`, `sqlite3`, `dotenv`
  - Dev: `nodemon`
- Add scripts to `package.json`:
  - `"start": "node server.js"`
  - `"dev": "nodemon server.js"`
- Create `.gitignore` (ignore `node_modules/`, `data/`, `.env`)
- Create `.env` with `PORT=3000` and `DB_PATH=./data/users.db`

---

### Step 2 — Database Connection (`src/db/database.js`)
- Open SQLite database from `DB_PATH` env variable
- Wrap the callback-based `sqlite3` API in Promises:
  - `run(sql, params)` → resolves with `{ id, changes }`
  - `get(sql, params)` → resolves with a single row or `undefined`
  - `all(sql, params)` → resolves with array of rows
- Export singleton `db` object with those three helpers

---

### Step 3 — Migrations (`src/db/migrations.js`)
- Export async `runMigrations()` function
- Executes `CREATE TABLE IF NOT EXISTS users` with columns:
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`
  - `name TEXT NOT NULL`
  - `email TEXT UNIQUE NOT NULL`
  - `gender TEXT`
  - `country TEXT`
  - `age INTEGER`
  - `profile_pic TEXT`
  - `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- Uses `db.run()` helper (no raw callbacks)

---

### Step 4 — Random User Generator (`src/utils/userGenerator.js`)
- Pure function `generateRandomUser()` — no I/O, no side effects
- Fields generated locally from static arrays:
  - `name`: random first name + last name
  - `gender`: `"male"` or `"female"` (drives portrait URL)
  - `country`: random from a list of ~20 countries
  - `age`: random integer 18–75
  - `email`: `firstname.lastname{random3digits}@{domain}.com`
  - `profile_pic`: `https://randomuser.me/api/portraits/{men|women}/{0–99}.jpg`

---

### Step 5 — Repository (`src/modules/user/user.repository.js`)
- **Only file allowed to contain SQL**
- All queries use prepared statements (`?` placeholders)
- Functions:
  - `createUser(user)` → INSERT, returns new user id
  - `findAll()` → SELECT all rows
  - `findById(id)` → SELECT single row
  - `deleteById(id)` → DELETE row

---

### Step 6 — Service (`src/modules/user/user.service.js`)
- Imports repository + generator
- Contains all business logic:
  - `generateAndSaveUser()` → generate → insert → fetch saved row → return
  - `getAllUsers()` → call `findAll()`
  - `getUserById(id)` → call `findById()`, throw `{ status: 404, message: "User not found" }` if missing
  - `deleteUser(id)` → verify exists (throw 404 if not) → call `deleteById()`
- No SQL, no HTTP concepts here

---

### Step 7 — Controller (`src/modules/user/user.controller.js`)
- Imports service
- Each method: async, wrapped in try/catch, passes errors to `next(err)`
- Methods:
  - `generate(req, res, next)` → calls `generateAndSaveUser()` → `201 { user }`
  - `getAll(req, res, next)` → calls `getAllUsers()` → `200 { users }`
  - `getById(req, res, next)` → calls `getUserById(req.params.id)` → `200 { user }`
  - `remove(req, res, next)` → calls `deleteUser(req.params.id)` → `200 { message }`

---

### Step 8 — Routes (`src/modules/user/user.routes.js`)
- `express.Router()` wiring:

| Method | Path        | Controller Method |
|--------|-------------|-------------------|
| POST   | `/generate` | `generate`        |
| GET    | `/`         | `getAll`          |
| GET    | `/:id`      | `getById`         |
| DELETE | `/:id`      | `remove`          |

---

### Step 9 — Express App (`app.js`)
- Create Express instance
- Apply `express.json()` middleware
- Mount user router at `/api/users`
- Add global error-handler middleware (last middleware):
  - Reads `err.status` (default 500)
  - Returns `{ "error": err.message }`

---

### Step 10 — Server Entry Point (`server.js`)
- Load `.env` via `dotenv`
- Call `runMigrations()` (await)
- Start `app.listen(PORT, callback)`
- Log server URL on success

---

## API Reference

| Method | Endpoint               | Description            | Response     |
|--------|------------------------|------------------------|--------------|
| POST   | `/api/users/generate`  | Generate & save user   | 201 + user   |
| GET    | `/api/users`           | Get all users          | 200 + array  |
| GET    | `/api/users/:id`       | Get user by ID         | 200 / 404    |
| DELETE | `/api/users/:id`       | Delete user by ID      | 200 / 404    |

---

## Verification Checklist

- [ ] `npm run dev` starts without errors, DB file created at `data/users.db`
- [ ] `POST /api/users/generate` returns 201 with all 8 user fields + `id` + `created_at`
- [ ] `GET /api/users` returns array (grows with each generate call)
- [ ] `GET /api/users/1` returns the first user
- [ ] `GET /api/users/9999` returns `404 { "error": "User not found" }`
- [ ] `DELETE /api/users/1` returns 200; calling again returns 404
- [ ] Duplicate email from generator regenerates cleanly (unique constraint respected)

---

## Scope Boundaries

**In scope:** generate, save, list, get by ID, delete  
**Out of scope:** authentication, update endpoint, pagination, external API calls for generation