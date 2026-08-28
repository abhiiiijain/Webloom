import type {
  BuilderNode,
  BuilderNodeType,
} from "@/types/layout-node.types";
import { isFullWidthNode, MIN_SECTION_HEIGHT } from "@/utils/section.utils";

export const BUILDER_COMPONENT_CATALOG = [
  {
    type: "section" as const,
    label: "Section",
    hint: "Named page band",
    defaultLayout: { width: "100%" as const, height: 200 },
    defaultStyle: {
      backgroundColor: "#ffffff",
    },
    defaultContent: { name: "Section" },
    resizable: true,
  },
  {
    type: "heading" as const,
    label: "Heading",
    hint: "Resizable · auto height",
    defaultLayout: { width: 320, height: 44 },
    defaultStyle: {
      color: "#111111",
      fontSize: 32,
      fontWeight: 700,
      textAlign: "left" as const,
      lineHeight: 1.15,
    },
    defaultContent: { text: "Heading", headingLevel: "h1" as const },
    resizable: true,
    autoFitHeight: true,
  },
  {
    type: "text" as const,
    label: "Text",
    hint: "Resizable · auto height",
    defaultLayout: { width: 240, height: 48 },
    defaultStyle: {
      color: "#111111",
      fontSize: 18,
      fontWeight: 600,
      textAlign: "left" as const,
    },
    defaultContent: { text: "Edit this text" },
    resizable: true,
    autoFitHeight: true,
  },
  {
    type: "button" as const,
    label: "Button",
    hint: "Resizable",
    defaultLayout: { width: 140, height: 44 },
    defaultStyle: {
      backgroundColor: "#FF6B00",
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: 600,
      textAlign: "center" as const,
      borderRadius: 8,
    },
    defaultContent: { label: "Order Now", url: "#" },
    resizable: true,
  },
  {
    type: "icon" as const,
    label: "Icon",
    hint: "Symbol with optional label",
    defaultLayout: { width: 96, height: 96 },
    defaultStyle: {
      color: "#FF6B00",
      fontSize: 32,
      textAlign: "center" as const,
    },
    defaultContent: { iconName: "star", label: "" },
    resizable: true,
  },
  {
    type: "image" as const,
    label: "Image",
    hint: "Resizable",
    defaultLayout: { width: 200, height: 140 },
    defaultStyle: {
      borderRadius: 8,
      objectFit: "cover" as const,
    },
    defaultContent: {
      imageUrl: "",
      alt: "",
    },
    resizable: true,
  },
  {
    type: "video" as const,
    label: "Video",
    hint: "YouTube, Vimeo, or file URL",
    defaultLayout: { width: 320, height: 180 },
    defaultStyle: {
      borderRadius: 8,
    },
    defaultContent: {
      videoUrl: "",
    },
    resizable: true,
  },
  {
    type: "gallery" as const,
    label: "Gallery",
    hint: "Rows and columns",
    defaultLayout: { width: 420, height: 160 },
    defaultStyle: {
      borderRadius: 8,
    },
    defaultContent: {
      imageUrls: [""],
      galleryColumns: 1,
      galleryRows: 1,
    },
    resizable: true,
  },
  {
    type: "contactForm" as const,
    label: "Contact form",
    hint: "Name, email, message",
    defaultLayout: { width: 320, height: 280 },
    defaultStyle: {
      backgroundColor: "#FF6B00",
      color: "#FFFFFF",
      fontSize: 14,
      borderRadius: 8,
    },
    defaultContent: {
      text: "Contact us",
      submitLabel: "Send",
    },
    resizable: true,
  },
  {
    type: "testimonials" as const,
    label: "Testimonials",
    hint: "Quote cards",
    defaultLayout: { width: 480, height: 180 },
    defaultStyle: {
      color: "#111111",
      fontSize: 14,
      borderRadius: 8,
    },
    defaultContent: {
      testimonials: [
        {
          quote: "Great food and service.",
          name: "Alex",
          role: "Guest",
          imageUrl: "",
        },
        {
          quote: "We'll be back soon.",
          name: "Sam",
          role: "Guest",
          imageUrl: "",
        },
      ],
    },
    resizable: true,
  },
  {
    type: "divider" as const,
    label: "Divider",
    hint: "Full-width line",
    defaultLayout: { width: "100%" as const, height: 16 },
    defaultStyle: {
      color: "#cbd5e1",
    },
    defaultContent: { thickness: 2 },
    resizable: true,
  },
  {
    type: "spacer" as const,
    label: "Spacer",
    hint: "Resizable",
    defaultLayout: { width: "100%" as const, height: 32 },
    defaultStyle: {
      backgroundColor: "transparent",
    },
    defaultContent: {},
    resizable: true,
  },
];

type CatalogItem = (typeof BUILDER_COMPONENT_CATALOG)[number];

const COMPONENT_DEFINITION_BY_TYPE = Object.fromEntries(
  BUILDER_COMPONENT_CATALOG.map((item) => [item.type, item]),
) as Record<BuilderNodeType, CatalogItem | undefined>;

export const getComponentDefinition = (type: BuilderNodeType) =>
  COMPONENT_DEFINITION_BY_TYPE[type];

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** Build a new canvas node from the local component catalog. */
export const createNodeFromType = (
  type: BuilderNodeType,
  displayOrder: number,
  position?: { x: number; y: number },
): BuilderNode => {
  const definition = getComponentDefinition(type);
  if (!definition) {
    throw new Error(`Unknown component type: ${type}`);
  }

  const isSection = type === "section";
  const isFullWidth = isFullWidthNode(type);

  return {
    id: createId(),
    type,
    parentId: null,
    displayOrder,
    layout: {
      mode: "absolute",
      x: isSection || isFullWidth ? 0 : (position?.x ?? 24),
      y: isSection ? 0 : (position?.y ?? 24),
      width: definition.defaultLayout.width,
      height: definition.defaultLayout.height,
      minWidth: isSection || isFullWidth ? undefined : 40,
      minHeight: isSection ? MIN_SECTION_HEIGHT : isFullWidth ? 8 : 24,
      zIndex: isSection ? 0 : displayOrder,
    },
    style: { ...definition.defaultStyle },
    content: { ...definition.defaultContent },
  };
};
