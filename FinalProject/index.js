import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import debug from "debug";
const debugServer = debug("app:server");

import { authMiddleware } from "@merlin4/express-auth";

import { userRouter } from "./routes/api/user.js";
import { bugRouter } from "./routes/api/bugs.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("frontend/dist"));

const allowedOrigins = [
  "https://semiotic-runner-433715-b2.uc.r.appspot.com",
  "http://localhost:2024", // your Vite dev server, if you test against deployed backend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(
  authMiddleware(process.env.JWT_SECRET, "authToken", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  }),
);

app.use("/api/users", userRouter);
app.use("/api/bugs", bugRouter);

//handle server exceptions to keep my server from crashing
app.use((err, req, res, next) => {
  res.status(err.status).json({ error: err.message });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  debugServer(`Server is running on http://localhost:${port}`);
});
