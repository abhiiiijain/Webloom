type CanvasSizePreset = {
  label: string;
  width: number;
};

const CANVAS_SIZE_PRESETS: CanvasSizePreset[] = [
  { label: "Desktop · 1440px", width: 1440 },
  { label: "Laptop · 1280px", width: 1280 },
  { label: "Medium · 960px", width: 960 },
  { label: "Tablet · 768px", width: 768 },
  { label: "Mobile · 390px", width: 390 },
];

export const CANVAS_SIZE_OPTIONS = CANVAS_SIZE_PRESETS.map((preset) => ({
  value: String(preset.width),
  label: preset.label,
}));

export const parseCanvasSizeValue = (value: string | null) => {
  if (!value) return null;
  const width = Number(value);
  return Number.isFinite(width) && width > 0 ? width : null;
};
