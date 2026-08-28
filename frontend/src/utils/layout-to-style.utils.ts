import type { CSSProperties } from "react";

import type { BuilderLayout, BuilderNode, BuilderStyle } from "../types/layout-node.types";

/** Convert builder style tokens → inline CSS for dynamic rendering. */
const styleToCss = (style: BuilderStyle): CSSProperties => ({
  backgroundColor: style.backgroundColor,
  color: style.color,
  fontFamily: style.fontFamily,
  fontSize: style.fontSize != null ? `${style.fontSize}px` : undefined,
  fontWeight: style.fontWeight,
  lineHeight: style.lineHeight,
  textAlign: style.textAlign,
  borderRadius: style.borderRadius != null ? `${style.borderRadius}px` : undefined,
  border: style.border,
  boxShadow: style.boxShadow,
  opacity: style.opacity,
  objectFit: style.objectFit,
});

/** Convert layout box → canvas positioning CSS. */
const layoutToCss = (layout: BuilderLayout): CSSProperties => ({
  position: "absolute",
  left: layout.x,
  top: layout.y,
  width: layout.width,
  height: layout.height,
  zIndex: layout.zIndex,
  minWidth: layout.minWidth,
  maxWidth: layout.maxWidth,
  minHeight: layout.minHeight,
  maxHeight: layout.maxHeight,
});

/** Merge layout + style for a canvas element wrapper. */
export const nodeToWrapperStyle = (node: BuilderNode): CSSProperties => ({
  ...layoutToCss(node.layout),
  ...styleToCss(node.style),
  boxSizing: "border-box",
  overflow: node.type === "text" || node.type === "heading" ? "hidden" : undefined,
});

/** Inner content style (fills wrapper, inherits typography). */
export const nodeToContentStyle = (node: BuilderNode): CSSProperties => ({
  width: "100%",
  height: "100%",
  color: "inherit",
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  lineHeight: node.style.lineHeight ?? 1.2,
  textAlign: node.style.textAlign,
  display: "flex",
  alignItems: "center",
  justifyContent:
    node.style.textAlign === "center"
      ? "center"
      : node.style.textAlign === "right"
        ? "flex-end"
        : "flex-start",
});
