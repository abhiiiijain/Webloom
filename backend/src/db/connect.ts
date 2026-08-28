import mongoose from "mongoose";

import { env, redactMongoUri } from "../config/env.js";

export const connectDb = async () => {
  await mongoose.connect(env.mongoUri);
  console.log(`MongoDB connected: ${redactMongoUri(env.mongoUri)}`);
};
