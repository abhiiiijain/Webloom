import type { CSSProperties } from "react";

import type { BuilderNode } from "../types/layout-node.types";
import { getBuilderIcon } from "../utils/builder-icons.utils";
import { resolveGalleryGrid } from "../utils/gallery.utils";
import { nodeToContentStyle } from "../utils/layout-to-style.utils";
import { resolveVideoEmbed } from "../utils/video-embed.utils";

type BuilderElementContentProps = {
  node: BuilderNode;
  isPreview?: boolean;
};

const EmptyMediaFrame = ({
  label,
  isPreview,
  radius,
  contentStyle,
}: {
  label: string;
  isPreview: boolean;
  radius?: number;
  contentStyle: CSSProperties;
}) => (
  <div
    style={{
      ...contentStyle,
      borderRadius: radius,
      backgroundColor: isPreview ? "transparent" : "rgba(0,0,0,0.04)",
      border: isPreview ? "none" : "1px dashed #ccc",
      color: "#94a3b8",
      fontSize: 12,
      justifyContent: "center",
    }}
  >
    {isPreview ? null : label}
  </div>
);

export const BuilderElementContent = ({
  node,
  isPreview = false,
}: BuilderElementContentProps) => {
  const contentStyle = nodeToContentStyle(node);

  if (node.type === "heading") {
    const Tag = node.content.headingLevel ?? "h1";
    return (
      <div style={contentStyle}>
        <Tag
          style={{
            margin: 0,
            width: "100%",
            font: "inherit",
            color: "inherit",
            wordBreak: "break-word",
          }}
        >
          {node.content.text || "Heading"}
        </Tag>
      </div>
    );
  }

  if (node.type === "text") {
    return (
      <div style={contentStyle}>
        <span style={{ width: "100%", wordBreak: "break-word" }}>
          {node.content.text ?? "Text"}
        </span>
      </div>
    );
  }

  if (node.type === "button") {
    const label = <span>{node.content.label ?? "Button"}</span>;
    if (isPreview && node.content.url) {
      return (
        <a
          href={node.content.url}
          style={{ ...contentStyle, textDecoration: "none", color: "inherit" }}
        >
          {label}
        </a>
      );
    }
    return <div style={contentStyle}>{label}</div>;
  }

  if (node.type === "icon") {
    const Glyph = getBuilderIcon(node.content.iconName);
    const size = node.style.fontSize ?? 32;
    return (
      <div
        style={{
          ...contentStyle,
          flexDirection: "column",
          gap: 6,
          justifyContent: "center",
        }}
      >
        <Glyph size={size} color={node.style.color || "#FF6B00"} />
        {node.content.label ? (
          <span style={{ fontSize: 12, fontWeight: 600, color: "inherit" }}>
            {node.content.label}
          </span>
        ) : null}
      </div>
    );
  }

  if (node.type === "image") {
    const imageUrl = node.content.imageUrl?.trim() ?? "";
    const radius = node.style.borderRadius;

    if (!imageUrl) {
      return (
        <EmptyMediaFrame
          label="Image"
          isPreview={isPreview}
          radius={radius}
          contentStyle={contentStyle}
        />
      );
    }

    return (
      <img
        src={imageUrl}
        alt={node.content.alt ?? ""}
        style={{
          width: "100%",
          height: "100%",
          objectFit: node.style.objectFit ?? "cover",
          borderRadius: radius,
          display: "block",
        }}
        draggable={false}
      />
    );
  }

  if (node.type === "video") {
    const embed = resolveVideoEmbed(node.content.videoUrl ?? "");
    const radius = node.style.borderRadius;

    if (!embed) {
      return (
        <EmptyMediaFrame
          label="Video"
          isPreview={isPreview}
          radius={radius}
          contentStyle={contentStyle}
        />
      );
    }

    const mediaStyle: CSSProperties = {
      width: "100%",
      height: "100%",
      border: 0,
      borderRadius: radius,
      display: "block",
      pointerEvents: isPreview ? "auto" : "none",
      background: "#0f172a",
    };

    if (embed.kind === "iframe") {
      return (
        <iframe
          title={node.content.alt || "Video"}
          src={embed.src}
          style={mediaStyle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={isPreview}
        />
      );
    }

    return (
      <video
        src={embed.src}
        style={mediaStyle}
        controls={isPreview}
        muted={!isPreview}
      />
    );
  }

  if (node.type === "gallery") {
    const { columns, rows, imageUrls } = resolveGalleryGrid(node.content);
    const visible = isPreview
      ? imageUrls.map((url) => url.trim())
      : imageUrls;
    const radius = node.style.borderRadius ?? 8;
    if (isPreview && visible.every((url) => !url)) {
      return (
        <EmptyMediaFrame
          label="Gallery"
          isPreview={isPreview}
          radius={radius}
          contentStyle={contentStyle}
        />
      );
    }

    return (
      <div
        style={{
          ...contentStyle,
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 8,
          padding: 4,
          alignItems: "stretch",
        }}
      >
        {visible.map((url, index) =>
          url ? (
            <img
              key={`${url}-${index}`}
              src={url}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                minHeight: 0,
                objectFit: "cover",
                borderRadius: radius,
                display: "block",
              }}
            />
          ) : (
            <div
              key={`empty-${index}`}
              style={{
                height: "100%",
                minHeight: 0,
                borderRadius: radius,
                border: isPreview ? "none" : "1px dashed #ccc",
                background: isPreview ? "transparent" : "rgba(0,0,0,0.04)",
                color: "#94a3b8",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isPreview ? null : "Image"}
            </div>
          ),
        )}
      </div>
    );
  }

  if (node.type === "contactForm") {
    const inputStyle: CSSProperties = {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #e2e8f0",
      borderRadius: 6,
      padding: "8px 10px",
      fontSize: 13,
      fontFamily: "inherit",
    };

    return (
      <form
        style={{
          ...contentStyle,
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
          gap: 8,
          padding: 12,
          pointerEvents: isPreview ? "auto" : "none",
        }}
        onSubmit={(event) => event.preventDefault()}
      >
        <div style={{ fontWeight: 700, fontSize: 16, color: "#111111" }}>
          {node.content.text || "Contact us"}
        </div>
        <input style={inputStyle} placeholder="Name" readOnly={!isPreview} />
        <input
          style={inputStyle}
          placeholder="Email"
          type="email"
          readOnly={!isPreview}
        />
        <textarea
          style={{ ...inputStyle, minHeight: 64, resize: "none" }}
          placeholder="Message"
          readOnly={!isPreview}
        />
        <button
          type="submit"
          style={{
            border: 0,
            borderRadius: node.style.borderRadius ?? 8,
            background: node.style.backgroundColor || "#FF6B00",
            color: node.style.color || "#FFFFFF",
            fontWeight: 600,
            fontSize: node.style.fontSize ?? 14,
            padding: "8px 12px",
            cursor: isPreview ? "pointer" : "default",
          }}
        >
          {node.content.submitLabel || "Send"}
        </button>
      </form>
    );
  }

  if (node.type === "testimonials") {
    const items = node.content.testimonials ?? [];
    const radius = node.style.borderRadius ?? 8;

    return (
      <div
        style={{
          ...contentStyle,
          gap: 10,
          padding: 8,
          alignItems: "stretch",
          justifyContent: "flex-start",
        }}
      >
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            style={{
              flex: 1,
              minWidth: 0,
              background: "#f8fafc",
              borderRadius: radius,
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 13, lineHeight: 1.4, color: "inherit" }}>
              “{item.quote || "Quote"}”
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {item.imageUrl?.trim() ? (
                <img
                  src={item.imageUrl.trim()}
                  alt=""
                  draggable={false}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#e2e8f0",
                    color: "#64748b",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {(item.name || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>
                  {item.name || "Guest"}
                </div>
                {item.role ? (
                  <div style={{ fontSize: 11, color: "#64748b" }}>{item.role}</div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (node.type === "divider") {
    const thickness = Math.max(1, node.content.thickness ?? 2);
    return (
      <div style={{ ...contentStyle, justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            height: thickness,
            backgroundColor: node.style.color || "#cbd5e1",
            borderRadius: 999,
          }}
        />
      </div>
    );
  }

  if (node.type === "spacer") {
    return (
      <div
        style={{
          ...contentStyle,
          backgroundColor: isPreview ? "transparent" : "rgba(0,0,0,0.04)",
          border: isPreview ? "none" : "1px dashed #ccc",
        }}
      />
    );
  }

  return null;
};
