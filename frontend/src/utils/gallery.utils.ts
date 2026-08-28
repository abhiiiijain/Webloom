import type { BuilderContent } from "../types/layout-node.types";
import { clamp } from "./auto-fit.utils";

export const MIN_GALLERY_COLUMNS = 1;
export const MAX_GALLERY_COLUMNS = 6;
export const MIN_GALLERY_ROWS = 1;
export const MAX_GALLERY_ROWS = 6;

const snapCount = (value: number | undefined, min: number, max: number, fallback: number) =>
  clamp(Math.round(value ?? fallback), min, max);

const resizeGalleryUrls = (urls: string[] | undefined, count: number) => {
  const current = urls ?? [];
  if (current.length === count) return current;
  if (current.length > count) return current.slice(0, count);
  return [...current, ...Array.from({ length: count - current.length }, () => "")];
};

export const resolveGalleryGrid = (content: BuilderContent) => {
  const columns = snapCount(
    content.galleryColumns,
    MIN_GALLERY_COLUMNS,
    MAX_GALLERY_COLUMNS,
    1,
  );
  const rows = snapCount(
    content.galleryRows,
    MIN_GALLERY_ROWS,
    MAX_GALLERY_ROWS,
    1,
  );
  const imageUrls = resizeGalleryUrls(content.imageUrls, columns * rows);

  return { columns, rows, imageUrls };
};

export const applyGalleryGrid = (
  content: BuilderContent,
  patch: Pick<BuilderContent, "galleryColumns" | "galleryRows">,
) => {
  const next = resolveGalleryGrid({ ...content, ...patch });
  return {
    galleryColumns: next.columns,
    galleryRows: next.rows,
    imageUrls: next.imageUrls,
  };
};
