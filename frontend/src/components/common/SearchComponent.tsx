import React from "react";
import { useGlobalSearch } from "../../hooks/useSearch";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Watchlist } from "./WatchlistButton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SearchCheckIcon, SearchIcon, X } from "lucide-react";
import { isFamilySafe } from "./SafeComponent";

interface Props {
  searchText: string;
  user : any;
  watchlist : any[];
  onClose?: () => void;
}

const GlobalSearch = ({ searchText, user, watchlist, onClose }: Props) => {
  const { data } = useGlobalSearch(searchText);
  const navigate = useNavigate();
  const location = useLocation();
  const safeContent = data?.filter(isFamilySafe);
  if (!searchText) return null;
  return (
     <div className="w-[95%] sm:w-full absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 max-w-[95vw] sm:max-w-md md:max-w-3xl lg:max-w-4xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl z-50 shadow-2xl p-3 sm:p-4">
      <h2 className="mx-auto rounded-lg bg-gray-100 dark:bg-zinc-800 py-2 px-4 sm:px-5 flex items-center capitalize text-base sm:text-lg font-bold mb-3 sm:mb-4 gap-3 sm:gap-5 text-gray-800 dark:text-gray-200">
        <SearchIcon size={20}/>
        <span className="truncate">{searchText}</span>        
      </h2>
      <div className="overflow-x-hidden flex flex-col max-h-[70vh] overflow-y-auto scrollbar-hide">
        {safeContent?.map((item: any) => (
          <div
            key={`${item.media_type}-${item.id}`}
            onClick={() => {
              if (onClose) onClose();
              navigate(item.media_type === "movie" ? `/app/movieDetail/${item.id}` : `/app/tvDetail/${item.id}`);
            }}
            className="flex items-center justify-between min-w-md cursor-pointer py-2 hover:bg-gray-100 dark:hover:bg-zinc-800/60 px-3 rounded-lg transition-colors"
          >
            <div className="flex gap-5">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl overflow-hidden">
                <img src={ item.poster_path
                     ? `https://image.tmdb.org/t/p/w300/${item.poster_path}`
                     : "https://placehold.co/80x80?text=No+Image"} />
              </div>
              <p className="text-green-600 mt-2 md:mt-5 dark:text-green-500 font-bold text-sm md:text-md">
                {item.title || item.name}
              </p>
            </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-green-600 dark:text-red-500 font-bold">
                  {item.media_type.toUpperCase()}
                </span>
                <span>
                  <Watchlist
                    item={item} type={item.media_type} userId={user?.id} watchlist={watchlist}/>
                </span>
              </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalSearch;