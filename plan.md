# Random User Generator — Production Improvement Plan

**Project goal:** A public, open REST API that generates random user profiles on demand.
Generated profiles are never stored. Future scope: store client API keys and usage metadata.

**Stack:** Node.js · TypeScript · Express.js · SQLite (dev) → PostgreSQL (prod) · Redis (future)

---

## P0 — Critical Bug Fixes
> These must be fixed before anything else. The API currently returns broken data.

---

### P0-1 · Fix name splitting bug
**File:** `server/src/utils/userGenerator.ts`

**Problem:**
`fullName.split("")` splits a string into individual characters.
`"John Smith".split("")` → `["J","o","h","n"," ","S","m","i","t","h"]`
So `firstName = "J"` and `lastName = "o"`. Every generated user has a one-letter name.

**Fix:**
Change `fullName.split("")` to `fullName.split(" ")` so the string splits on the space between first and last name.

---

### P0-2 · Fix off-by-one in random number generator
**File:** `server/src/utils/number.ts`

**Problem:**
Current formula: `Math.floor(Math.random() * (max - min) + min)`
`Math.random()` returns `[0, 1)` — it never reaches 1.
So with `max = arr.length - 1`, the last index is never reached.
The last name/address in every array is always skipped. Ages never reach the configured maximum.

**Fix:**
Change to: `Math.floor(Math.random() * (max - min + 1) + min)`
This makes the range inclusive of both `min` and `max`.

---

### P0-3 · Fix address used as country
**File:** `server/src/utils/userGenerator.ts`

**Problem:**
`randomItem(addresses)` returns a full street address string like:
`"17 High Noon Street, Lombard, IL 60148"`
But the field is named `country` and assigned to the `country` property. This is completely wrong data.

**Fix:**
Parse the address string by splitting on `","` to extract structured parts:
- Index 0 → `street` ("17 High Noon Street")
- Index 1 → `city` ("Lombard")
- Index 2 → `state + zip` ("IL 60148" → split by space to get state and zip)
- Hard-code `country: "USA"` since all data is US addresses

Return a structured `address` object instead of a bare string.

---

### P0-4 · Remove unused database import
**File:** `server/app.ts`

**Problem:**
`const db = require("../server/db/database/database")` is imported but never used anywhere in `app.ts`.
This silently opens a SQLite connection on every server start for no reason, wastes resources, and can mask real connection errors.

**Fix:**
Delete that line entirely.

---

## P1 — Core API Improvements
> Must be done before going public. Makes the API correct, safe, and usable.

---

### P1-1 · Add API versioning and proper routes
**File:** Create `server/routes/users.route.ts`

**Problem:**
The only route is `GET /` with no versioning. If you change the response shape later, all existing consumers break.

**Implementation:**
```
GET /api/v1/users          → returns 1 random user
GET /api/v1/users?count=N  → returns N random users (max 50)
GET /api/v1/health         → { status: "ok", uptime: process.uptime() }
```

**Response envelope (all endpoints use this shape):**
```json
{
  "status": "success",
  "count": 1,
  "data": [ { ...user } ]
}
```
Always return an array, even for a single user. Consumers never need to handle two different shapes.

**Validation for `count` param:**
- Must be a positive integer
- Maximum 50 per request (prevent abuse)
- Default to 1 if not provided
- Return `400 Bad Request` with a clear message if invalid

---

### P1-2 · Add rate limiting
**Package:** `express-rate-limit` + `rate-limit-redis` (when Redis is added)

**Problem:**
Without rate limiting, anyone can send millions of requests and crash or exhaust the server.
This is the most critical security concern for a public API.

**Implementation:**
- Global limit: **100 requests per 15-minute window per IP address**
- Bulk endpoint limit: **max `count=50` per request** (validated in route handler)
- Return `429 Too Many Requests` with a `Retry-After` header when limit is exceeded

