import { useRef } from "react";
import { Select } from "@mantine/core";

import { useCanvasFitScale } from "@/hooks/use-canvas-fit-scale";
import type {
  BuilderLayout,
  BuilderNode,
  LayoutDragPlacement,
} from "@/types/layout-node.types";
import {
  CANVAS_SIZE_OPTIONS,
  parseCanvasSizeValue,
} from "@/constants/canvas-size.constants";
import { BuilderSection } from "./builder-section.component";

import styles from "@/styles/builder.module.scss";

type BuilderCanvasProps = {
  width: number;
  height: number;
  nodes: BuilderNode[];
  sections: BuilderNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onCanvasSizeChange: (width: number) => void;
  onLayoutChange: (
    nodeId: string,
    patch: Partial<BuilderLayout>,
    drag?: LayoutDragPlacement,
  ) => void;
  onDropComponent: (
    type: BuilderNode["type"],
    position: { x: number; y: number },
  ) => void;
};

export const BuilderCanvas = ({
  width,
  height,
  nodes,
  sections,
  selectedNodeId,
  onSelectNode,
  onCanvasSizeChange,
  onLayoutChange,
  onDropComponent,
}: BuilderCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const scale = useCanvasFitScale(shellRef, width);
  const elementCount = nodes.length - sections.length;
  const currentSizeValue = String(width);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/x-builder-component");
    if (!type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    onDropComponent(type as BuilderNode["type"], {
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale,
    });
  };

  const handleSizeChange = (value: string | null) => {
    const nextWidth = parseCanvasSizeValue(value);
    if (!nextWidth) return;
    onCanvasSizeChange(nextWidth);
  };

  return (
    <div className={styles.canvasArea}>
      <div className={styles.canvasToolbar}>
        <span className={styles.canvasToolbarLabel}>Canvas</span>
        <div className={styles.canvasToolbarActions}>
          <Select
            aria-label="Canvas width"
            size="xs"
            w={200}
            allowDeselect={false}
            data={CANVAS_SIZE_OPTIONS}
            value={currentSizeValue}
            onChange={handleSizeChange}
            comboboxProps={{ withinPortal: true }}
          />
          <span className={styles.canvasToolbarMeta}>
            {width} × {height} · {Math.round(scale * 100)}% · {sections.length}{" "}
            section{sections.length === 1 ? "" : "s"} · {elementCount} element
            {elementCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div ref={shellRef} className={styles.canvasShell}>
        <div
          className={styles.canvasScaleWrap}
          style={{ width: width * scale, height: height * scale }}
        >
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            onPointerDown={() => onSelectNode(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            {sections.length === 0 ? (
              <div className={styles.canvasEmpty}>
                Add a section to start building
              </div>
            ) : (
              sections.map((section) => (
                <BuilderSection
                  key={section.id}
                  section={section}
                  nodes={nodes}
                  scale={scale}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onLayoutChange={onLayoutChange}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
