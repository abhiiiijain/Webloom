import { Button, Text } from "@mantine/core";

import { PRODUCT_NAME } from "@/constants/brand.constants";

import styles from "@/styles/builder.module.scss";

export const NotFoundPage = () => (
  <div className={styles.fullPageMessage}>
    <Text fw={600}>Page not found</Text>
    <Text size="sm" c="dimmed">
      That URL is not part of {PRODUCT_NAME}.
    </Text>
    <Button color="brand" onClick={() => { window.location.href = "/"; }}>
      Back to editor
    </Button>
  </div>
);
