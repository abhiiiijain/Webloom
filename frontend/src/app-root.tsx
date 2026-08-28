import App from "@/App";
import { NotFoundPage } from "@/pages/not-found-page";
import { PreviewPage } from "@/pages/preview-page";

export const AppRoot = () => {
  const path = window.location.pathname;

  if (path.startsWith("/preview")) {
    return <PreviewPage />;
  }

  if (path === "/" || path === "") {
    return <App />;
  }

  return <NotFoundPage />;
};
