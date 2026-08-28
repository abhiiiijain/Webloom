import type {
  BuilderLayoutState,
  BuilderNode,
} from "../types/layout-node.types";
import { constrainToCanvas, isSameLayoutBox, parseSize } from "./auto-fit.utils";

export const MIN_SECTION_HEIGHT = 80;
export const DEFAULT_SECTION_HEIGHT = 200;
const EMPTY_CANVAS_HEIGHT = 640;

export const isFullWidthNode = (type: BuilderNode["type"]) =>
  type === "spacer" || type === "divider";

export const snapSectionHeight = (value: number) =>
  Math.max(MIN_SECTION_HEIGHT, Math.round(value));

export const sectionHeight = (section: BuilderNode, fallback = DEFAULT_SECTION_HEIGHT) =>
  snapSectionHeight(parseSize(section.layout.height, fallback));

export const getSections = (nodes: BuilderNode[]) =>
  nodes
    .filter((node) => node.type === "section")
    .sort((a, b) => a.displayOrder - b.displayOrder);

export const getSectionChildren = (nodes: BuilderNode[], sectionId: string) =>
  nodes
    .filter((node) => node.type !== "section" && node.parentId === sectionId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

const createDefaultSection = (
  id: string,
  name: string,
  displayOrder: number,
  height: number,
): BuilderNode => ({
  id,
  type: "section",
  parentId: null,
  displayOrder,
  layout: {
    mode: "absolute",
    x: 0,
    y: 0,
    width: "100%",
    height,
    minHeight: MIN_SECTION_HEIGHT,
    zIndex: 0,
  },
  style: {
    backgroundColor: "#ffffff",
  },
  content: { name },
});

export const restackSections = (
  nodes: BuilderNode[],
  canvasWidth: number,
): { nodes: BuilderNode[]; canvasHeight: number } => {
  const sections = getSections(nodes);
  let y = 0;
  const stacked = new Map<string, BuilderNode>();

  for (const section of sections) {
    const height = sectionHeight(section);
    stacked.set(section.id, {
      ...section,
      layout: {
        ...section.layout,
        x: 0,
        y,
        width: canvasWidth,
        height,
        minHeight: MIN_SECTION_HEIGHT,
      },
    });
    y += height;
  }

  return {
    canvasHeight: y || EMPTY_CANVAS_HEIGHT,
    nodes: nodes.map((node) => stacked.get(node.id) ?? node),
  };
};

export const findSectionAtCanvasY = (sections: BuilderNode[], canvasY: number) => {
  if (sections.length === 0) return null;
  const first = sections[0];
  if (canvasY < first.layout.y) return first;

  for (const section of sections) {
    const top = section.layout.y;
    const height = sectionHeight(section);
    if (canvasY >= top && canvasY < top + height) return section;
  }
  return sections[sections.length - 1] ?? null;
};

/** Place a node at a canvas point, reparenting into the section under `hitCanvasY`. */
export const relocateNodeToCanvasPoint = (
  node: BuilderNode,
  canvasX: number,
  canvasY: number,
  sections: BuilderNode[],
  canvasWidth: number,
  canvasHeight: number,
  hitCanvasY = canvasY,
): BuilderNode => {
  const currentParent = node.parentId
    ? sections.find((section) => section.id === node.parentId)
    : undefined;
  const target =
    findSectionAtCanvasY(sections, hitCanvasY) ?? currentParent ?? sections[0];
  if (!target) return node;

  return constrainToSection(
    {
      ...node,
      parentId: target.id,
      layout: {
        ...node.layout,
        x: isFullWidthNode(node.type) ? 0 : canvasX - target.layout.x,
        y: canvasY - target.layout.y,
      },
    },
    target,
    canvasWidth,
    canvasHeight,
  );
};

export const resolveParentSectionId = (
  nodes: BuilderNode[],
  selectedNodeId: string | null,
) => {
  const selected = nodes.find((node) => node.id === selectedNodeId);
  if (selected?.type === "section") return selected.id;
  if (selected?.parentId) {
    const parent = nodes.find((node) => node.id === selected.parentId);
    if (parent?.type === "section") return parent.id;
  }
  return getSections(nodes)[0]?.id ?? null;
};

export const constrainToSection = (
  node: BuilderNode,
  section: BuilderNode | undefined,
  canvasWidth: number,
  canvasHeight: number,
) => {
  const next = {
    ...node,
    layout: constrainToCanvas(
      node.layout,
      canvasWidth,
      section ? sectionHeight(section) : canvasHeight,
    ),
  };

  const constrained = isFullWidthNode(next.type)
    ? { ...next, layout: { ...next.layout, x: 0, width: canvasWidth } }
    : next;

  return isSameLayoutBox(constrained.layout, node.layout) ? node : constrained;
};

/** Restack sections and pin every child inside its parent. */
export const restackAndConstrain = (
  nodes: BuilderNode[],
  canvasWidth: number,
) => {
  const stacked = restackSections(nodes, canvasWidth);
  const sectionsById = new Map(
    getSections(stacked.nodes).map((section) => [section.id, section]),
  );

  return {
    canvasHeight: stacked.canvasHeight,
    nodes: stacked.nodes.map((node) => {
      if (node.type === "section") return node;
      return constrainToSection(
        node,
        node.parentId ? sectionsById.get(node.parentId) : undefined,
        canvasWidth,
        stacked.canvasHeight,
      );
    }),
  };
};

export const normalizeSectionLayout = <T extends BuilderLayoutState>(
  state: T,
): T => {
  const nodeIds = new Set(state.nodes.map((node) => node.id));
  const firstSectionId = getSections(state.nodes)[0]?.id;

  let nodes: BuilderNode[] = state.nodes.map((node) => {
    if (node.type !== "section") {
      const parentId =
        node.parentId && nodeIds.has(node.parentId)
          ? node.parentId
          : firstSectionId ?? node.parentId;
      return parentId === node.parentId ? node : { ...node, parentId };
    }

    const height =
      typeof node.layout.height === "string"
        ? parseSize(node.layout.height, state.canvasHeight, state.canvasHeight)
        : parseSize(node.layout.height, state.canvasHeight);
    const snappedHeight = snapSectionHeight(height);
    const name = node.content.name?.trim() || "Section";

    if (
      node.parentId === null &&
      node.content.name === name &&
      node.layout.height === snappedHeight
    ) {
      return node;
    }

    return {
      ...node,
      parentId: null,
      content: {
        ...node.content,
        name,
      },
      layout: {
        ...node.layout,
        height: snappedHeight,
      },
    };
  });

  if (getSections(nodes).length === 0) {
    const orphans = nodes.filter((node) => node.type !== "section");
    if (orphans.length === 0) {
      return {
        ...state,
        nodes: [],
        canvasHeight: EMPTY_CANVAS_HEIGHT,
      };
    }

    const fallback = createDefaultSection(
      "section_root",
      "Section 1",
      0,
      Math.max(MIN_SECTION_HEIGHT, state.canvasHeight || DEFAULT_SECTION_HEIGHT),
    );
    nodes = [
      fallback,
      ...orphans.map((node) => ({ ...node, parentId: fallback.id })),
    ];
  }

  const stacked = restackAndConstrain(nodes, state.canvasWidth);

  return {
    ...state,
    nodes: stacked.nodes,
    canvasHeight: stacked.canvasHeight,
  };
};
