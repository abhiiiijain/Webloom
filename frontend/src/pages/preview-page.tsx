import { useEffect, useState } from "react";
import { Alert, Button, Loader, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

import {
  builderApi,
  layoutResponseToState,
} from "@/api/builder-api";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/constants/brand.constants";
import { BuilderElementContent } from "@/components/builder-element-content.component";
import type { BuilderNode } from "@/types/layout-node.types";
import { nodeToWrapperStyle } from "@/utils/layout-to-style.utils";
import {
  getSectionChildren,
  getSections,
  sectionHeight,
} from "@/utils/section.utils";

import styles from "@/styles/builder.module.scss";

const PreviewElement = ({ node }: { node: BuilderNode }) => (
  <div style={nodeToWrapperStyle(node)}>
    <BuilderElementContent node={node} isPreview />
  </div>
);

const PreviewSection = ({
  section,
  nodes,
}: {
  section: BuilderNode;
  nodes: BuilderNode[];
}) => (
  <div
    className={styles.previewSection}
    style={{
      height: sectionHeight(section),
      backgroundColor: section.style.backgroundColor || "#ffffff",
    }}
  >
    {getSectionChildren(nodes, section.id).map((node) => (
      <PreviewElement key={node.id} node={node} />
    ))}
  </div>
);

export const PreviewPage = () => {
  const params = new URLSearchParams(window.location.search);
  const pageId = params.get("page");
  const mode = params.get("mode") === "published" ? "published" : "draft";

  const [layout, setLayout] = useState<ReturnType<
    typeof layoutResponseToState
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `${mode === "published" ? "Live preview" : "Draft preview"} · ${PRODUCT_NAME}`;
  }, [mode]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let id = pageId;
        if (!id) {
          const pages = await builderApi.listPages();
          id = pages.find((page) => page.isHome)?.id ?? pages[0]?.id ?? null;
        }
        if (!id) {
          throw new Error("No page found to preview.");
        }

        const response =
          mode === "published"
            ? await builderApi.getPublishedLayout(id)
            : await builderApi.getDraftLayout(id);

        if (!cancelled) {
          setLayout(layoutResponseToState(response));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load preview",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode, pageId]);

  const sections = getSections(layout?.nodes ?? []);

  return (
    <div className={styles.previewShell}>
      <header className={styles.previewBar}>
        <div className={styles.headerBrand}>
          <div className={styles.headerLogo}>W</div>
          <div>
            <div className={styles.headerTitle}>{PRODUCT_NAME}</div>
            <div className={styles.headerSubtitle}>
              {mode === "published" ? "Live preview" : "Draft preview"} ·{" "}
              {PRODUCT_TAGLINE}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="xs"
          leftSection={<IconArrowLeft size={14} />}
          onClick={() => {
            window.location.href = "/";
          }}
          styles={{
            root: {
              borderColor: "rgba(255,255,255,0.15)",
              color: "#e2e8f0",
            },
          }}
        >
          Back to editor
        </Button>
      </header>

      {error ? (
        <Alert
          className={styles.errorBanner}
          color="red"
          title="Preview unavailable"
          variant="light"
        >
          {error}
        </Alert>
      ) : null}

      {isLoading || !layout ? (
        <div className={styles.loadingOverlay}>
          <Loader color="brand" size="lg" />
          <Text size="sm" c="dimmed">
            Loading preview…
          </Text>
        </div>
      ) : (
        <div className={styles.previewStage}>
          <div
            className={styles.previewPage}
            style={{
              width: layout.canvasWidth,
              minHeight: layout.canvasHeight,
            }}
          >
            {sections.length === 0 ? (
              <div className={styles.canvasEmpty}>This page is empty</div>
            ) : (
              sections.map((section) => (
                <PreviewSection
                  key={section.id}
                  section={section}
                  nodes={layout.nodes}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
