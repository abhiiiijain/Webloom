export type BuilderNodeType =
  | "section"
  | "heading"
  | "text"
  | "button"
  | "icon"
  | "image"
  | "video"
  | "gallery"
  | "contactForm"
  | "testimonials"
  | "divider"
  | "spacer";

export type BuilderHeadingLevel = "h1" | "h2" | "h3";

export type BuilderLayout = {
  mode: "absolute";
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  zIndex?: number;
};

export type BuilderStyle = {
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  borderRadius?: number;
  border?: string;
  boxShadow?: string;
  opacity?: number;
  objectFit?: "cover" | "contain" | "fill";
};

export type BuilderTestimonial = {
  quote: string;
  name: string;
  role?: string;
  imageUrl?: string;
};

export type BuilderContent = {
  name?: string;
  text?: string;
  label?: string;
  url?: string;
  imageUrl?: string;
  videoUrl?: string;
  alt?: string;
  headingLevel?: BuilderHeadingLevel;
  thickness?: number;
  iconName?: string;
  imageUrls?: string[];
  galleryColumns?: number;
  galleryRows?: number;
  submitLabel?: string;
  testimonials?: BuilderTestimonial[];
};

export type BuilderNode = {
  id: string;
  type: BuilderNodeType;
  parentId: string | null;
  displayOrder: number;
  layout: BuilderLayout;
  style: BuilderStyle;
  content: BuilderContent;
};

export type BuilderLayoutState = {
  pageId: string;
  canvasWidth: number;
  canvasHeight: number;
  nodes: BuilderNode[];
};

export type ResizeHandle =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

/** Canvas-space placement used while dragging an element across sections. */
export type LayoutDragPlacement = {
  canvasX: number;
  canvasY: number;
  hitCanvasY?: number;
};
