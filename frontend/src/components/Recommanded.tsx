import { useRecommandation } from "../hooks/useRecommanded";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Watchlist } from "./WatchlistButton";
import { Skeleton } from "../components/ui/skeleton";

type Props = {
  id: string;
  type: "movie" | "tv";
  user : any;
  watchlist : any[];
};

export const RecommendationRow = ({ id,type,user,watchlist }: Props) => {
  const { data, isLoading } = useRecommandation(id, type);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll=(dir:"left"|"right")=>{
    if(!scrollRef.current) return;
    const scrollAmount = 500;
    scrollRef.current.scrollBy({
      left : dir === "left" ? -scrollAmount : scrollAmount,
      behavior : "smooth"
    });
  }
  if (!data?.length) return null;
  return (
  <div className="mt-8 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 max-w-7xl mx-auto border dark:border-zinc-800/40 dark:bg-black/20 backdrop-blur-sm group">
      <div className="relative z-10 p-6 text-red-500 dark:text-white">
      <h2 className="text-xl font-bold mb-5">Recommended for you</h2>
        <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
        <ChevronLeft className="text-white w-5 h-5" />
        </button>
        <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
        <ChevronRight className="text-white w-5 h-5" />
        </button>
      {isLoading ? 
        <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
            <div
                key={i}
                className="min-w-[150px] cursor-pointer h-full h-12 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-md"
            />
            ))}
        </div>
       : <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-1 mx-auto">
        {data.slice(0, 10).map((item: any) => (
          <div
            key={item.id}
            className="min-w-[180px] cursor-pointer h-full"
            onClick={() =>
              navigate(`/app/${type}Detail/${item.id}`)
            }
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              className="rounded-2xl w-full overflow-hidden"
            />
            <div className="text-xs text-black dark:text-gray-400 mt-1 font-semibold flex flex-col justify-between overflow-hidden">
              <p className="text-sm truncate">
                {item.title || item.name}
              </p>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-semibold flex items-center justify-between overflow-hidden">
                  <span className="text-green-600 dark:text-green-500 font-bold">⭐ {item.vote_average?.toFixed(1) || "N/A"}</span>
                  <span>{type==="movie" ? (item.release_date?.substring(0, 4) || "Unknown") : (item.first_air_date?.substring(0, 4) || "Unknown")}</span>
                  <span>{type === "movie" ? (<Watchlist
                        userId={user?.id}
                        item={item}
                        type="movie"
                        watchlist={watchlist}
                      />) : (<Watchlist
                        watchlist={watchlist}
                        userId={user?.id}
                        item={item}
                        type="tv"
                      />)}
                  </span>
              </span>
            </div>
          </div>
        ))}
      </div>}
    </div>
    </div>
  );
};