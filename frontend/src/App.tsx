import { Alert, Loader, Text } from "@mantine/core";

import { BuilderCanvas } from "@/components/builder-canvas.component";
import { BuilderHeader } from "@/components/builder-header.component";
import { BuilderPalette } from "@/components/builder-palette.component";
import { BuilderPropertiesPanel } from "@/components/builder-properties-panel.component";
import { useBuilderLayout } from "@/hooks/use-builder-layout";
import type { BuilderNodeType } from "@/types/layout-node.types";

import styles from "@/styles/builder.module.scss";

export default function App() {
  const {
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
    reloadLayout,
  } = useBuilderLayout();

  const activePage = pages.find((page) => page.id === state?.pageId);

  return (
    <div className={styles.appShell}>
      <BuilderHeader
        pageTitle={activePage?.title}
        saveStatus={saveStatus}
        isDirty={isDirty}
        isPublishing={isPublishing}
        isPreviewing={isPreviewing}
        canDelete={canDelete}
        isBusy={isLoading || !state}
        onSave={() => void saveLayout()}
        onReset={() => void resetLayout()}
        onPublish={() => void publishLayout()}
        onPreview={() => void previewLayout()}
        onDelete={deleteSelectedNode}
      />

      {loadError ? (
        <Alert
          className={styles.errorBanner}
          color="red"
          title="Could not connect to builder API"
          variant="light"
        >
          {loadError}.{" "}
          {import.meta.env.DEV
            ? "Make sure MongoDB is running and the backend is started on port 4062."
            : "Confirm the Render API is up and VITE_API_BASE_URL is set at build time."}
          <Text
            component="button"
            size="sm"
            c="brand"
            fw={600}
            mt="xs"
            style={{ cursor: "pointer", background: "none", border: "none" }}
            onClick={() => void reloadLayout()}
          >
            Retry connection
          </Text>
        </Alert>
      ) : null}

      {isLoading || !state ? (
        <div className={styles.loadingOverlay}>
          <Loader color="brand" size="lg" />
          <Text size="sm" c="dimmed">
            Loading page layout from MongoDB…
          </Text>
        </div>
      ) : (
        <div className={styles.workspace}>
          <BuilderPalette onAdd={addNode} />

          <BuilderCanvas
            width={state.canvasWidth}
            height={state.canvasHeight}
            nodes={state.nodes}
            sections={sections}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onCanvasSizeChange={updateCanvasSize}
            onLayoutChange={updateNodeLayout}
            onDropComponent={(type: BuilderNodeType, position) =>
              addNode(type, position)
            }
          />

          <aside className={`${styles.panel} ${styles.panelRight}`}>
            <BuilderPropertiesPanel
              node={selectedNode}
              sections={sections}
              onLayoutChange={(patch) =>
                selectedNode && updateNodeLayout(selectedNode.id, patch)
              }
              onStyleChange={(patch) =>
                selectedNode && updateNodeStyle(selectedNode.id, patch)
              }
              onContentChange={(patch) =>
                selectedNode && updateNodeContent(selectedNode.id, patch)
              }
              onMoveToSection={(sectionId) =>
                selectedNode && moveNodeToSection(selectedNode.id, sectionId)
              }
              onReorderSection={(direction) =>
                selectedNode && reorderSection(selectedNode.id, direction)
              }
            />
          </aside>
        </div>
      )}
    </div>
  );
}
