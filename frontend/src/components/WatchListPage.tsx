import {
  useWatchList,
  useRemoveWatchlist,
} from "../hooks/useWatchList";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Trash2, Film, Tv, BookmarkX, Clapperboard } from "lucide-react";
import React, { useState } from "react";

const WatchlistPage = () => {
  const { user } = useOutletContext<any>();
  const navigate = useNavigate();
  const { data = [] } = useWatchList(user?.id);
  const removeMutation = useRemoveWatchlist();
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "tv">("all");

  const movieItems = (data || []).filter((item: any) => item.media_type === "movie");
  const tvItems = (data || []).filter((item: any) => item.media_type === "tv");

  const filteredItems =
    activeTab === "movie"
      ? movieItems
      : activeTab === "tv"
      ? tvItems
      : (data || []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Toggle Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Clapperboard className="w-8 h-8 text-[#E50914]" />
            My Watchlist
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Your saved movies and TV shows for easy streaming access
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "all"
                ? "bg-[#E50914] text-white shadow-md shadow-red-950/30"
                : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            All
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-black/20 text-white font-bold">
              {(data || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("movie")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "movie"
                ? "bg-[#E50914] text-white shadow-md shadow-red-950/30"
                : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Film className="w-4 h-4" />
            Movies
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-black/20 text-white font-bold">
              {movieItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tv")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "tv"
                ? "bg-[#E50914] text-white shadow-md shadow-red-950/30"
                : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Tv className="w-4 h-4" />
            TV Shows
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-black/20 text-white font-bold">
              {tvItems.length}
            </span>
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <BookmarkX className="w-12 h-12 text-gray-400 dark:text-zinc-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No {activeTab === "movie" ? "movies" : activeTab === "tv" ? "TV shows" : "items"} in your watchlist
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm">
            Browse movies or TV series and click the bookmark icon to save them here for later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item: any) => (
            <div
              key={item.id}
              className="group relative cursor-pointer rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() =>
                navigate(
                  item.media_type === "movie"
                    ? `/app/movieDetail/${item.media_id}`
                    : `/app/tvDetail/${item.media_id}`
                )
              }
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-black/60 text-white backdrop-blur-sm border border-white/10">
                  {item.media_type === "movie" ? "Movie" : "TV Series"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMutation.mutate({
                      media_id: item.media_id,
                      media_type: item.media_type,
                    });
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-700"
                  title="Remove from Watchlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-3">
                <h2 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#E50914] transition-colors">
                  {item.title}
                </h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;