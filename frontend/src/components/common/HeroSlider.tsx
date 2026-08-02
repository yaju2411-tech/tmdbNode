import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../servicies/api-client";
import YouTube from "react-youtube";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  Play,
  Star,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  PauseCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Props {
  type: "movie" | "tv";
}

export const HeroSlider = ({ type }: Props) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [trailerKeys, setTrailerKeys] = useState<{ [id: number]: string }>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(true);
  const [mute, setMute] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTop5 = async () => {
      setIsLoading(true);
      try {
        const endpoint =
          type === "movie"
            ? "/discover/movie?sort_by=popularity.desc"
            : "/discover/tv?sort_by=popularity.desc";
        const res = await apiClient.get(endpoint);
        const top5 = res.data?.results?.slice(0, 5) || [];
        setItems(top5);

        // Fetch trailers for the top 5
        const keysMap: { [id: number]: string } = {};
        for (const item of top5) {
          try {
            const videoRes = await apiClient.get(`/${type}/${item.id}/videos`);
            const trailer = videoRes.data.results?.find(
              (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
            ) || videoRes.data.results?.find((v: any) => v.site === "YouTube");
            if (trailer) {
              keysMap[item.id] = trailer.key;
            }
          } catch (err) {
            console.error(`Error fetching trailer for ${type} ${item.id}:`, err);
          }
        }
        setTrailerKeys(keysMap);
      } catch (err) {
        console.error(`Error fetching top 5 ${type}s:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTop5();
  }, [type]);

  const activeItem = items[activeIndex];
  const activeTrailerKey = activeItem ? trailerKeys[activeItem.id] : "";

  const onReady = (e: any) => {
    setPlayer(e.target);
    e.target.mute();
    e.target.playVideo();
  };

  const togglemute = () => {
    if (!player) return;
    if (mute) {
      player.unMute();
    } else {
      player.mute();
    }
    setMute(!mute);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
    setShowTrailer(true);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    setShowTrailer(true);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[400px] lg:h-[500px] bg-zinc-900 rounded-2xl overflow-hidden mb-6 relative">
        <Skeleton className="w-full h-full bg-zinc-800" />
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  const title = activeItem.title || activeItem.name;
  const releaseDate = activeItem.release_date || activeItem.first_air_date;
  const rating = activeItem.vote_average?.toFixed(1) || "8.5";

  return (
    <div className="relative w-full h-[440px] sm:h-[480px] lg:h-[520px] rounded-2xl md:rounded-3xl overflow-hidden mb-6 bg-black shadow-2xl transition-all">
      {/* Background Media / Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {showTrailer && activeTrailerKey ? (
          <div
            className="absolute inset-0 z-10 bg-black overflow-hidden cursor-pointer"
            onClick={() => setShowTrailer(false)}
          >
            <div
              className="w-full h-full pointer-events-none flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <YouTube
                key={`${activeItem.id}-${activeIndex}`}
                videoId={activeTrailerKey}
                onReady={onReady}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: {
                    autoplay: 1,
                    rel: 0,
                    modestbranding: 1,
                    controls: 0,
                    disablekb: 1,
                    iv_load_policy: 3,
                    fs: 0,
                  },
                }}
                onEnd={handleNext}
                className="w-full h-full scale-150 [&>iframe]:w-full [&>iframe]:h-full"
              />
            </div>
          </div>
        ) : null}

        {activeItem.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/original${activeItem.backdrop_path}`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* Central Pause Indicator overlay (desktop only) */}
      {showTrailer && activeTrailerKey && (
        <div className="hidden sm:flex absolute inset-0 z-20 items-center justify-center pointer-events-none">
          <div className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-md text-white border border-white/20 shadow-2xl">
            <div className="text-2xl font-black tracking-widest leading-none">||</div>
          </div>
        </div>
      )}

      {/* Pure Dark Vignette Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/60 z-10 pointer-events-none" />

      {/* Next/Prev Navigation Arrows (desktop only) */}
      <button
        onClick={handlePrev}
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 text-white hover:bg-[#E50914] backdrop-blur-md transition-all cursor-pointer shadow-lg"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={handleNext}
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 text-white hover:bg-[#E50914] backdrop-blur-md transition-all cursor-pointer shadow-lg"
        aria-label="Next Slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Player Control Buttons (Positioned at Top-Right on mobile, Bottom-Right on desktop) */}
      <div className="absolute top-4 right-4 sm:top-auto sm:bottom-6 sm:right-6 z-30 flex items-center gap-1.5 sm:gap-2">
        {!showTrailer && activeTrailerKey && (
          <Button
            className="bg-[#E50914] hover:bg-red-700 text-white rounded-full p-2 sm:p-2.5 shadow-lg cursor-pointer h-8 w-8 sm:h-auto sm:w-auto"
            onClick={() => setShowTrailer(true)}
          >
            <Play size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Button>
        )}

        {showTrailer && activeTrailerKey && (
          <>
            <Button
              className="bg-[#E50914] hover:bg-red-700 text-white rounded-full p-2 sm:p-2.5 shadow-lg cursor-pointer h-8 w-8 sm:h-auto sm:w-auto"
              onClick={togglemute}
            >
              {mute ? (
                <VolumeX size={16} className="sm:w-[18px] sm:h-[18px]" />
              ) : (
                <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              )}
            </Button>

            <Button
              className="bg-[#E50914] hover:bg-red-700 text-white rounded-full p-2 sm:p-2.5 shadow-lg cursor-pointer h-8 w-8 sm:h-auto sm:w-auto"
              onClick={() => player && player.pauseVideo()}
              onDoubleClick={() => player && player.playVideo()}
            >
              <PauseCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Button>

            <Button
              className="bg-[#E50914] hover:bg-red-700 text-white rounded-full p-2 sm:p-2.5 shadow-lg cursor-pointer h-8 w-8 sm:h-auto sm:w-auto"
              onClick={() => setShowTrailer(false)}
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Button>
          </>
        )}
      </div>

      {/* Slide Indicators (Top 5 Dots) */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveIndex(idx);
              setShowTrailer(true);
            }}
            className={`transition-all rounded-full cursor-pointer ${
              activeIndex === idx
                ? "w-5 sm:w-6 h-1.5 sm:h-2 bg-[#E50914]"
                : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Overlay Content Box */}
      <div className="relative z-20 h-full flex items-end p-4 sm:p-10 pb-12 sm:pb-10">
        <div className="max-w-lg sm:max-w-xl">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#E50914]/20 border border-[#E50914]/40 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full mb-2 sm:mb-3 backdrop-blur-sm">
            <Sparkles size={12} className="text-[#E50914] sm:w-[14px] sm:h-[14px]" />
            <span className="text-[#E50914] font-bold tracking-wider text-[10px] sm:text-[11px] uppercase">
              TOP 5 TRENDING #{activeIndex + 1}
            </span>
          </div>

          <h2 className="text-xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 text-white leading-tight drop-shadow-md line-clamp-1">
            {title}
          </h2>

          <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3.5 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
              <Star size={13} className="fill-amber-500 text-amber-500 sm:w-[15px] sm:h-[15px]" />
              <span>{rating}</span>
            </div>
            <span className="text-gray-200">
              {releaseDate?.split("-")[0] || "2026"}
            </span>
            <span className="uppercase bg-[#E50914] text-white px-1.5 py-0.5 rounded font-bold text-[9px] sm:text-[10px]">
              4K ULTRA HD
            </span>
          </div>

          <p className="text-gray-200 line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 max-w-lg">
            {activeItem.overview ||
              "Stream top rated blockbusters and trending series in full high definition."}
          </p>

          <Button
            className="bg-[#E50914] hover:bg-red-700 text-white px-5 sm:px-7 py-3 sm:py-5 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105 cursor-pointer h-9 sm:h-auto"
            onClick={() => navigate(`/app/${type}Detail/${activeItem.id}`)}
          >
            <Play className="mr-1.5 sm:mr-2 fill-white" size={16} />
            Watch Now
          </Button>
        </div>
      </div>
    </div>
  );
};
