import { Schema, model } from "mongoose";

const layoutSchema = new Schema(
  {
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      required: true,
      default: "draft",
    },
    version: { type: Number, required: true, default: 1 },
    canvasWidth: { type: Number, required: true, default: 1440 },
    canvasHeight: { type: Number, required: true, default: 640 },
    nodes: { type: [Schema.Types.Mixed], required: true, default: [] },
  },
  { timestamps: true },
);

layoutSchema.index({ pageId: 1, status: 1 }, { unique: true });

export const LayoutModel = model("Layout", layoutSchema);
