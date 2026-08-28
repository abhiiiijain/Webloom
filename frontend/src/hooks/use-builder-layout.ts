import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  builderApi,
  layoutResponseToState,
  type PageSummary,
} from "@/api/builder-api";
import { createNodeFromType } from "@/constants/component-catalog.constants";
import { isSameLayoutBox } from "@/utils/auto-fit.utils";
import {
  constrainToSection,
  DEFAULT_SECTION_HEIGHT,
  findSectionAtCanvasY,
  getSections,
  isFullWidthNode,
  relocateNodeToCanvasPoint,
  resolveParentSectionId,
  restackAndConstrain,
  restackSections,
  sectionHeight,
  snapSectionHeight,
} from "@/utils/section.utils";
import type {
  BuilderLayout,
  BuilderLayoutState,
  BuilderNode,
  BuilderNodeType,
  BuilderStyle,
  BuilderContent,
  LayoutDragPlacement,
} from "@/types/layout-node.types";

type BuilderLayoutStateWithVersion = BuilderLayoutState & { version: number };

export const useBuilderLayout = () => {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [state, setState] = useState<BuilderLayoutStateWithVersion | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "published">("idle");
  const [isDirty, setIsDirty] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const saveQueuedRef = useRef(false);
  const saveChainRef = useRef(Promise.resolve<BuilderLayoutStateWithVersion | null>(null));
  const isDirtyRef = useRef(false);
  const stateRef = useRef<BuilderLayoutStateWithVersion | null>(null);
  stateRef.current = state;

  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
    setIsDirty(true);
    setSaveStatus((current) => (current === "saving" ? current : "idle"));
  }, []);

  const loadLayout = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const pageList = await builderApi.listPages();
      setPages(pageList);

      const activePage =
        pageList.find((page) => page.isHome) ?? pageList[0] ?? null;

      if (!activePage) {
        throw new Error("No pages found. Start MongoDB and restart the API.");
      }

      const layout = await builderApi.getDraftLayout(activePage.id);
      setState(layoutResponseToState(layout));
      isDirtyRef.current = false;
      setIsDirty(false);
      setSaveStatus("saved");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load layout");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLayout();
  }, [loadLayout]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const persistDraft = useCallback(async () => {
    const snapshot = stateRef.current;
    if (!snapshot) {
      throw new Error("Nothing to save");
    }

    setSaveStatus("saving");
    try {
      let saved;
      try {
        saved = await builderApi.saveDraftLayout(snapshot.pageId, snapshot);
      } catch (error) {
        const isConflict =
          error instanceof Error && error.message.includes("Version conflict");
        if (!isConflict) throw error;

        const latest = await builderApi.getDraftLayout(snapshot.pageId);
        saved = await builderApi.saveDraftLayout(snapshot.pageId, {
          ...snapshot,
          version: latest.version,
        });
      }

      const server = layoutResponseToState(saved);
      const local = stateRef.current;
      const editedDuringSave = Boolean(local && local !== snapshot);
      const next = editedDuringSave
        ? { ...local!, version: server.version }
        : server;

      stateRef.current = next;
      setState(next);
      isDirtyRef.current = editedDuringSave;
      setIsDirty(editedDuringSave);

      if (!editedDuringSave) {
        setSaveStatus("saved");
      }

      return next;
    } catch (error) {
      setSaveStatus("error");
      throw error;
    }
  }, []);

  const enqueueSave = useCallback(() => {
    if (saveQueuedRef.current) return;
    saveQueuedRef.current = true;
    saveChainRef.current = saveChainRef.current
      .catch(() => null)
      .then(async () => {
        saveQueuedRef.current = false;
        return persistDraft();
      });
  }, [persistDraft]);

  const flushSave = useCallback(async () => {
    if (!stateRef.current) {
      throw new Error("Nothing to save");
    }
    if (!isDirtyRef.current) {
      return stateRef.current;
    }

    let saved: BuilderLayoutStateWithVersion | null = null;
    do {
      enqueueSave();
      saved = await saveChainRef.current;
      if (!saved) {
        throw new Error("Nothing to save");
      }
    } while (isDirtyRef.current);

    return saved;
  }, [enqueueSave]);

  const saveLayout = useCallback(async () => {
    if (!stateRef.current || !isDirtyRef.current) return;
    enqueueSave();
    await saveChainRef.current;
  }, [enqueueSave]);

  const commitState = useCallback(
    (updater: (prev: BuilderLayoutStateWithVersion) => BuilderLayoutStateWithVersion) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        if (next === prev) return prev;
        stateRef.current = next;
        markDirty();
        return next;
      });
    },
    [markDirty],
  );

  const selectedNode = useMemo(
    () => state?.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [state?.nodes, selectedNodeId],
  );

  const sections = useMemo(
    () => getSections(state?.nodes ?? []),
    [state?.nodes],
  );

  const canDelete = Boolean(selectedNode);

  const patchNode = useCallback(
    (nodeId: string, mapper: (node: BuilderNode) => BuilderNode) => {
      commitState((prev) => {
        const current = prev.nodes.find((node) => node.id === nodeId);
        if (!current) return prev;
        const nextNode = mapper(current);
        if (nextNode === current) return prev;
        return {
          ...prev,
          nodes: prev.nodes.map((node) =>
            node.id === nodeId ? nextNode : node,
          ),
        };
      });
    },
    [commitState],
  );

  const updateNodeLayout = useCallback(
    (
      nodeId: string,
      layoutPatch: Partial<BuilderLayout>,
      drag?: LayoutDragPlacement,
    ) => {
      commitState((prev) => {
        const current = prev.nodes.find((node) => node.id === nodeId);
        if (!current) return prev;

        if (current.type === "section") {
          const currentHeight = sectionHeight(current);
          const nextHeight =
            layoutPatch.height == null
              ? currentHeight
              : snapSectionHeight(
                  Number(layoutPatch.height) || DEFAULT_SECTION_HEIGHT,
                );

          if (nextHeight === currentHeight) return prev;

          const stacked = restackAndConstrain(
            prev.nodes.map((node) =>
              node.id === nodeId
                ? { ...node, layout: { ...node.layout, height: nextHeight } }
                : node,
            ),
            prev.canvasWidth,
          );

          return {
            ...prev,
            canvasHeight: stacked.canvasHeight,
            nodes: stacked.nodes,
          };
        }

        if (drag) {
          const relocated = relocateNodeToCanvasPoint(
            { ...current, layout: { ...current.layout, ...layoutPatch } },
            drag.canvasX,
            drag.canvasY,
            getSections(prev.nodes),
            prev.canvasWidth,
            prev.canvasHeight,
            drag.hitCanvasY,
          );

          if (
            relocated.parentId === current.parentId &&
            isSameLayoutBox(relocated.layout, current.layout)
          ) {
            return prev;
          }

          return {
            ...prev,
            nodes: prev.nodes.map((node) =>
              node.id === nodeId ? relocated : node,
            ),
          };
        }

        const parent = prev.nodes.find((node) => node.id === current.parentId);
        const constrained = constrainToSection(
          { ...current, layout: { ...current.layout, ...layoutPatch } },
          parent?.type === "section" ? parent : undefined,
          prev.canvasWidth,
          prev.canvasHeight,
        );

        if (isSameLayoutBox(constrained.layout, current.layout)) {
          return prev;
        }

        return {
          ...prev,
          nodes: prev.nodes.map((node) =>
            node.id === nodeId ? constrained : node,
          ),
        };
      });
    },
    [commitState],
  );

  const updateNodeStyle = useCallback(
    (nodeId: string, stylePatch: Partial<BuilderStyle>) => {
      patchNode(nodeId, (node) => {
        if (
          Object.entries(stylePatch).every(
            ([key, value]) => node.style[key as keyof BuilderStyle] === value,
          )
        ) {
          return node;
        }
        return {
          ...node,
          style: { ...node.style, ...stylePatch },
        };
      });
    },
    [patchNode],
  );

  const updateNodeContent = useCallback(
    (nodeId: string, contentPatch: Partial<BuilderContent>) => {
      patchNode(nodeId, (node) => {
        if (
          Object.entries(contentPatch).every(
            ([key, value]) =>
              node.content[key as keyof BuilderContent] === value,
          )
        ) {
          return node;
        }
        return {
          ...node,
          content: { ...node.content, ...contentPatch },
        };
      });
    },
    [patchNode],
  );

  const moveNodeToSection = useCallback(
    (nodeId: string, sectionId: string) => {
      commitState((prev) => {
        const node = prev.nodes.find((item) => item.id === nodeId);
        const section = prev.nodes.find(
          (item) => item.id === sectionId && item.type === "section",
        );
        if (!node || !section || node.type === "section") return prev;
        if (node.parentId === sectionId) return prev;

        return {
          ...prev,
          nodes: prev.nodes.map((item) =>
            item.id === nodeId
              ? constrainToSection(
                  { ...item, parentId: sectionId },
                  section,
                  prev.canvasWidth,
                  prev.canvasHeight,
                )
              : item,
          ),
        };
      });
    },
    [commitState],
  );

  const reorderSection = useCallback(
    (sectionId: string, direction: -1 | 1) => {
      commitState((prev) => {
        const ordered = getSections(prev.nodes);
        const index = ordered.findIndex((section) => section.id === sectionId);
        const swapIndex = index + direction;
        if (index < 0 || swapIndex < 0 || swapIndex >= ordered.length) {
          return prev;
        }

        const current = ordered[index];
        const swap = ordered[swapIndex];
        const updated = prev.nodes.map((node) => {
          if (node.id === current.id) {
            return { ...node, displayOrder: swap.displayOrder };
          }
          if (node.id === swap.id) {
            return { ...node, displayOrder: current.displayOrder };
          }
          return node;
        });
        const stacked = restackSections(updated, prev.canvasWidth);

        return {
          ...prev,
          canvasHeight: stacked.canvasHeight,
          nodes: stacked.nodes,
        };
      });
    },
    [commitState],
  );

  const updateCanvasSize = useCallback(
    (width: number) => {
      commitState((prev) => {
        if (prev.canvasWidth === width) return prev;
        const stacked = restackAndConstrain(prev.nodes, width);
        return {
          ...prev,
          canvasWidth: width,
          canvasHeight: stacked.canvasHeight,
          nodes: stacked.nodes,
        };
      });
    },
    [commitState],
  );

  const addNode = useCallback(
    (type: BuilderNodeType, position?: { x: number; y: number }) => {
      const newNode = createNodeFromType(type, 0, position);

      commitState((prev) => {
        if (prev.nodes.some((node) => node.id === newNode.id)) return prev;

        const nextOrder =
          Math.max(0, ...prev.nodes.map((node) => node.displayOrder)) + 1;

        if (type === "section") {
          const sectionCount = getSections(prev.nodes).length;
          const stacked = restackSections(
            [
              ...prev.nodes,
              {
                ...newNode,
                displayOrder: nextOrder,
                content: { name: `Section ${sectionCount + 1}` },
                layout: {
                  ...newNode.layout,
                  height: DEFAULT_SECTION_HEIGHT,
                },
              },
            ],
            prev.canvasWidth,
          );

          return {
            ...prev,
            canvasHeight: stacked.canvasHeight,
            nodes: stacked.nodes,
          };
        }

        const sections = getSections(prev.nodes);
        const dropTarget =
          (position
            ? findSectionAtCanvasY(sections, position.y)
            : prev.nodes.find(
                (node) =>
                  node.id ===
                  resolveParentSectionId(prev.nodes, selectedNodeId),
              )) ?? sections[0];

        const createdSection =
          dropTarget?.type === "section"
            ? null
            : {
                ...createNodeFromType("section", nextOrder),
                content: { name: "Section 1" },
              };
        const parent =
          dropTarget?.type === "section" ? dropTarget : createdSection;
        if (!parent) return prev;

        const elementOrder = createdSection ? nextOrder + 1 : nextOrder;
        const relativePosition =
          position && dropTarget?.type === "section"
            ? {
                x: isFullWidthNode(type) ? 0 : position.x - dropTarget.layout.x,
                y: position.y - dropTarget.layout.y,
              }
            : { x: newNode.layout.x, y: newNode.layout.y };

        const placed = constrainToSection(
          {
            ...newNode,
            parentId: parent.id,
            displayOrder: elementOrder,
            layout: {
              ...newNode.layout,
              ...relativePosition,
              zIndex: elementOrder,
            },
          },
          parent,
          prev.canvasWidth,
          prev.canvasHeight,
        );

        const nextNodes = createdSection
          ? [...prev.nodes, createdSection, placed]
          : [...prev.nodes, placed];
        const stacked = createdSection
          ? restackSections(nextNodes, prev.canvasWidth)
          : null;

        return {
          ...prev,
          canvasHeight: stacked?.canvasHeight ?? prev.canvasHeight,
          nodes: stacked?.nodes ?? nextNodes,
        };
      });

      setSelectedNodeId(newNode.id);
    },
    [commitState, selectedNodeId],
  );

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;

    commitState((prev) => {
      const target = prev.nodes.find((node) => node.id === selectedNodeId);
      if (!target) return prev;

      const remaining = prev.nodes.filter((node) => {
        if (node.id === selectedNodeId) return false;
        if (target.type === "section" && node.parentId === selectedNodeId) {
          return false;
        }
        return true;
      });

      if (target.type === "section") {
        const stacked = restackSections(remaining, prev.canvasWidth);
        return {
          ...prev,
          canvasHeight: stacked.canvasHeight,
          nodes: stacked.nodes,
        };
      }

      return { ...prev, nodes: remaining };
    });
    setSelectedNodeId(null);
  }, [commitState, selectedNodeId]);

  const resetLayout = useCallback(async () => {
    if (!state) return;

    setSaveStatus("saving");
    try {
      const saved = await builderApi.resetDraftLayout(state.pageId);
      const next = layoutResponseToState(saved);
      stateRef.current = next;
      setState(next);
      setSelectedNodeId(null);
      isDirtyRef.current = false;
      setIsDirty(false);
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      console.error(error);
    }
  }, [state]);

  const publishLayout = useCallback(async () => {
    if (!stateRef.current) return;

    setIsPublishing(true);
    try {
      const saved = await flushSave();
      await builderApi.publishLayout(saved.pageId);
      setSaveStatus("published");
    } catch (error) {
      setSaveStatus("error");
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  }, [flushSave]);

  const previewLayout = useCallback(async () => {
    if (!stateRef.current) return;

    setIsPreviewing(true);
    const tab = window.open("about:blank", "_blank");
    try {
      const saved = await flushSave();
      const url = `/preview?page=${encodeURIComponent(saved.pageId)}&mode=draft`;
      if (tab) {
        tab.location.replace(url);
      } else {
        window.location.assign(url);
      }
    } catch (error) {
      tab?.close();
      setSaveStatus("error");
      console.error(error);
    } finally {
      setIsPreviewing(false);
    }
  }, [flushSave]);

  return {
    pages,
    state,
    sections,
    selectedNode,
    selectedNodeId,
    canDelete,
    isLoading,
    loadError,
    saveStatus,
    isDirty,
    isPublishing,
    isPreviewing,
    setSelectedNodeId,
    addNode,
    updateNodeLayout,
    updateNodeStyle,
    updateNodeContent,
    moveNodeToSection,
    reorderSection,
    updateCanvasSize,
    deleteSelectedNode,
    saveLayout,
    resetLayout,
    publishLayout,
    previewLayout,
    reloadLayout: loadLayout,
  };
};
