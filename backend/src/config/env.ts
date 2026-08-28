import { existsSync } from "node:fs";
import dotenv from "dotenv";

const envFileFor = (mode: "development" | "production") => `.env.${mode}`;

const loadEnvFile = () => {
  const production = process.env.NODE_ENV === "production";
  const preferred = envFileFor(production ? "production" : "development");
  const fallback = envFileFor(production ? "development" : "production");

  if (existsSync(preferred)) {
    dotenv.config({ path: preferred });
    return;
  }
  if (existsSync(".env")) {
    dotenv.config();
    return;
  }
  if (existsSync(fallback)) {
    dotenv.config({ path: fallback });
  }
};

loadEnvFile();

const parseOrigins = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim().replace(/\/+$/, ""))
    .filter(Boolean);

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 4062),
  mongoUri:
    process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/website-builder-demo",
  frontendOrigins: parseOrigins(process.env.FRONTEND_ORIGIN),
};

export const redactMongoUri = (uri: string) =>
  uri.replace(/:\/\/([^:/@]+):([^@]+)@/, "://$1:***@");
