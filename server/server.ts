import "dotenv/config";
import app from "./app";
import { config } from "./config";

const server = app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});

const shutdown = () => {
  server.close(() => {
    console.log("Server shut down gracefully.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
