import {
  useWatchList,
  useRemoveWatchlist,
} from "../hooks/useWatchList";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Trash2 } from "lucide-react";
import React from "react";

const WatchlistPage = () => {
  const {user} = useOutletContext<any>();
  const navigate = useNavigate();
  const { data } = useWatchList(user?.id);
  const removeMutation = useRemoveWatchlist();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">
        My Watchlist
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {data?.map((item: any) => (
          <div
            key={item.id}
            className="group relative cursor-pointer"
            onClick={() =>
              navigate(
                item.media_type === "movie"
                  ? `/app/movieDetail/${item.media_id}`
                  : `/app/tvDetail/${item.media_id}`
              )
            }
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              className="rounded-xl"
            />
            <div className="mt-2">
              <h2 className="font-semibold line-clamp-1">
                {item.title}
              </h2>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeMutation.mutate({
                  media_id: item.media_id,
                  media_type: item.media_type,
                });
              }}
              className="absolute top-2 right-2 bg-white/70 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2
                size={15}
                className="text-red-500"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistPage;