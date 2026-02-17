import { useRef, useEffect } from "react";

interface ProtectedVideoPlayerProps {
  src: string;
  className?: string;
  poster?: string;
}

const ProtectedVideoPlayer = ({ src, className = "", poster }: ProtectedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Disable right-click
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Block keyboard shortcuts for download/save
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key === "s") ||
        (e.ctrlKey && e.key === "S") ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "U") ||
        e.key === "F12"
      ) {
        e.preventDefault();
        return false;
      }
    };

    container.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isEmbeddable = src.includes("youtube") || src.includes("youtu.be") || src.includes("vimeo");

  if (isEmbeddable) {
    const getEmbedUrl = (url: string): string => {
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      return url;
    };

    return (
      <div ref={containerRef} className={`relative select-none ${className}`} onContextMenu={(e) => e.preventDefault()}>
        <iframe
          src={getEmbedUrl(src)}
          className="w-full aspect-video rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {/* Overlay to prevent right-click on iframe */}
        <div className="absolute inset-0 z-10" style={{ pointerEvents: "auto" }} onContextMenu={(e) => e.preventDefault()} onClick={(e) => { e.currentTarget.style.pointerEvents = "none"; setTimeout(() => { e.currentTarget.style.pointerEvents = "auto"; }, 100); }} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative select-none ${className}`} onContextMenu={(e) => e.preventDefault()}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        playsInline
        className="w-full aspect-video rounded-lg bg-black"
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* CSS overlay for extra protection */}
      <style>{`
        video::-webkit-media-controls-enclosure {
          overflow: hidden;
        }
        video::-webkit-media-controls-panel {
          width: calc(100% + 30px);
        }
      `}</style>
    </div>
  );
};

export default ProtectedVideoPlayer;
