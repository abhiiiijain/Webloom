import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { connectDb } from "./db/connect.js";
import { errorHandler, pagesRouter } from "./routes/index.js";
import { ensureDemoPage } from "./services/layout.service.js";
import { sendSuccess } from "./utils/api-response.js";
import { startKeepalivePinger } from "./utils/keepalive.js";
import { getUptime } from "./utils/uptime.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin:
      env.frontendOrigins.length > 0 ? env.frontendOrigins : true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  sendSuccess(res, {
    health: "/api/health",
    keepalive: "/api/keepalive",
    uptime: getUptime(),
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "OK", data: { status: "healthy" } });
});

app.get("/api/keepalive", (_req, res) => {
  res.json({
    success: true,
    message: "OK",
    data: { status: "alive", at: new Date().toISOString() },
  });
});

app.use("/api/pages", pagesRouter);
app.use(errorHandler);

const start = async () => {
  await connectDb();
  await ensureDemoPage();

  app.listen(env.port, "0.0.0.0", () => {
    console.log(`API listening on port ${env.port}`);
    startKeepalivePinger();
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
