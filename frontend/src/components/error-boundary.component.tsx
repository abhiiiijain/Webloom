import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Text } from "@mantine/core";

import { PRODUCT_NAME } from "@/constants/brand.constants";

import styles from "@/styles/builder.module.scss";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`${PRODUCT_NAME} crashed`, error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className={styles.fullPageMessage}>
        <Text fw={600}>Something went wrong</Text>
        <Text size="sm" c="dimmed">
          Reload the page to continue in {PRODUCT_NAME}.
        </Text>
        <Button color="brand" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    );
  }
}
