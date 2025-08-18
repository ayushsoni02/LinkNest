import express, { Express } from "express";
import cors from "cors";
import userRouter from "./routes/user.route";
import contentRouter from "./routes/content.route";
import brainRouter from "./routes/brain.route";

const app: Express = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/content", contentRouter);
app.use("/api/v1/brain", brainRouter);

export { app }; 