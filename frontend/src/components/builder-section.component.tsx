import clsx from "clsx";

import type {
  BuilderLayout,
  BuilderNode,
  LayoutDragPlacement,
} from "@/types/layout-node.types";
import {
  getSectionChildren,
  sectionHeight,
  snapSectionHeight,
} from "@/utils/section.utils";
import { BuilderElement } from "./builder-element.component";

import styles from "@/styles/builder.module.scss";

type BuilderSectionProps = {
  section: BuilderNode;
  nodes: BuilderNode[];
  scale: number;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onLayoutChange: (
    nodeId: string,
    patch: Partial<BuilderLayout>,
    drag?: LayoutDragPlacement,
  ) => void;
};

export const BuilderSection = ({
  section,
  nodes,
  scale,
  selectedNodeId,
  onSelectNode,
  onLayoutChange,
}: BuilderSectionProps) => {
  const isSelected = selectedNodeId === section.id;
  const height = sectionHeight(section);
  const children = getSectionChildren(nodes, section.id);

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    const startY = event.clientY;
    const originHeight = height;

    const onMove = (moveEvent: PointerEvent) => {
      onLayoutChange(section.id, {
        height: snapSectionHeight(
          originHeight + (moveEvent.clientY - startY) / scale,
        ),
      });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      className={clsx(styles.builderSection, {
        [styles.builderSectionSelected]: isSelected,
      })}
      style={{
        height,
        backgroundColor: section.style.backgroundColor || "#ffffff",
      }}
      aria-label={section.content.name || "Section"}
      role="region"
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelectNode(section.id);
      }}
    >
      <div className={styles.builderSectionLabel}>
        {section.content.name || "Section"}
      </div>

      {children.map((node) => (
        <BuilderElement
          key={node.id}
          node={node}
          sectionX={section.layout.x}
          sectionY={section.layout.y}
          scale={scale}
          isSelected={selectedNodeId === node.id}
          onSelect={onSelectNode}
          onLayoutChange={onLayoutChange}
        />
      ))}

      {isSelected ? (
        <button
          type="button"
          aria-label="Resize section height"
          className={clsx(styles.resizeHandle, styles.resizeHandle_s)}
          onPointerDown={startResize}
        />
      ) : null}
    </div>
  );
};
