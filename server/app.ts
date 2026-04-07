import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import swaggerUi from "swagger-ui-express";

import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { requestLogger } from "./middleware/requestLogger";
import v1Routes from "./routes/index";
import { swaggerSpec } from "./swagger";
import { getHome } from "./controllers/home.controller";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  "/swagger",
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
);

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(requestLogger);

app.get("/", getHome);

app.use("/api", v1Routes);
app.use(notFound);
app.use(errorHandler);

export default app;
