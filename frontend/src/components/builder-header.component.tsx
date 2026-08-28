import { useEffect } from "react";
import { Button, Group } from "@mantine/core";
import {
  IconCloudUpload,
  IconDeviceFloppy,
  IconRefresh,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";

import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/constants/brand.constants";
import styles from "@/styles/builder.module.scss";

type SaveStatus = "idle" | "saving" | "saved" | "error" | "published";

type BuilderHeaderProps = {
  pageTitle?: string;
  saveStatus: SaveStatus;
  isDirty: boolean;
  isPublishing: boolean;
  isPreviewing: boolean;
  canDelete: boolean;
  isBusy: boolean;
  onSave: () => void;
  onReset: () => void;
  onPublish: () => void;
  onPreview: () => void;
  onDelete: () => void;
};

const statusLabel = (saveStatus: SaveStatus, isDirty: boolean) => {
  if (saveStatus === "saving") return "Saving…";
  if (saveStatus === "error") return "Save failed";
  if (saveStatus === "published" && !isDirty) return "Published";
  if (isDirty) return "Unsaved";
  if (saveStatus === "saved") return "Saved";
  return "Ready";
};

const statusDot = (saveStatus: SaveStatus, isDirty: boolean) => {
  if (saveStatus === "saving") return "saving";
  if (saveStatus === "error") return "error";
  if (saveStatus === "published" && !isDirty) return "published";
  if (isDirty) return "unsaved";
  return "saved";
};

export const BuilderHeader = ({
  pageTitle,
  saveStatus,
  isDirty,
  isPublishing,
  isPreviewing,
  canDelete,
  isBusy,
  onSave,
  onReset,
  onPublish,
  onPreview,
  onDelete,
}: BuilderHeaderProps) => {
  const isSaving = saveStatus === "saving";

  useEffect(() => {
    document.title = pageTitle
      ? `${pageTitle} · ${PRODUCT_NAME}`
      : PRODUCT_NAME;
  }, [pageTitle]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") {
        return;
      }
      event.preventDefault();
      if (!isBusy && !isSaving && isDirty) {
        onSave();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isBusy, isDirty, isSaving, onSave]);

  return (
    <header className={styles.header}>
      <div className={styles.headerBrand}>
        <div className={styles.headerLogo}>W</div>
        <div>
          <div className={styles.headerTitle}>{PRODUCT_NAME}</div>
          <div className={styles.headerSubtitle}>{PRODUCT_TAGLINE}</div>
        </div>
      </div>

      <Group gap="sm" className={styles.headerActions}>
        <div className={styles.saveIndicator}>
          <span
            className={styles.saveDot}
            data-status={statusDot(saveStatus, isDirty)}
          />
          {statusLabel(saveStatus, isDirty)}
        </div>

        <Button
          variant="subtle"
          color="gray"
          size="xs"
          leftSection={<IconRefresh size={14} />}
          onClick={onReset}
          disabled={isBusy}
          styles={{ root: { color: "#cbd5e1" } }}
        >
          Reset
        </Button>

        <Button
          variant="subtle"
          color="red"
          size="xs"
          leftSection={<IconTrash size={14} />}
          onClick={onDelete}
          disabled={!canDelete || isBusy}
          styles={{ root: { color: canDelete ? "#fca5a5" : "#64748b" } }}
        >
          Delete
        </Button>

        <Button
          variant="outline"
          size="xs"
          leftSection={<IconDeviceFloppy size={14} />}
          loading={isSaving}
          disabled={isBusy || isSaving || !isDirty}
          onClick={onSave}
          styles={{
            root: {
              borderColor: isDirty ? "var(--wb-brand)" : "rgba(255,255,255,0.15)",
              color: isDirty ? "#fff" : "#94a3b8",
              "&:hover": {
                background: "rgba(255,255,255,0.08)",
              },
            },
          }}
        >
          Save
        </Button>

        <Button
          size="xs"
          leftSection={<IconCloudUpload size={14} />}
          loading={isPublishing}
          disabled={isBusy}
          onClick={onPublish}
          styles={{
            root: {
              background: "var(--wb-brand)",
              "&:hover": { background: "var(--wb-brand-hover)" },
            },
          }}
        >
          Publish
        </Button>

        <Button
          variant="outline"
          size="xs"
          leftSection={<IconWorld size={14} />}
          loading={isPreviewing}
          disabled={isBusy}
          onClick={onPreview}
          styles={{
            root: {
              borderColor: "rgba(255,255,255,0.15)",
              color: "#e2e8f0",
              "&:hover": {
                background: "rgba(255,255,255,0.08)",
              },
            },
          }}
        >
          Preview
        </Button>
      </Group>
    </header>
  );
};
