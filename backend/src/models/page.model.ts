import { Schema, model } from "mongoose";

const pageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    isHome: { type: Boolean, default: false },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true },
);

export const PageModel = model("Page", pageSchema);
