import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { requestLogger } from "./middleware/requestLogger";
import v1Routes from "./routes/index";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(requestLogger);

app.use("/api", v1Routes);
app.use(notFound);
app.use(errorHandler);

export default app;
