import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Server, Tv, ArrowLeft, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";

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
  const [server, setServer] = useState<"vidsrc_cc" | "vidlink" | "vidsrc_icu" | "vidsrc_pro" | "embed2">("vidsrc_cc");
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
        case "vidsrc_cc":
          return `https://vidsrc.cc/v2/embed/movie/${id}`;
        case "vidlink":
          return `https://vidlink.pro/movie/${id}`;
        case "vidsrc_icu":
          return `https://vidsrc.icu/embed/movie/${id}`;
        case "vidsrc_pro":
          return `https://vidsrc.pro/embed/movie/${id}`;
        case "embed2":
          return `https://www.2embed.cc/embed/${id}`;
        default:
          return `https://vidsrc.cc/v2/embed/movie/${id}`;
      }
    } else {
      switch (server) {
        case "vidsrc_cc":
          return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
        case "vidlink":
          return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
        case "vidsrc_icu":
          return `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`;
        case "vidsrc_pro":
          return `https://vidsrc.pro/embed/tv/${id}/${season}/${episode}`;
        case "embed2":
          return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
        default:
          return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
      }
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999999] flex flex-col bg-black w-screen h-screen overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-zinc-950/90 border-b border-zinc-800 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-red-950/40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <span className="bg-zinc-800 text-zinc-300 text-[10px] sm:text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider hidden sm:inline-block">
            {type === "movie" ? "HD Movie Stream" : "HD TV Series Stream"}
          </span>

          <h2 className="text-sm sm:text-lg font-bold text-white truncate max-w-[200px] sm:max-w-md">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {type === "tv" && (
            <div className="flex items-center gap-2 bg-zinc-900 px-2.5 py-1 rounded-xl border border-zinc-800 text-xs">
              <Tv className="w-3.5 h-3.5 text-red-500" />
              <div className="flex items-center gap-1">
                <span className="text-zinc-400 text-[11px]">S:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={season}
                  onChange={(e) => setSeason(Math.max(1, Number(e.target.value)))}
                  className="w-10 bg-zinc-800 border border-zinc-700 rounded text-center text-xs text-white py-0.5"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-zinc-400 text-[11px]">E:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={episode}
                  onChange={(e) => setEpisode(Math.max(1, Number(e.target.value)))}
                  className="w-10 bg-zinc-800 border border-zinc-700 rounded text-center text-xs text-white py-0.5"
                />
              </div>
            </div>
          )}

          <Button
            onClick={onClose}
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl p-2"
            title="Close Player"
          >
            <X className="w-5 h-5" />
          </Button>
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
      <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-max">
          <span className="flex items-center gap-1 font-semibold text-zinc-400 mr-1">
            <Server className="w-3.5 h-3.5 text-red-500" /> Server:
          </span>
          <button
            onClick={() => setServer("vidsrc_cc")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              server === "vidsrc_cc"
                ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            VidSrc CC (Primary HD)
          </button>
          <button
            onClick={() => setServer("vidlink")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              server === "vidlink"
                ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            VidLink
          </button>
          <button
            onClick={() => setServer("vidsrc_icu")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              server === "vidsrc_icu"
                ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            VidSrc ICU
          </button>
          <button
            onClick={() => setServer("vidsrc_pro")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              server === "vidsrc_pro"
                ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            VidSrc PRO
          </button>
          <button
            onClick={() => setServer("embed2")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              server === "embed2"
                ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
