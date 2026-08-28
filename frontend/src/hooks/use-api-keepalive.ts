import { useEffect } from "react";

import { API_BASE } from "@/config/env";

const KEEPALIVE_MS = 45_000;

/** Ping the API every 45s while the editor is open so Render does not idle. */
export const useApiKeepalive = () => {
  useEffect(() => {
    const ping = () => {
      void fetch(`${API_BASE}/keepalive`, { cache: "no-store" }).catch(
        () => undefined,
      );
    };

    ping();
    const timer = window.setInterval(ping, KEEPALIVE_MS);
    return () => window.clearInterval(timer);
  }, []);
};
