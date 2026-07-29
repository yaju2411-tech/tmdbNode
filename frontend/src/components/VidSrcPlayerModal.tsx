import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Server, Tv, ArrowLeft } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string | number;
  title: string;
  type: "movie" | "tv";
}

export const VidSrcPlayerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  id,
  title,
  type,
}) => {
  const [server, setServer] = useState<"smashystream" | "vidsrc_cc" | "vidlink" | "autoembed" | "embed2">("smashystream");
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) return;

    // Mobile Auto-Orientation / Fullscreen Request
    const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          (screen.orientation as any).lock("landscape").catch(() => {});
        }
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {
        console.log("Orientation lock not supported:", e);
      }
    }

    return () => {
      if (isMobile) {
        try {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch (e) {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getEmbedUrl = () => {
    if (type === "movie") {
      switch (server) {
        case "smashystream":
          return `https://embed.smashystream.com/playere.php?tmdb=${id}`;
        case "vidsrc_cc":
          return `https://vidsrc.cc/v2/embed/movie/${id}`;
        case "vidlink":
          return `https://vidlink.pro/movie/${id}`;
        case "autoembed":
          return `https://player.autoembed.cc/embed/movie/${id}`;
        case "embed2":
          return `https://www.2embed.cc/embed/${id}`;
        default:
          return `https://embed.smashystream.com/playere.php?tmdb=${id}`;
      }
    } else {
      switch (server) {
        case "smashystream":
          return `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`;
        case "vidsrc_cc":
          return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
        case "vidlink":
          return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
        case "autoembed":
          return `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`;
        case "embed2":
          return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
        default:
          return `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`;
      }
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999999] flex flex-col bg-black w-screen h-screen overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Controls Bar (Adapts to Light / Dark Mode) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 dark:bg-zinc-950/95 border-b border-gray-200 dark:border-zinc-800 backdrop-blur-md z-10 shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          {/* Left Arrow Back Button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all flex items-center justify-center shadow-sm"
            title="Back to Details"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] sm:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block">
            {type === "movie" ? "HD Movie Stream" : "HD TV Series Stream"}
          </span>

          <h2 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate max-w-[180px] sm:max-w-md">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Season & Episode Controls (Spacious & Clean) */}
          {type === "tv" && (
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-zinc-900 px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs shadow-sm">
              <Tv className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600 dark:text-zinc-400 font-bold uppercase text-[11px]">Season:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={season}
                  onChange={(e) => setSeason(Math.max(1, Number(e.target.value)))}
                  className="w-12 px-1 py-0.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-center text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600 dark:text-zinc-400 font-bold uppercase text-[11px]">Episode:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={episode}
                  onChange={(e) => setEpisode(Math.max(1, Number(e.target.value)))}
                  className="w-12 px-1 py-0.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-center text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all flex items-center justify-center shadow-sm"
            title="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Fullscreen Video Iframe Container */}
      <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
        <iframe
          key={`${server}-${season}-${episode}`}
          src={getEmbedUrl()}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; orientation; fullscreen"
          referrerPolicy="origin"
        />
      </div>

      {/* Server Selector Bar at Bottom */}
      <div className="px-4 py-2.5 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-900 flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide text-xs shrink-0 transition-colors">
        <div className="flex items-center gap-2 min-w-max">
          <span className="flex items-center gap-1 font-semibold text-gray-600 dark:text-zinc-400 mr-1">
            <Server className="w-3.5 h-3.5 text-red-600 dark:text-red-500" /> Server:
          </span>
          <button
            onClick={() => setServer("smashystream")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              server === "smashystream"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            SmashyStream (Primary HD)
          </button>
          <button
            onClick={() => setServer("vidsrc_cc")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              server === "vidsrc_cc"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            VidSrc CC
          </button>
          <button
            onClick={() => setServer("vidlink")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              server === "vidlink"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            VidLink
          </button>
          <button
            onClick={() => setServer("autoembed")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              server === "autoembed"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            AutoEmbed (AE HD)
          </button>
          <button
            onClick={() => setServer("embed2")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              server === "embed2"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            2Embed Backup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VidSrcPlayerModal;
