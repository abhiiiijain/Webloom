import { useCallback, useEffect, useRef } from "react";
import clsx from "clsx";

import type {
  BuilderLayout,
  BuilderNode,
  LayoutDragPlacement,
  ResizeHandle,
} from "../types/layout-node.types";
import { isFullWidthNode } from "../utils/section.utils";
import { autoFitTextHeight } from "../utils/auto-fit.utils";
import { getComponentDefinition } from "@/constants/component-catalog.constants";
import { nodeToWrapperStyle } from "../utils/layout-to-style.utils";
import { BuilderElementContent } from "./builder-element-content.component";

import styles from "@/styles/builder.module.scss";

type BuilderElementProps = {
  node: BuilderNode;
  sectionX: number;
  sectionY: number;
  scale?: number;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onLayoutChange: (
    nodeId: string,
    patch: Partial<BuilderLayout>,
    drag?: LayoutDragPlacement,
  ) => void;
};

const RESIZE_HANDLES: ResizeHandle[] = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
];
const SPACER_HANDLES: ResizeHandle[] = ["n", "s"];

export const BuilderElement = ({
  node,
  sectionX,
  sectionY,
  scale = 1,
  isSelected,
  onSelect,
  onLayoutChange,
}: BuilderElementProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const definition = getComponentDefinition(node.type);

  const runAutoFit = useCallback(() => {
    if (!definition?.autoFitHeight || !contentRef.current) return;
    const nextHeight = autoFitTextHeight(contentRef.current);
    if (nextHeight !== node.layout.height) {
      onLayoutChange(node.id, { height: nextHeight });
    }
  }, [
    definition?.autoFitHeight,
    node.id,
    node.layout.height,
    onLayoutChange,
  ]);

  useEffect(() => {
    runAutoFit();
  }, [node.content.text, node.layout.width, node.style.fontSize, runAutoFit]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelect(node.id);

    const startX = event.clientX;
    const startY = event.clientY;
    const originCanvasX = sectionX + node.layout.x;
    const originCanvasY = sectionY + node.layout.y;
    const grabOffsetY =
      (event.clientY - event.currentTarget.getBoundingClientRect().top) / scale;
    const lockX = isFullWidthNode(node.type);

    const onMove = (moveEvent: PointerEvent) => {
      const canvasX = lockX
        ? originCanvasX
        : originCanvasX + (moveEvent.clientX - startX) / scale;
      const canvasY = originCanvasY + (moveEvent.clientY - startY) / scale;
      onLayoutChange(
        node.id,
        {},
        {
          canvasX,
          canvasY,
          hitCanvasY: canvasY + grabOffsetY,
        },
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startResize = (
    event: React.PointerEvent<HTMLButtonElement>,
    handle: ResizeHandle,
  ) => {
    if (!definition?.resizable) return;
    event.stopPropagation();
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const origin = { ...node.layout };
    const originWidth = typeof origin.width === "number" ? origin.width : 200;
    const originHeight = typeof origin.height === "number" ? origin.height : 40;
    const lockWidth = isFullWidthNode(node.type);

    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / scale;
      const dy = (moveEvent.clientY - startY) / scale;
      let x = origin.x;
      let y = origin.y;
      let width = originWidth;
      let height = originHeight;

      if (!lockWidth) {
        if (handle.includes("e")) width = originWidth + dx;
        if (handle.includes("w")) {
          width = originWidth - dx;
          x = origin.x + dx;
        }
      }
      if (handle.includes("s")) height = originHeight + dy;
      if (handle.includes("n")) {
        height = originHeight - dy;
        y = origin.y + dy;
      }

      if (moveEvent.shiftKey && node.type === "image") {
        const ratio = originWidth / originHeight;
        if (Math.abs(dx) > Math.abs(dy)) {
          height = width / ratio;
        } else {
          width = height * ratio;
        }
      }

      onLayoutChange(node.id, { x, y, width, height });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      runAutoFit();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      className={clsx(styles.builderElement, {
        [styles.builderElementSelected]: isSelected,
      })}
      style={nodeToWrapperStyle(node)}
      aria-label={`${definition?.label ?? node.type} block`}
      role="group"
      onPointerDown={startDrag}
    >
      <div ref={contentRef} className={styles.builderElementInner}>
        <BuilderElementContent node={node} />
      </div>

      {isSelected && definition?.resizable
        ? (isFullWidthNode(node.type) ? SPACER_HANDLES : RESIZE_HANDLES).map(
            (handle) => (
            <button
              key={handle}
              type="button"
              aria-label={`Resize ${handle}`}
              className={clsx(
                styles.resizeHandle,
                styles[`resizeHandle_${handle}`],
              )}
              onPointerDown={(event) => startResize(event, handle)}
            />
          ))
        : null}
    </div>
  );
};
