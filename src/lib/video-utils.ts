/**
 * Convert a YouTube or Vimeo URL to an embeddable URL.
 */
export const getEmbedUrl = (url: string): string => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

/**
 * Check if a URL is an embeddable video (YouTube/Vimeo).
 */
export const isEmbedVideo = (url: string): boolean =>
  url.includes("youtube") || url.includes("youtu.be") || url.includes("vimeo");
