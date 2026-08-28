import { createTheme, type MantineColorsTuple } from "@mantine/core";

const brand: MantineColorsTuple = [
  "#fff4e6",
  "#ffe8cc",
  "#ffd099",
  "#ffb866",
  "#ff9f33",
  "#ff6b00",
  "#e66000",
  "#cc5500",
  "#b34a00",
  "#993f00",
];

const fontFamily =
  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

export const builderTheme = createTheme({
  primaryColor: "brand",
  colors: {
    brand,
  },
  fontFamily,
  headings: {
    fontFamily,
    fontWeight: "600",
  },
  defaultRadius: "md",
  shadows: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
    md: "0 4px 12px rgba(15, 23, 42, 0.08)",
    lg: "0 12px 32px rgba(15, 23, 42, 0.12)",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    TextInput: {
      defaultProps: {
        size: "sm",
      },
    },
    NumberInput: {
      defaultProps: {
        size: "sm",
      },
    },
    Select: {
      defaultProps: {
        size: "sm",
      },
    },
    ColorInput: {
      defaultProps: {
        size: "sm",
      },
    },
  },
});
