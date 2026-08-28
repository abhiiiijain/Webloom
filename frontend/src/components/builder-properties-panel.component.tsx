import type { ReactNode } from "react";
import {
  ActionIcon,
  Button,
  ColorInput,
  Divider,
  Group,
  NumberInput,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconPointer, IconTrash } from "@tabler/icons-react";

import type {
  BuilderHeadingLevel,
  BuilderNode,
  BuilderTestimonial,
} from "@/types/layout-node.types";
import { BUILDER_ICON_OPTIONS } from "@/utils/builder-icons.utils";
import {
  applyGalleryGrid,
  MAX_GALLERY_COLUMNS,
  MAX_GALLERY_ROWS,
  MIN_GALLERY_COLUMNS,
  MIN_GALLERY_ROWS,
  resolveGalleryGrid,
} from "@/utils/gallery.utils";
import { isFullWidthNode, MIN_SECTION_HEIGHT, sectionHeight } from "@/utils/section.utils";

import styles from "@/styles/builder.module.scss";

type BuilderPropertiesPanelProps = {
  node: BuilderNode | null;
  sections: BuilderNode[];
  onLayoutChange: (patch: Partial<BuilderNode["layout"]>) => void;
  onStyleChange: (patch: Partial<BuilderNode["style"]>) => void;
  onContentChange: (patch: Partial<BuilderNode["content"]>) => void;
  onMoveToSection: (sectionId: string) => void;
  onReorderSection: (direction: -1 | 1) => void;
};

const PropertiesFrame = ({ children }: { children: ReactNode }) => (
  <>
    <div className={styles.panelHeader}>
      <div className={styles.panelHeaderText}>
        <div className={styles.panelTitle}>Properties</div>
        <div className={styles.panelSubtitle}>Element settings</div>
      </div>
    </div>
    <div className={styles.panelBody}>{children}</div>
  </>
);

