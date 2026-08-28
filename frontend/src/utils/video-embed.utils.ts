export const resolveVideoEmbed = (
  url: string,
): { kind: "iframe" | "file"; src: string } | null => {
  const value = url.trim();
  if (!value) return null;

  const youtube = value.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/,
  );
  if (youtube) {
    return {
      kind: "iframe",
      src: `https://www.youtube.com/embed/${youtube[1]}`,
    };
  }

  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return {
      kind: "iframe",
      src: `https://player.vimeo.com/video/${vimeo[1]}`,
    };
  }

  return { kind: "file", src: value };
};
