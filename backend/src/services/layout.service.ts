import { Types } from "mongoose";

import {
  DEFAULT_CANVAS,
  DEFAULT_LAYOUT_NODES,
} from "../constants/default-layout.js";
import { LayoutModel } from "../models/layout.model.js";
import { PageModel } from "../models/page.model.js";

export type LayoutNode = Record<string, unknown>;

export type LayoutPayload = {
  version?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  nodes: LayoutNode[];
};

const cloneNodes = () =>
  JSON.parse(JSON.stringify(DEFAULT_LAYOUT_NODES)) as LayoutNode[];

const toLayoutResponse = (layout: {
  pageId: unknown;
  status: string;
  version: number;
  canvasWidth: number;
  canvasHeight: number;
  nodes: LayoutNode[];
  updatedAt?: Date;
}) => ({
  pageId: String(layout.pageId),
  status: layout.status,
  version: layout.version,
  canvasWidth: layout.canvasWidth,
  canvasHeight: layout.canvasHeight,
  nodes: layout.nodes,
  updatedAt: layout.updatedAt,
});

export const ensureDemoPage = async () => {
  let page = await PageModel.findOne({ slug: "home" });
  if (!page) {
    page = await PageModel.create({
      slug: "home",
      title: "Home",
      isHome: true,
      metaTitle: "Home",
      metaDescription: "Demo home page",
    });
  }

  const existingDraft = await LayoutModel.findOne({
    pageId: page._id,
    status: "draft",
  });

  if (!existingDraft) {
    await LayoutModel.create({
      pageId: page._id,
      status: "draft",
      version: 1,
      ...DEFAULT_CANVAS,
      nodes: cloneNodes(),
    });
  }

  return page;
};

export const listPages = async () => {
  const pages = await PageModel.find().sort({ createdAt: 1 }).lean();
  return pages.map((page) => ({
    id: String(page._id),
    slug: page.slug,
    title: page.title,
    isHome: page.isHome,
    updatedAt: page.updatedAt,
  }));
};

export const getLayout = async (
  pageId: string,
  status: "draft" | "published" = "draft",
) => {
  if (!Types.ObjectId.isValid(pageId)) {
    throw new Error("Invalid page id");
  }

  const layout = await LayoutModel.findOne({
    pageId: new Types.ObjectId(pageId),
    status,
  }).lean();

  if (!layout) {
    throw new Error(`${status} layout not found`);
  }

  return toLayoutResponse(layout);
};

export const saveDraftLayout = async (pageId: string, payload: LayoutPayload) => {
  if (!Types.ObjectId.isValid(pageId)) {
    throw new Error("Invalid page id");
  }

  const objectId = new Types.ObjectId(pageId);
  const existing = await LayoutModel.findOne({ pageId: objectId, status: "draft" });

  if (existing && payload.version != null && payload.version !== existing.version) {
    const error = new Error("Version conflict");
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const nextVersion = (existing?.version ?? 0) + 1;

  const updated = await LayoutModel.findOneAndUpdate(
    { pageId: objectId, status: "draft" },
    {
      $set: {
        canvasWidth: payload.canvasWidth ?? existing?.canvasWidth ?? DEFAULT_CANVAS.canvasWidth,
        canvasHeight:
          payload.canvasHeight ?? existing?.canvasHeight ?? DEFAULT_CANVAS.canvasHeight,
        nodes: payload.nodes,
        version: nextVersion,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

  return toLayoutResponse(updated!);
};

export const resetDraftLayout = async (pageId: string) => {
  return saveDraftLayout(pageId, {
    ...DEFAULT_CANVAS,
    nodes: cloneNodes(),
  });
};

export const publishLayout = async (pageId: string) => {
  const draft = await LayoutModel.findOne({
    pageId: new Types.ObjectId(pageId),
    status: "draft",
  }).lean();

  if (!draft) {
    throw new Error("Draft layout not found");
  }

  const published = await LayoutModel.findOneAndUpdate(
    { pageId: new Types.ObjectId(pageId), status: "published" },
    {
      $set: {
        canvasWidth: draft.canvasWidth,
        canvasHeight: draft.canvasHeight,
        nodes: draft.nodes,
        version: draft.version,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

  return toLayoutResponse(published!);
};
