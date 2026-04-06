export const config = {
  port: Number(process.env.PORT) || 3000,
  dbPath: process.env.DB_PATH || "./data/RANDOM_USER_GENERATOR.db",
  nodeEnv: process.env.NODE_ENV || "development",
  rateLimitWindowMs: 1 * 60 * 1000,
  rateLimitMax: 10,
  maxUsersPerRequest: 50,
};
