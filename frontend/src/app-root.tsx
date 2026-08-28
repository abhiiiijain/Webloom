import App from "@/App";
import { useApiKeepalive } from "@/hooks/use-api-keepalive";
import { NotFoundPage } from "@/pages/not-found-page";
import { PreviewPage } from "@/pages/preview-page";

export const AppRoot = () => {
  useApiKeepalive();
  const path = window.location.pathname;

  if (path.startsWith("/preview")) {
    return <PreviewPage />;
  }

  if (path === "/" || path === "") {
    return <App />;
  }

  return <NotFoundPage />;
};
