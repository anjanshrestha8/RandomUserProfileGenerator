import express, { Request, Response, NextFunction } from "express";
import { generateRandomUser } from "./src/utils/userGenerator";
import v1Routes from "./routes/index";

const app = express();
app.use(express.json());

app.use("/api", v1Routes);

export default app;
