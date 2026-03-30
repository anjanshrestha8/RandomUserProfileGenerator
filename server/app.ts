import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import v1Routes from "./routes/index";

const app = express();
app.use(express.json());

app.use("/api", v1Routes);
app.use(notFound);
app.use(errorHandler);

export default app;
