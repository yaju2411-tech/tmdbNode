import React, { useRef } from "react";
import {useMovieByGenre} from "../../hooks/useMoviesByGenre";
import { useNavigate, useOutlet, useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getGenreIcon } from "../../utils/genreIcons";
import { useTvByGenre } from "../../hooks/useTvByGenre";
import { Watchlist } from "../common/WatchlistButton";
import { Skeleton } from "../ui/skeleton";
import { isFamilySafe } from "../common/SafeComponent";

const MovieRow = ({ genre }: any) => {
  const {filters} = useOutletContext<any>();
  const { data,isLoading } = useTvByGenre(genre.id,filters);
  const safeMovies = data?.results?.filter(isFamilySafe);
  const { user, watchlist } = useOutletContext<any>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 500;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (<>
     {safeMovies?.length > 0 && <div id={`genre-${genre.id}`} className="mb-8 group relative">
          <h2 className="flex font-bold text-xl text-red-500 mb-4 px-6 gap-3 items-center">
            {getGenreIcon(genre.name)}
            {genre.name}
          </h2>
          {/* Arrows */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white dark:bg-white/50 dark:text-black p-1.5 sm:p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white dark:bg-white/50 dark:text-black p-1.5 sm:p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>
          {/* Row */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-6 scroll-smooth snap-x snap-mandatory"
          >
            {isLoading ? 
              Array.from({length:10}).map((_,index)=>(
                <div key={index} className="w-[130px] sm:w-[160px] md:w-[190px] lg:w-[212px] shrink-0 snap-start flex flex-col gap-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                   <div className="flex flex-col gap-2 px-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
             : 
              safeMovies?.slice(0, 10).map((tv: any) => (
                <div
                  key={tv.id}
                  className="w-[130px] sm:w-[160px] md:w-[190px] lg:w-[212px] shrink-0 snap-start group cursor-pointer flex flex-col gap-2 transition-transform duration-300 hover:scale-105"
                  onClick={() => navigate(`/app/tvDetail/${tv.id}`)}
                >
                  <div className="relative overflow-hidden rounded-2xl aspect-[2/3] bg-zinc-900 shadow-md transition-shadow group-hover:shadow-[0_0_15px_rgba(229,9,20,0.3)]">
                    <img
                      src={tv.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : `https://placehold.co/300x450?text=No+Image`}
                      alt={tv.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col px-1">
                    <h3 className="text-sm font-bold text-red-500 line-clamp-1 transition-colors">
                      {tv.name}
                    </h3>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-semibold flex items-center gap-1 overflow-hidden justify-between">
                      <span className="text-green-600 dark:text-green-500 font-bold">⭐ {tv.vote_average?.toFixed(1) || "N/A"}</span>
                      <span>{tv.first_air_date?.substring(0, 4) || "Unknown"}</span>
                      <span><Watchlist userId={user} item={tv} type="tv" watchlist={watchlist}/></span>
                    </span>
                  </div>
              </div>
            ))}
          </div>
      </div>}
  </>);
};

export default MovieRow;