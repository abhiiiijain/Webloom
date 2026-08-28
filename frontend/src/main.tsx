import { MantineProvider } from "@mantine/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppRoot } from "@/app-root";
import { ErrorBoundary } from "@/components/error-boundary.component";
import { builderTheme } from "@/theme/builder-theme";
import "@mantine/core/styles.css";
import "./styles/global.scss";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Webloom root element #root was not found");
}

createRoot(root).render(
  <StrictMode>
    <MantineProvider theme={builderTheme} defaultColorScheme="light">
      <ErrorBoundary>
        <AppRoot />
      </ErrorBoundary>
    </MantineProvider>
  </StrictMode>,
);
