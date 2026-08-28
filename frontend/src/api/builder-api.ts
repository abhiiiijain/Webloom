import { API_BASE } from "@/config/env";
import type {
  BuilderLayoutState,
  BuilderNode,
} from "@/types/layout-node.types";
import { normalizeSectionLayout } from "@/utils/section.utils";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PageSummary = {
  id: string;
  slug: string;
  title: string;
  isHome: boolean;
  updatedAt: string;
};

export type LayoutResponse = {
  pageId: string;
  status: "draft" | "published";
  version: number;
  canvasWidth: number;
  canvasHeight: number;
  nodes: BuilderNode[];
  updatedAt?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  let body: ApiEnvelope<T> | { success: false; message: string };
  try {
    body = (await response.json()) as
      | ApiEnvelope<T>
      | { success: false; message: string };
  } catch {
    throw new Error(
      response.ok
        ? "Save failed: the server sent an invalid response"
        : `Request failed (${response.status})`,
    );
  }

  if (!response.ok || !("success" in body) || !body.success) {
    const message =
      "message" in body && typeof body.message === "string"
        ? body.message
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body.data;
}

/** Layout APIs used by the builder (bulk draft save pattern). */
export const builderApi = {
  listPages: () =>
    request<{ pages: PageSummary[] }>("/pages").then((data) => data.pages),

  getDraftLayout: (pageId: string) =>
    request<LayoutResponse>(`/pages/${pageId}/layout/draft`),

  getPublishedLayout: (pageId: string) =>
    request<LayoutResponse>(`/pages/${pageId}/layout/published`),

  saveDraftLayout: (pageId: string, payload: BuilderLayoutState & { version?: number }) =>
    request<LayoutResponse>(`/pages/${pageId}/layout/draft`, {
      method: "PUT",
      body: JSON.stringify({
        version: payload.version,
        canvasWidth: payload.canvasWidth,
        canvasHeight: payload.canvasHeight,
        nodes: payload.nodes,
      }),
    }),

  publishLayout: (pageId: string) =>
    request<LayoutResponse>(`/pages/${pageId}/layout/publish`, {
      method: "POST",
    }),

  resetDraftLayout: (pageId: string) =>
    request<LayoutResponse>(`/pages/${pageId}/layout/reset`, {
      method: "POST",
    }),
};

export const layoutResponseToState = (
  layout: LayoutResponse,
): BuilderLayoutState & { version: number } =>
  normalizeSectionLayout({
    pageId: layout.pageId,
    canvasWidth: layout.canvasWidth,
    canvasHeight: layout.canvasHeight,
    nodes: layout.nodes,
    version: layout.version,
  });
