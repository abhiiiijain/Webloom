import { useLayoutEffect, useState, type RefObject } from "react";

/** Scale the canvas so its fixed width fits the workspace. Height can overflow and scroll. */
export const useCanvasFitScale = (
  containerRef: RefObject<HTMLElement | null>,
  width: number,
) => {
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const styles = getComputedStyle(container);
      const padX =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const availableWidth = Math.max(0, container.clientWidth - padX);
      const next = Math.min(availableWidth / width, 1);
      const resolved =
        Number.isFinite(next) && next > 0 ? Math.max(next, 0.1) : 1;

      setScale((prev) => (prev === resolved ? prev : resolved));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, width]);

  return scale;
};
