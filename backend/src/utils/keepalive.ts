const KEEPALIVE_MS = 45_000;

/** Hit the public Render URL so inbound traffic keeps the free instance awake. */
export const startKeepalivePinger = () => {
  const publicUrl = process.env.RENDER_EXTERNAL_URL?.replace(/\/+$/, "");
  if (!publicUrl) {
    return;
  }

  const ping = () => {
    void fetch(`${publicUrl}/api/keepalive`).catch(() => undefined);
  };

  ping();
  setInterval(ping, KEEPALIVE_MS);
};
