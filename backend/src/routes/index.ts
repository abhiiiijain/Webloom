import type { NextFunction, Request, Response } from "express";
import { Router } from "express";

import { env } from "../config/env.js";
import {
  getLayout,
  listPages,
  publishLayout,
  resetDraftLayout,
  saveDraftLayout,
} from "../services/layout.service.js";
import { sendError, sendSuccess } from "../utils/api-response.js";

export const pagesRouter = Router();

pagesRouter.get("/", async (_req, res, next) => {
  try {
    const pages = await listPages();
    sendSuccess(res, { pages });
  } catch (error) {
    next(error);
  }
});

pagesRouter.get("/:pageId/layout/draft", async (req, res, next) => {
  try {
    const layout = await getLayout(req.params.pageId, "draft");
    sendSuccess(res, layout);
  } catch (error) {
    next(error);
  }
});

pagesRouter.get("/:pageId/layout/published", async (req, res, next) => {
  try {
    const layout = await getLayout(req.params.pageId, "published");
    sendSuccess(res, layout);
  } catch (error) {
    next(error);
  }
});

pagesRouter.put("/:pageId/layout/draft", async (req, res, next) => {
  try {
    const layout = await saveDraftLayout(req.params.pageId, req.body);
    sendSuccess(res, layout, "Draft saved");
  } catch (error) {
    next(error);
  }
});

pagesRouter.post("/:pageId/layout/publish", async (req, res, next) => {
  try {
    const layout = await publishLayout(req.params.pageId);
    sendSuccess(res, layout, "Layout published");
  } catch (error) {
    next(error);
  }
});

pagesRouter.post("/:pageId/layout/reset", async (req, res, next) => {
  try {
    const layout = await resetDraftLayout(req.params.pageId);
    sendSuccess(res, layout, "Draft reset");
  } catch (error) {
    next(error);
  }
});

export const errorHandler = (
  error: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = error.statusCode ?? 500;
  if (status >= 500) {
    console.error(error);
  }
  const message =
    status >= 500 && env.isProduction
      ? "Internal server error"
      : error.message || "Internal server error";
  sendError(res, message, status);
};
