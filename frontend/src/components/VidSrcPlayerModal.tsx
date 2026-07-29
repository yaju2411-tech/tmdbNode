import React, { useState } from "react";
import { X, Server, Tv } from "lucide-react";
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
  const [server, setServer] = useState<"vidsrc_cc" | "vidsrc_icu" | "vidsrc_to" | "smashystream" | "embed2">("vidsrc_cc");
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  if (!isOpen) return null;

  const getEmbedUrl = () => {
    if (type === "movie") {
      switch (server) {
        case "vidsrc_cc":
          return `https://vidsrc.cc/v2/embed/movie/${id}`;
        case "vidsrc_icu":
          return `https://vidsrc.icu/embed/movie/${id}`;
        case "vidsrc_to":
          return `https://vidsrc.to/embed/movie/${id}`;
        case "smashystream":
          return `https://embed.smashystream.com/playere.php?tmdb=${id}`;
        case "embed2":
          return `https://www.2embed.cc/embed/${id}`;
        default:
          return `https://vidsrc.cc/v2/embed/movie/${id}`;
      }
    } else {
      switch (server) {
        case "vidsrc_cc":
          return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
        case "vidsrc_icu":
          return `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`;
        case "vidsrc_to":
          return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
        case "smashystream":
          return `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`;
        case "embed2":
          return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
        default:
          return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              {type === "movie" ? "Movie Stream" : "TV Stream"}
            </span>
            <h2 className="text-xl font-bold text-white truncate max-w-md">
              {title}
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <iframe
            key={`${server}-${season}-${episode}`}
            src={getEmbedUrl()}
            title={title}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="origin"
          />
        </div>

        {/* Player Controls / Server Selector */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-300">
          {/* Server Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-400 mr-2">
              <Server className="w-4 h-4 text-red-500" /> Server:
            </span>
            <button
              onClick={() => setServer("smashystream")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                server === "smashystream"
                  ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              SmashyStream (Default HD)
            </button>
            <button
              onClick={() => setServer("vidsrc_cc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                server === "vidsrc_cc"
                  ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              VidSrc CC
            </button>
            <button
              onClick={() => setServer("vidsrc_icu")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                server === "vidsrc_icu"
                  ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              VidSrc ICU
            </button>
            <button
              onClick={() => setServer("vidsrc_to")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                server === "vidsrc_to"
                  ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              VidSrc TO
            </button>
            <button
              onClick={() => setServer("embed2")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                server === "embed2"
                  ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              2Embed Backup
            </button>
          </div>

          {/* TV Show Season & Episode Inputs */}
          {type === "tv" && (
            <div className="flex items-center gap-3 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
              <Tv className="w-4 h-4 text-red-500" />
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-400">Season:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={season}
                  onChange={(e) => setSeason(Math.max(1, Number(e.target.value)))}
                  className="w-12 bg-zinc-800 border border-zinc-700 rounded text-center text-xs text-white py-1 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-400">Episode:</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={episode}
                  onChange={(e) => setEpisode(Math.max(1, Number(e.target.value)))}
                  className="w-12 bg-zinc-800 border border-zinc-700 rounded text-center text-xs text-white py-1 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default VidSrcPlayerModal;