**Important note on storage:**
By default, `express-rate-limit` stores counters in memory. This means:
1. Counters reset on every server restart
2. If you run multiple server instances, each has its own counter (limit is bypassed)

When you're ready to scale, replace the in-memory store with a Redis store using `rate-limit-redis`.

---

### P1-3 · Add CORS, Helmet, and Compression
**Packages:** `cors`, `helmet`, `compression`

**CORS:**
Required so browser-based clients (frontend apps, tools like Postman Web) can call the API.
For a fully public API, allow all origins: `Access-Control-Allow-Origin: *`

**Helmet:**
Sets ~14 secure HTTP response headers automatically (e.g. `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).
One line: `app.use(helmet())` — no configuration needed to get substantial security improvements.

**Compression:**
Gzip/Brotli compress JSON responses. For `?count=50` requests, this reduces payload size by ~70%.
One line: `app.use(compression())`

**Middleware order in app.ts (important):**
```
1. helmet()
2. cors()
3. compression()
4. express.json()
5. requestLogger
6. routes
7. 404 handler
8. error handler
```

---

### P1-4 · Fix and improve error handling
**File:** `server/app.ts` → move to `server/middleware/errorHandler.ts`

**Problems:**
- No 404 handler — unknown routes fall through silently
- Error responses leak stack traces in all environments

**Implementation:**

**404 handler** (register after all routes, before error handler):
```
app.use((_req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" })
})
```

**Global error handler** (must be last middleware, 4-argument signature):
- In development: include `error.stack` in response for easier debugging
- In production (`NODE_ENV=production`): return only `{ status: "error", message: "Internal server error" }` — never expose internals

---

### P1-5 · Add graceful shutdown
**File:** `server/server.ts`

**Problem:**
When a server restarts (deploy, crash, scale-down), Node exits abruptly. Any in-flight requests are killed mid-response. Clients get broken responses or connection resets.

**Implementation:**
Listen for `SIGTERM` and `SIGINT` signals. Stop accepting new connections, wait for existing requests to finish, then exit cleanly.

```typescript
const server = app.listen(PORT, () => { ... });

const shutdown = () => {
  server.close(() => {
    // close DB connection if open
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

Required for zero-downtime deployments on any cloud provider (Railway, Fly.io, AWS, etc.).

---

## P2 — Architecture & Data Quality
> Improves maintainability, code quality, and the richness of generated profiles.

---

### P2-1 · Refactor to layered architecture
**Problem:**
Currently all logic lives in `app.ts` and flat utility files. This doesn't scale — adding new endpoints means editing the same file that configures Express.

**Target folder structure:**
```
server/
├── server.ts                    ← entry point only (start server, handle shutdown)
├── app.ts                       ← express setup + middleware registration only
├── config.ts                    ← all env var reads in one place
├── routes/
│   └── users.route.ts           ← route definitions, call controllers
├── controllers/
│   └── users.controller.ts      ← parse request, call service, format response
├── services/
│   └── userGenerator.service.ts ← all generation logic (moved from src/utils)
├── middleware/
│   ├── errorHandler.ts          ← global error handler
│   ├── rateLimiter.ts           ← rate limit config
│   └── requestLogger.ts         ← morgan/pino setup
├── data/
│   └── seed.ts                  ← names, addresses, domains (renamed from src/data.ts)
├── utils/
│   └── random.ts                ← random number helpers (renamed from src/utils/number.ts)
└── types/
    └── user.ts                  ← User, Address interfaces
```

**Layer responsibilities:**
- **Route** knows about HTTP verbs and paths only
- **Controller** knows about `req`/`res` only — no business logic
- **Service** knows about generation logic only — no HTTP concepts
- **Utils** are pure functions with no dependencies

---

### P2-2 · Expand user profile schema
**File:** `server/types/user.ts` and `server/services/userGenerator.service.ts`

**Add these fields to every generated user:**

| Field | Type | How to generate |
|-------|------|-----------------|
| `id` | `string` (UUID) | `crypto.randomUUID()` — Node built-in, no package needed |
| `username` | `string` | `firstName + randomNumber(100, 9999)` e.g. `"john4821"` |
| `phone` | `string` | Generate a plausible US format: `"(555) 382-9104"` |
| `dob` | `string` (ISO date) | Subtract `age` years from today |
| `avatar` | `string` (URL) | `https://api.dicebear.com/7.x/personas/svg?seed={id}` — free, deterministic, no API key |
| `address` | `object` | Parsed from existing address strings (see P0-3) |
| `nationality` | `string` | Hard-code `"American"` for now (all data is US-based) |

**Fix the TypeScript interface:**
Current `string | "UserFirstName"` is meaningless — a union of `string` and a string literal is always just `string`.
Use clean, strict types throughout.

---

### P2-3 · Add a centralized config module
**File:** Create `server/config.ts`

**Problem:**
`process.env.X` is scattered across multiple files. If an env var is missing, the error surfaces at runtime in a random location.

**Implementation:**
Read and validate all env vars at startup in one place:
```typescript
export const config = {
  port: Number(process.env.PORT) || 3000,
  dbPath: process.env.DB_PATH || "./data/RANDOM_USER_GENERATOR.db",
  nodeEnv: process.env.NODE_ENV || "development",
  rateLimitWindowMs: 15 * 60 * 1000,
  rateLimitMax: 100,
  maxUsersPerRequest: 50,
};
```
All other files import from `config.ts` — no direct `process.env` access anywhere else.

---

### P2-4 · Add structured request logging
**Package:** `morgan` (simple) or `pino` + `pino-http` (production-grade)

**morgan** is fine for getting started:
- Development format: `dev` (colorized, concise)
- Production format: `combined` (Apache-style, includes IP, user-agent, response time)

**pino** is recommended for production because:
- Outputs JSON logs (parseable by Datadog, CloudWatch, Grafana Loki, etc.)
- ~10x faster than morgan
- Easily attach `requestId` to every log line

**Add Request IDs:**
Generate a `X-Request-ID` UUID (or accept one from the client if provided) and attach it to every log line and error response. This lets you trace a specific request across all log entries.

---

### P2-5 · Fix tsconfig.json
**File:** `server/tsconfig.json`

**Problems:**
- `include` array has `"db/migrationScript/scripts.Js"` — wrong casing (`.Js`) and wrong filename (`dbScript.js`, not `scripts.Js`)
- Migration scripts are plain JS — TypeScript compiler shouldn't try to process them

**Fix:**
Remove the bad entry. Add `"migrations"` and `"db/migrationScript"` to `exclude` so tsc ignores them cleanly.

---

## P3 — Developer Experience & Reliability
> Required before the API can be considered production-ready.

---

### P3-1 · Add OpenAPI / Swagger documentation
**Packages:** `swagger-ui-express`, `swagger-jsdoc`

**Why this is critical:**
Documentation is what separates a toy API from one developers actually use. Without it, nobody knows what parameters exist, what the response looks like, or how errors are formatted.

**Serve at:** `GET /docs`

**Document at minimum:**
- `GET /api/v1/users` — no params, returns 1 user
- `GET /api/v1/users?count=N` — N is 1–50, returns array of N users
- `GET /api/v1/health` — returns uptime and status
- Full User schema with all fields and their types
- Error response schema (400, 404, 429, 500)
- Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)

---

### P3-2 · Add tests
**Packages:** `vitest`, `supertest`

**Unit tests** — `server/utils/random.ts`:
- `randomIntNumber` always returns a value within [min, max] inclusive
- `randomItem` can return any item including first and last

**Unit tests** — `server/services/userGenerator.service.ts`:
- `generateRandomUser()` returns an object with all required fields
- `firstName` and `lastName` are never empty, never single characters
- `email` contains `@` and `.`
- `age` is within 18–80
- `address` is a structured object (not a raw string)
- `id` is a valid UUID

**Integration tests** — API routes (using supertest):
- `GET /api/v1/users` → 200, returns array of 1
- `GET /api/v1/users?count=5` → 200, returns array of 5
- `GET /api/v1/users?count=0` → 400
- `GET /api/v1/users?count=51` → 400
- `GET /api/v1/users?count=abc` → 400
- `GET /api/v1/health` → 200, `{ status: "ok" }`
- `GET /nonexistent` → 404

---

### P3-3 · Add Dockerfile and deployment files
**Files to create:** `Dockerfile`, `.env.example`, `README.md`

**Dockerfile** — use Node 20 slim image, multi-stage build:
1. Stage 1 (`builder`): install all deps, run `tsc` to compile TypeScript
2. Stage 2 (`runner`): copy only `dist/` and `node_modules` (prod deps only), run `node dist/server.js`

This keeps the final image small (~150MB vs ~600MB).

**.env.example:**
Document every environment variable with a description and example value.
Commit this file. Never commit `.env`.

**README.md — include:**
- What the API does (one paragraph)
- Available endpoints with example `curl` commands
- Example JSON response
- How to run locally (`npm run dev`)
- How to run with Docker
- Rate limit policy
- Link to `/docs` for full API reference

---

### P3-4 · Add CI/CD pipeline
**File:** `.github/workflows/ci.yml`

**On every Pull Request:**
1. Install dependencies
2. Run TypeScript compiler check (`tsc --noEmit`)
3. Run all tests (`vitest run`)
4. Fail the PR if any step fails

**On merge to `main`:**
1. All PR checks (above)
2. Build Docker image
3. Push to container registry (GitHub Container Registry is free)
4. Deploy to hosting platform

---

### P3-5 · Add Sentry error tracking
**Package:** `@sentry/node`

Sentry catches unhandled exceptions and promise rejections, captures the full stack trace, groups duplicate errors, and sends alerts. The free tier is sufficient for early-stage APIs.

Initialize before routes in `app.ts`. It integrates with Express automatically via `Sentry.setupExpressErrorHandler(app)`.

---

### P3-6 · Load testing before going live
**Tool:** k6 (free, open source) or Artillery

**Test scenario:**
- Ramp from 0 → 500 concurrent virtual users over 30 seconds
- Hold at 500 for 60 seconds
- Ramp down

**Pass criteria:**
- p99 response time < 200ms
- Error rate < 0.1%
- No memory leak (RSS stays flat over time)

If the server struggles, identify the bottleneck (CPU? Event loop blocking? SQL query?) before adding real users.

---

## Future Scope — Client API Key System

> Do not build this now. Design the DB schema now so the migration is easy later.

---

### Future-1 · PostgreSQL migration
**Why:** SQLite does not support concurrent writes. Under any meaningful load with multiple server instances, writes will queue or fail. PostgreSQL handles thousands of concurrent connections.

**Migration path:**
`db-migrate` already supports PostgreSQL. Change the `driver` in `database.json` from `sqlite3` to `pg` and update the connection string. No application code changes needed.

**Managed PostgreSQL options (cheapest first):**
- Neon.io — free tier, serverless, generous limits
- Supabase — free tier, adds realtime and auth on top
- Railway — $5/month, dead-simple deployment
- AWS RDS — production-grade, more expensive, more control

---

### Future-2 · Client API key schema

```sql
CREATE TABLE clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  api_key     TEXT UNIQUE NOT NULL,  -- store HASHED (bcrypt), never plaintext
  plan        TEXT DEFAULT 'free',   -- 'free' | 'pro' | 'enterprise'
  created_at  TIMESTAMPTZ DEFAULT now(),
  is_active   BOOLEAN DEFAULT true
);

CREATE TABLE usage_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID REFERENCES clients(id) ON DELETE SET NULL,
  endpoint      TEXT NOT NULL,
  count         INT NOT NULL DEFAULT 1,
  ip_address    TEXT,
  requested_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_client ON usage_logs(client_id);
CREATE INDEX idx_usage_time ON usage_logs(requested_at);
```

**API key security rules:**
- Generate with `crypto.randomBytes(32).toString('hex')` — 256 bits of entropy
- Hash with bcrypt before storing (same as password hashing)
- Send the plaintext key to the client exactly once at creation — never store or show it again
- If a key is lost, revoke and regenerate — never retrieve

---

### Future-3 · Redis for scale

**When to add Redis:** When you add API key validation (every request hits the DB) or when you run more than one server instance.

**Three uses:**

1. **Rate limit store** (`rate-limit-redis`):
   Replace the in-memory store. Counters survive restarts and are shared across all instances.

2. **API key cache**:
   Cache `sha256(apiKey) → clientRecord` with a 5-minute TTL.
   Eliminates the DB lookup on every authenticated request.
   Cache invalidation: when a key is revoked, delete its cache entry immediately.

3. **Usage counter batching**:
   Instead of writing a `usage_logs` row on every request (expensive at scale):
   - Increment `INCR usage:{clientId}:{endpoint}:{minute}` in Redis
   - A background job runs every 60 seconds, reads all counters, bulk-inserts to PostgreSQL, resets counters

---

## Dependency Summary

| Package | What for | When |
|---------|----------|------|
| `express-rate-limit` | Rate limiting | P1 |
| `cors` | CORS headers | P1 |
| `helmet` | Security headers | P1 |
| `compression` | Gzip responses | P1 |
| `morgan` | Request logging | P2 |
| `swagger-ui-express` | Serve API docs | P3 |
| `swagger-jsdoc` | Generate OpenAPI spec | P3 |
| `@sentry/node` | Error tracking | P3 |
| `vitest` | Unit + integration tests | P3 |
| `supertest` | HTTP integration tests | P3 |
| `pg` | PostgreSQL driver | Future |
| `redis` / `ioredis` | Redis client | Future |
| `rate-limit-redis` | Redis-backed rate limit store | Future |
| `bcrypt` | Hash API keys | Future |

---

## Quick Reference — Priority Checklist

| # | Priority | Task | Status |
|---|----------|------|--------|
| 1 | P0 | Fix `split("")` → `split(" ")` bug | ⬜ |
| 2 | P0 | Fix off-by-one in `randomIntNumber` | ⬜ |
| 3 | P0 | Fix address parsed as country | ⬜ |
| 4 | P0 | Remove unused DB import from app.ts | ⬜ |
| 5 | P1 | Add `/api/v1/users?count=N` versioned route | ⬜ |
| 6 | P1 | Add rate limiting (express-rate-limit) | ⬜ |
| 7 | P1 | Add CORS + Helmet + Compression middleware | ⬜ |
| 8 | P1 | Fix error handler + add 404 handler | ⬜ |
| 9 | P1 | Add graceful shutdown | ⬜ |
| 10 | P2 | Refactor to routes/controllers/services | ⬜ |
| 11 | P2 | Expand user schema (id, username, phone, dob, avatar) | ⬜ |
| 12 | P2 | Add centralized config module | ⬜ |
| 13 | P2 | Add request logging + request IDs | ⬜ |
| 14 | P2 | Fix tsconfig.json | ⬜ |
| 15 | P3 | Add Swagger docs at /docs | ⬜ |
| 16 | P3 | Add unit + integration tests | ⬜ |
| 17 | P3 | Add Dockerfile + .env.example + README | ⬜ |
| 18 | P3 | Add GitHub Actions CI/CD pipeline | ⬜ |
| 19 | P3 | Add Sentry error tracking | ⬜ |
| 20 | P3 | Load test before going live (k6 or Artillery) | ⬜ |
| 21 | Future | Migrate SQLite → PostgreSQL | ⬜ |
| 22 | Future | Add client API key system | ⬜ |
| 23 | Future | Add Redis (rate limit store + key cache + usage batching) | ⬜ |
