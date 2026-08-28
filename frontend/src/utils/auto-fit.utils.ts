import type { BuilderLayout } from "../types/layout-node.types";

export const BUILDER_GRID_SIZE = 8;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const snapToGrid = (value: number, gridSize = BUILDER_GRID_SIZE) =>
  Math.round(value / gridSize) * gridSize;

export const parseSize = (
  value: number | string | undefined,
  fallback: number,
  relativeTo?: number,
) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.endsWith("%")) {
    const pct = Number.parseFloat(value);
    if (!Number.isFinite(pct)) return fallback;
    return relativeTo != null ? (pct / 100) * relativeTo : pct;
  }
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const isSameLayoutBox = (a: BuilderLayout, b: BuilderLayout) =>
  a.x === b.x &&
  a.y === b.y &&
  a.width === b.width &&
  a.height === b.height;

/** Keep node inside canvas while dragging/resizing. */
export const constrainToCanvas = (
  layout: BuilderLayout,
  canvasWidth: number,
  canvasHeight: number,
): BuilderLayout => {
  const keepWidth = typeof layout.width === "string";
  const keepHeight = typeof layout.height === "string";
  const width = parseSize(layout.width, 100, canvasWidth);
  const height = parseSize(layout.height, 40, canvasHeight);
  const maxX = Math.max(0, canvasWidth - width);
  const maxY = Math.max(0, canvasHeight - height);

  return {
    ...layout,
    x: clamp(snapToGrid(layout.x), 0, maxX),
    y: clamp(snapToGrid(layout.y), 0, maxY),
    width: keepWidth
      ? layout.width
      : clamp(snapToGrid(width), layout.minWidth ?? 40, layout.maxWidth ?? canvasWidth),
    height: keepHeight
      ? layout.height
      : clamp(
          snapToGrid(height),
          layout.minHeight ?? 24,
          layout.maxHeight ?? canvasHeight,
        ),
  };
};

/** Auto-grow text block height to fit content (measured from DOM). */
export const autoFitTextHeight = (
  element: HTMLElement,
  minHeight = 24,
  maxHeight = 600,
): number => {
  const measured = Math.ceil(element.scrollHeight);
  return clamp(snapToGrid(Math.max(measured, minHeight)), minHeight, maxHeight);
};
