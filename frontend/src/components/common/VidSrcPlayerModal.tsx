import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Server, Tv, ArrowLeft, RefreshCw, Film } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string | number;
  title: string;
  type: "movie" | "tv";
}

type ServerType =
  | "embed_su"
  | "autoembed"
  | "vidsrc_me"
  | "vidlink"
  | "vidbinge"
  | "smashystream"
  | "multiembed"
  | "embed2";

interface ServerOption {
  id: ServerType;
  name: string;
  badge?: string;
}

const SERVER_OPTIONS: ServerOption[] = [
  { id: "embed_su", name: "Embed.su (Fast HD)", badge: "Recommended" },
  { id: "autoembed", name: "AutoEmbed (AE HD)", badge: "Popular" },
  { id: "vidsrc_me", name: "VidSrc.me (Server 1)" },
  { id: "vidlink", name: "VidLink Pro (Multi-Audio)" },
  { id: "vidbinge", name: "VidBinge (Ad-Free)" },
  { id: "smashystream", name: "SmashyStream (Server 2)" },
  { id: "multiembed", name: "MultiEmbed (Backup)" },
  { id: "embed2", name: "2Embed (Mirror)" },
];

export const VidSrcPlayerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  id,
  title,
  type,
}) => {
  const [server, setServer] = useState<ServerType>("embed_su");
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);
  const [key, setKey] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;

    // Mobile Auto-Orientation / Fullscreen Request
    const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          (screen.orientation as any).lock("landscape").catch(() => { });
        }
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => { });
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
            document.exitFullscreen().catch(() => { });
          }
        } catch (e) { }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getEmbedUrl = () => {
    if (type === "movie") {
      switch (server) {
        case "embed_su":
          return `https://embed.su/embed/movie/${id}`;
        case "autoembed":
          return `https://player.autoembed.cc/embed/movie/${id}`;
        case "vidsrc_me":
          return `https://vidsrc.me/embed/movie?tmdb=${id}`;
        case "vidlink":
          return `https://vidlink.pro/movie/${id}`;
        case "vidbinge":
          return `https://vidbinge.dev/embed/movie/${id}`;
        case "smashystream":
          return `https://embed.smashystream.com/playere.php?tmdb=${id}`;
        case "multiembed":
          return `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;
        case "embed2":
          return `https://www.2embed.cc/embed/${id}`;
        default:
          return `https://embed.su/embed/movie/${id}`;
      }
    } else {
      switch (server) {
        case "embed_su":
          return `https://embed.su/embed/tv/${id}/${season}/${episode}`;
        case "autoembed":
          return `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`;
        case "vidsrc_me":
          return `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
        case "vidlink":
          return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
        case "vidbinge":
          return `https://vidbinge.dev/embed/tv/${id}/${season}/${episode}`;
        case "smashystream":
          return `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`;
        case "multiembed":
          return `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
        case "embed2":
          return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
        default:
          return `https://embed.su/embed/tv/${id}/${season}/${episode}`;
      }
    }
  };

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999999] flex flex-col bg-black w-screen h-screen overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 dark:bg-zinc-950/95 border-b border-gray-200 dark:border-zinc-800 backdrop-blur-md z-10 shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all flex items-center justify-center shadow-sm"
            title="Back to Details"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] sm:text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider hidden sm:flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            {type === "movie" ? "HD Movie Stream" : "HD TV Series Stream"}
          </span>

          <h2 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate max-w-[180px] sm:max-w-md">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Player Button */}
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-500 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all flex items-center justify-center shadow-sm"
            title="Refresh Player Stream"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Season & Episode Controls */}
          {type === "tv" && (
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-zinc-900 px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs shadow-sm">
              <Tv className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600 dark:text-zinc-400 font-bold uppercase text-[11px]">S:</span>
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
                <span className="text-gray-600 dark:text-zinc-400 font-bold uppercase text-[11px]">E:</span>
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
          key={`${server}-${season}-${episode}-${key}`}
          src={getEmbedUrl()}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; orientation; fullscreen"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Server Selector Bar at Bottom */}
      <div className="px-4 py-2.5 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-900 flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide text-xs shrink-0 transition-colors">
        <div className="flex items-center gap-2 min-w-max">
          <span className="flex items-center gap-1 font-bold text-gray-700 dark:text-zinc-300 mr-2 text-xs">
            <Server className="w-4 h-4 text-red-600 dark:text-red-500" /> Switch Server:
          </span>
          {SERVER_OPTIONS.map((srv) => (
            <button
              key={srv.id}
              onClick={() => setServer(srv.id)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${server === srv.id
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                  : "bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-zinc-800"
                }`}
            >
              <span>{srv.name}</span>
              {srv.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase font-black tracking-wider ${server === srv.id ? "bg-white/25 text-white" : "bg-red-600/20 text-red-600 dark:text-red-400"
                  }`}>
                  {srv.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VidSrcPlayerModal;
