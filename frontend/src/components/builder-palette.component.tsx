import { useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import {
  IconClick,
  IconHeading,
  IconIcons,
  IconLayoutGrid,
  IconLayoutNavbar,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMail,
  IconMinus,
  IconPhoto,
  IconQuote,
  IconSeparator,
  IconTypography,
  IconVideo,
} from "@tabler/icons-react";

import { BUILDER_COMPONENT_CATALOG } from "@/constants/component-catalog.constants";
import type { BuilderNodeType } from "@/types/layout-node.types";

import styles from "@/styles/builder.module.scss";

const PALETTE_COLLAPSED_KEY = "wb-palette-collapsed";

const paletteIcons = (
  size: number,
): Partial<Record<BuilderNodeType, React.ReactNode>> => ({
  section: <IconLayoutNavbar size={size} />,
  heading: <IconHeading size={size} />,
  text: <IconTypography size={size} />,
  button: <IconClick size={size} />,
  icon: <IconIcons size={size} />,
  image: <IconPhoto size={size} />,
  video: <IconVideo size={size} />,
  gallery: <IconLayoutGrid size={size} />,
  contactForm: <IconMail size={size} />,
  testimonials: <IconQuote size={size} />,
  divider: <IconMinus size={size} />,
  spacer: <IconSeparator size={size} />,
});

type BuilderPaletteProps = {
  onAdd: (type: BuilderNodeType) => void;
};

const readCollapsed = () => {
  try {
    return localStorage.getItem(PALETTE_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
};

export const BuilderPalette = ({ onAdd }: BuilderPaletteProps) => {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const icons = paletteIcons(collapsed ? 18 : 16);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PALETTE_COLLAPSED_KEY, String(next));
      } catch {
        // Ignore storage failures (private mode, quota, etc.)
      }
      return next;
    });
  };

  return (
    <aside
      className={`${styles.panel} ${styles.panelLeft} ${
        collapsed ? styles.panelLeftCollapsed : ""
      }`}
      aria-label="Components"
    >
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderText}>
          <div className={styles.panelTitle}>Components</div>
          <div className={styles.panelSubtitle}>
            Drag onto the canvas or click to add
          </div>
        </div>
        <Tooltip
          label={collapsed ? "Expand components" : "Collapse components"}
          position="right"
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            aria-label={collapsed ? "Expand components" : "Collapse components"}
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
          >
            {collapsed ? (
              <IconLayoutSidebarLeftExpand size={16} />
            ) : (
              <IconLayoutSidebarLeftCollapse size={16} />
            )}
          </ActionIcon>
        </Tooltip>
      </div>

      <div className={styles.panelBody}>
        <div className={styles.paletteList}>
          {BUILDER_COMPONENT_CATALOG.map((item) => (
            <Tooltip
              key={item.type}
              label={collapsed ? item.label : (item.hint ?? item.label)}
              position="right"
            >
              <div
                className={styles.paletteItem}
                draggable
                role="button"
                aria-label={
                  item.hint ? `${item.label}. ${item.hint}` : item.label
                }
                tabIndex={0}
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/x-builder-component",
                    item.type,
                  );
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => onAdd(item.type)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    onAdd(item.type);
                  }
                }}
              >
                <div className={styles.paletteIcon} data-type={item.type}>
                  {icons[item.type]}
                </div>
                <div className={styles.paletteItemText}>
                  <div className={styles.paletteLabel}>{item.label}</div>
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </aside>
  );
};
