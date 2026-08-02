import { useRecommandation } from "../../hooks/useRecommanded";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Watchlist } from "./WatchlistButton";
import { Skeleton } from "../ui/skeleton";

type Props = {
  id: string;
  type: "movie" | "tv";
  user: any;
  watchlist: any[];
};

export const RecommendationRow = ({ id, type, user, watchlist }: Props) => {
  const { data, isLoading } = useRecommandation(id, type);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!data?.length) return null;

  return (
    <div className="mt-8 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 max-w-7xl mx-auto border border-gray-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-md group">
      <div className="relative z-10 p-4 sm:p-6 text-gray-900 dark:text-white">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-[#E50914] flex items-center gap-2">
          Recommended For You
        </h2>

        {/* Side Scroll Arrows (Desktop Only) */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-[#E50914] p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white cursor-pointer shadow-lg"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-[#E50914] p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white cursor-pointer shadow-lg"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>

        {isLoading ? (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-[140px] sm:w-[170px] shrink-0 flex flex-col gap-2">
                <Skeleton className="aspect-[2/3] w-full rounded-2xl bg-gray-200 dark:bg-zinc-800" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-none [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth px-1"
          >
            {data.slice(0, 10).map((item: any) => (
              <div
                key={item.id}
                className="w-[135px] sm:w-[165px] md:w-[185px] shrink-0 cursor-pointer flex flex-col gap-2 group/card transition-all"
                onClick={() => {
                  navigate(`/app/${type}Detail/${item.id}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[2/3] bg-zinc-900 shadow-md border border-gray-200 dark:border-zinc-800 group-hover/card:border-[#E50914] transition-all">
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : `https://placehold.co/300x450?text=No+Poster`
                    }
                    alt={item.title || item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col px-0.5">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover/card:text-[#E50914] transition-colors">
                    {item.title || item.name}
                  </p>
                  <span className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 font-semibold flex items-center justify-between">
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">
                      ⭐ {item.vote_average?.toFixed(1) || "N/A"}
                    </span>
                    <span>
                      {type === "movie"
                        ? item.release_date?.substring(0, 4) || "Unknown"
                        : item.first_air_date?.substring(0, 4) || "Unknown"}
                    </span>
                    <span>
                      <Watchlist
                        userId={user?.id}
                        item={item}
                        type={type}
                        watchlist={watchlist}
                      />
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};