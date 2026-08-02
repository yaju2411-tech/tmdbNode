import React from "react";
import { useGlobalSearch } from "../../hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { Watchlist } from "./WatchlistButton";
import { SearchIcon, X, Star, Calendar, Film, Tv } from "lucide-react";
import { isFamilySafe } from "./SafeComponent";

interface Props {
  searchText: string;
  user: any;
  watchlist: any[];
  onClose?: () => void;
}

const GlobalSearch = ({ searchText, user, watchlist, onClose }: Props) => {
  const { data, isLoading } = useGlobalSearch(searchText);
  const navigate = useNavigate();
  const safeContent = data?.filter(isFamilySafe) || [];

  if (!searchText) return null;

  return (
    <>
      {/* Backdrop overlay for mobile & desktop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
      />

      <div className="fixed top-14 sm:top-20 left-1/2 -translate-x-1/2 w-[94vw] max-w-3xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-gray-200 dark:border-zinc-800/80 rounded-2xl z-50 shadow-2xl overflow-hidden p-3 sm:p-4 animate-in zoom-in-95 duration-200">
        {/* Search Query Header */}
        <div className="rounded-xl bg-gray-100 dark:bg-zinc-900/80 p-3 sm:px-4 flex items-center justify-between mb-3 border border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <SearchIcon size={18} className="text-red-600 dark:text-red-500 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
              Results for &quot;<span className="text-red-600 dark:text-red-400">{searchText}</span>&quot;
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex flex-col max-h-[65vh] sm:max-h-[70vh] overflow-y-auto scrollbar-hide space-y-2 pr-1">
          {isLoading ? (
            <div className="p-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold animate-pulse">
              Searching movies & TV shows...
            </div>
          ) : safeContent.length === 0 ? (
            <div className="p-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold">
              No movies or TV shows found matching &quot;{searchText}&quot;
            </div>
          ) : (
            safeContent.map((item: any) => {
              const isMovie = item.media_type === "movie";
              const title = item.title || item.name || "Untitled";
              const dateStr = item.release_date || item.first_air_date;
              const year = dateStr ? new Date(dateStr).getFullYear() : null;
              const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
              const poster = item.poster_path
                ? `https://image.tmdb.org/t/p/w300/${item.poster_path}`
                : "https://placehold.co/120x180?text=No+Poster";

              return (
                <div
                  key={`${item.media_type}-${item.id}`}
                  onClick={() => {
                    if (onClose) onClose();
                    navigate(isMovie ? `/app/movieDetail/${item.id}` : `/app/tvDetail/${item.id}`);
                  }}
                  className="group flex items-center justify-between p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-900/80 border border-transparent hover:border-gray-200 dark:hover:border-zinc-800/80 cursor-pointer transition-all duration-200 min-w-0"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-2">
                    <img
                      src={poster}
                      alt={title}
                      className="w-11 h-16 sm:w-14 sm:h-20 rounded-lg object-cover shrink-0 shadow-md border border-gray-200 dark:border-zinc-800 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col min-w-0 space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                        {title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-0.5 rounded-md font-extrabold uppercase bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center gap-1">
                          {isMovie ? <Film size={10} /> : <Tv size={10} />}
                          {isMovie ? "Movie" : "TV Show"}
                        </span>
                        {year && (
                          <span className="flex items-center gap-1 font-semibold">
                            <Calendar size={11} className="text-gray-400" />
                            {year}
                          </span>
                        )}
                        {rating && (
                          <span className="flex items-center gap-1 font-extrabold text-amber-500">
                            <Star size={11} className="fill-current" />
                            {rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Watchlist Action Button */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  >
                    <Watchlist
                      item={item}
                      type={item.media_type}
                      userId={user?.id}
                      watchlist={watchlist}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default GlobalSearch;