export const BuilderPropertiesPanel = ({
  node,
  sections,
  onLayoutChange,
  onStyleChange,
  onContentChange,
  onMoveToSection,
  onReorderSection,
}: BuilderPropertiesPanelProps) => {
  if (!node) {
    return (
      <PropertiesFrame>
        <div className={styles.propsEmpty}>
          <div className={styles.propsEmptyIcon}>
            <IconPointer size={24} />
          </div>
          <div>
            <div className={styles.panelTitle} style={{ fontSize: "0.875rem" }}>
              No element selected
            </div>
            <div className={styles.panelSubtitle}>
              Click a section or element on the canvas to edit it.
            </div>
          </div>
        </div>
      </PropertiesFrame>
    );
  }

  if (node.type === "section") {
    const sectionIndex = sections.findIndex((section) => section.id === node.id);

    return (
      <PropertiesFrame>
        <span className={styles.nodeTypeBadge}>section</span>

        <div className={styles.propsSection}>
          <div className={styles.propsSectionTitle}>Section</div>
          <TextInput
            label="Name"
            value={node.content.name ?? ""}
            onChange={(event) =>
              onContentChange({ name: event.currentTarget.value })
            }
            mb="xs"
          />
          <NumberInput
            label="Height (px)"
            min={MIN_SECTION_HEIGHT}
            step={1}
            allowDecimal={false}
            value={sectionHeight(node)}
            onChange={(value) =>
              onLayoutChange({
                height: Number(value) || MIN_SECTION_HEIGHT,
              })
            }
            mb="xs"
          />
          <ColorInput
            label="Background"
            value={node.style.backgroundColor ?? "#ffffff"}
            onChange={(value) => onStyleChange({ backgroundColor: value })}
          />
        </div>

        <Divider my="sm" color="gray.2" />

        <div className={styles.propsSection}>
          <div className={styles.propsSectionTitle}>Order</div>
          <Group grow>
            <Button
              variant="default"
              size="xs"
              disabled={sectionIndex <= 0}
              onClick={() => onReorderSection(-1)}
            >
              Move up
            </Button>
            <Button
              variant="default"
              size="xs"
              disabled={sectionIndex < 0 || sectionIndex >= sections.length - 1}
              onClick={() => onReorderSection(1)}
            >
              Move down
            </Button>
          </Group>
        </div>
      </PropertiesFrame>
    );
  }

  const isFullWidth = isFullWidthNode(node.type);
  const gallery = node.type === "gallery" ? resolveGalleryGrid(node.content) : null;
  const showTextAppearance =
    node.type === "text" ||
    node.type === "heading" ||
    node.type === "button" ||
    node.type === "icon";
  const width =
    typeof node.layout.width === "number" ? node.layout.width : undefined;
  const height =
    typeof node.layout.height === "number" ? node.layout.height : undefined;

  return (
    <PropertiesFrame>
      <span className={styles.nodeTypeBadge}>{node.type}</span>

      <div className={styles.propsSection}>
        <div className={styles.propsSectionTitle}>Position & size</div>
        <div className={styles.propsGrid}>
          <NumberInput
            label="X"
            value={node.layout.x}
            disabled={isFullWidth}
            onChange={(v) => onLayoutChange({ x: Number(v) || 0 })}
          />
          <NumberInput
            label="Y"
            value={node.layout.y}
            onChange={(v) => onLayoutChange({ y: Number(v) || 0 })}
          />
          <NumberInput
            label="Width"
            value={width}
            disabled={isFullWidth}
            onChange={(v) => onLayoutChange({ width: Number(v) || 40 })}
          />
          <NumberInput
            label="Height"
            value={height}
            onChange={(v) => onLayoutChange({ height: Number(v) || 24 })}
          />
        </div>
      </div>

      <Divider my="sm" color="gray.2" />

      <div className={styles.propsSection}>
        <div className={styles.propsSectionTitle}>Placement</div>
        <Select
          label="Section"
          allowDeselect={false}
          data={sections.map((section) => ({
            value: section.id,
            label: section.content.name || "Section",
          }))}
          value={node.parentId}
          onChange={(value) => value && onMoveToSection(value)}
        />
      </div>

      {showTextAppearance ? (
        <>
          <Divider my="sm" color="gray.2" />

          <div className={styles.propsSection}>
            <div className={styles.propsSectionTitle}>Appearance</div>
            {node.type === "button" ? (
              <ColorInput
                label="Background"
                value={node.style.backgroundColor ?? ""}
                onChange={(v) => onStyleChange({ backgroundColor: v })}
                mb="xs"
              />
            ) : null}
            <ColorInput
              label="Text color"
              value={node.style.color ?? ""}
              onChange={(v) => onStyleChange({ color: v })}
              mb="xs"
            />
            <NumberInput
              label="Font size (px)"
              value={node.style.fontSize ?? 16}
              onChange={(v) => onStyleChange({ fontSize: Number(v) || 16 })}
              mb="xs"
            />
            <Select
              label="Text align"
              data={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
              value={node.style.textAlign ?? "left"}
              onChange={(v) =>
                onStyleChange({
                  textAlign: (v as BuilderNode["style"]["textAlign"]) ?? "left",
                })
              }
            />
          </div>
        </>
      ) : null}

      {node.type === "divider" ? (
        <>
          <Divider my="sm" color="gray.2" />
          <div className={styles.propsSection}>
            <div className={styles.propsSectionTitle}>Appearance</div>
            <ColorInput
              label="Line color"
              value={node.style.color ?? "#cbd5e1"}
              onChange={(v) => onStyleChange({ color: v })}
              mb="xs"
            />
            <NumberInput
              label="Thickness (px)"
              min={1}
              max={16}
              allowDecimal={false}
              value={node.content.thickness ?? 2}
              onChange={(v) =>
                onContentChange({ thickness: Math.max(1, Number(v) || 2) })
              }
            />
          </div>
        </>
      ) : null}

      {node.type === "contactForm" ? (
        <>
          <Divider my="sm" color="gray.2" />
          <div className={styles.propsSection}>
            <div className={styles.propsSectionTitle}>Appearance</div>
            <ColorInput
              label="Button color"
              value={node.style.backgroundColor ?? "#FF6B00"}
              onChange={(v) => onStyleChange({ backgroundColor: v })}
              mb="xs"
            />
            <ColorInput
              label="Button text"
              value={node.style.color ?? "#FFFFFF"}
              onChange={(v) => onStyleChange({ color: v })}
            />
          </div>
        </>
      ) : null}

      {node.type !== "divider" && node.type !== "spacer" ? (
          <>
            <Divider my="sm" color="gray.2" />
            <div className={styles.propsSection}>
              <div className={styles.propsSectionTitle}>Content</div>
              {node.type === "heading" && (
                <>
                  <Select
                    label="Level"
                    allowDeselect={false}
                    mb="xs"
                    data={[
                      { value: "h1", label: "Heading 1" },
                      { value: "h2", label: "Heading 2" },
                      { value: "h3", label: "Heading 3" },
                    ]}
                    value={node.content.headingLevel ?? "h1"}
                    onChange={(value) => {
                      const headingLevel = (value ?? "h1") as BuilderHeadingLevel;
                      onContentChange({ headingLevel });
                      onStyleChange({
                        fontSize:
                          headingLevel === "h1"
                            ? 32
                            : headingLevel === "h2"
                              ? 28
                              : 22,
                      });
                    }}
                  />
                  <TextInput
                    label="Text"
                    value={node.content.text ?? ""}
                    onChange={(e) =>
                      onContentChange({ text: e.currentTarget.value })
                    }
                  />
                </>
              )}
              {node.type === "text" && (
                <TextInput
                  label="Text"
                  value={node.content.text ?? ""}
                  onChange={(e) =>
                    onContentChange({ text: e.currentTarget.value })
                  }
                />
              )}
              {node.type === "button" && (
                <>
                  <TextInput
                    label="Button label"
                    value={node.content.label ?? ""}
                    onChange={(e) =>
                      onContentChange({ label: e.currentTarget.value })
                    }
                    mb="xs"
                  />
                  <TextInput
                    label="Link URL"
                    value={node.content.url ?? ""}
                    onChange={(e) =>
                      onContentChange({ url: e.currentTarget.value })
                    }
                  />
                </>
              )}
              {node.type === "icon" && (
                <>
                  <Select
                    label="Icon"
                    allowDeselect={false}
                    mb="xs"
                    data={[...BUILDER_ICON_OPTIONS]}
                    value={node.content.iconName ?? "star"}
                    onChange={(value) =>
                      onContentChange({ iconName: value ?? "star" })
                    }
                  />
                  <TextInput
                    label="Label"
                    value={node.content.label ?? ""}
                    onChange={(e) =>
                      onContentChange({ label: e.currentTarget.value })
                    }
                  />
                </>
              )}
              {node.type === "image" && (
                <>
                  <TextInput
                    label="Image URL"
                    value={node.content.imageUrl ?? ""}
                    onChange={(e) =>
                      onContentChange({ imageUrl: e.currentTarget.value })
                    }
                    mb="xs"
                  />
                  <TextInput
                    label="Alt text"
                    value={node.content.alt ?? ""}
                    onChange={(e) =>
                      onContentChange({ alt: e.currentTarget.value })
                    }
                  />
                </>
              )}
              {node.type === "video" && (
                <TextInput
                  label="Video URL"
                  placeholder="YouTube, Vimeo, or .mp4 link"
                  value={node.content.videoUrl ?? ""}
                  onChange={(e) =>
                    onContentChange({ videoUrl: e.currentTarget.value })
                  }
                />
              )}
              {node.type === "gallery" && gallery && (
                <>
                  <div className={styles.propsGrid}>
                    <NumberInput
                      label="Columns"
                      min={MIN_GALLERY_COLUMNS}
                      max={MAX_GALLERY_COLUMNS}
                      clampBehavior="strict"
                      value={gallery.columns}
                      onChange={(value) =>
                        onContentChange(
                          applyGalleryGrid(node.content, {
                            galleryColumns: Number(value) || MIN_GALLERY_COLUMNS,
                          }),
                        )
                      }
                    />
                    <NumberInput
                      label="Rows"
                      min={MIN_GALLERY_ROWS}
                      max={MAX_GALLERY_ROWS}
                      clampBehavior="strict"
                      value={gallery.rows}
                      onChange={(value) => {
                        const next = applyGalleryGrid(node.content, {
                          galleryRows: Number(value) || MIN_GALLERY_ROWS,
                        });
                        onContentChange(next);
                        const nextHeight = Math.max(
                          typeof node.layout.height === "number"
                            ? node.layout.height
                            : 160,
                          next.galleryRows * 88,
                        );
                        if (nextHeight !== node.layout.height) {
                          onLayoutChange({ height: nextHeight });
                        }
                      }}
                    />
                  </div>
                  {gallery.imageUrls.map((url, index) => (
                    <TextInput
                      key={index}
                      mt="xs"
                      label={index === 0 ? "Image URLs" : undefined}
                      placeholder={`Image ${index + 1}`}
                      value={url}
                      onChange={(e) => {
                        const imageUrls = [...gallery.imageUrls];
                        imageUrls[index] = e.currentTarget.value;
                        onContentChange({ imageUrls });
                      }}
                    />
                  ))}
                </>
              )}
              {node.type === "contactForm" && (
                <>
                  <TextInput
                    label="Title"
                    value={node.content.text ?? ""}
                    onChange={(e) =>
                      onContentChange({ text: e.currentTarget.value })
                    }
                    mb="xs"
                  />
                  <TextInput
                    label="Submit label"
                    value={node.content.submitLabel ?? ""}
                    onChange={(e) =>
                      onContentChange({ submitLabel: e.currentTarget.value })
                    }
                  />
                </>
              )}
              {node.type === "testimonials" && (
                <>
                  {(node.content.testimonials ?? []).map((item, index) => (
                    <div key={index} className={styles.propsSection}>
                      <Group justify="space-between" mb={6}>
                        <div className={styles.propsSectionTitle}>
                          Quote {index + 1}
                        </div>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          aria-label="Remove quote"
                          disabled={(node.content.testimonials?.length ?? 0) <= 1}
                          onClick={() =>
                            onContentChange({
                              testimonials: (
                                node.content.testimonials ?? []
                              ).filter((_, itemIndex) => itemIndex !== index),
                            })
                          }
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                      <Textarea
                        label="Quote"
                        minRows={2}
                        mb="xs"
                        value={item.quote}
                        onChange={(e) => {
                          const testimonials = [
                            ...(node.content.testimonials ?? []),
                          ];
                          testimonials[index] = {
                            ...item,
                            quote: e.currentTarget.value,
                          };
                          onContentChange({ testimonials });
                        }}
                      />
                      <TextInput
                        label="Name"
                        mb="xs"
                        value={item.name}
                        onChange={(e) => {
                          const testimonials = [
                            ...(node.content.testimonials ?? []),
                          ];
                          testimonials[index] = {
                            ...item,
                            name: e.currentTarget.value,
                          };
                          onContentChange({ testimonials });
                        }}
                      />
                      <TextInput
                        label="Role"
                        mb="xs"
                        value={item.role ?? ""}
                        onChange={(e) => {
                          const testimonials = [
                            ...(node.content.testimonials ?? []),
                          ];
                          testimonials[index] = {
                            ...item,
                            role: e.currentTarget.value,
                          };
                          onContentChange({ testimonials });
                        }}
                      />
                      <TextInput
                        label="Photo URL"
                        value={item.imageUrl ?? ""}
                        onChange={(e) => {
                          const testimonials = [
                            ...(node.content.testimonials ?? []),
                          ];
                          testimonials[index] = {
                            ...item,
                            imageUrl: e.currentTarget.value,
                          };
                          onContentChange({ testimonials });
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    variant="default"
                    size="xs"
                    leftSection={<IconPlus size={14} />}
                    disabled={(node.content.testimonials?.length ?? 0) >= 4}
                    onClick={() =>
                      onContentChange({
                        testimonials: [
                          ...(node.content.testimonials ?? []),
                          {
                            quote: "",
                            name: "",
                            role: "",
                            imageUrl: "",
                          } satisfies BuilderTestimonial,
                        ],
                      })
                    }
                  >
                    Add quote
                  </Button>
                </>
              )}
            </div>
          </>
      ) : null}
    </PropertiesFrame>
  );
};
