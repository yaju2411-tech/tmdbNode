import apiClient from "../../servicies/api-client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

interface Props {
  type: "movie" | "tv";
  selectedGenre?: number | null;
  onClose: (id: number | null) => void;
}

export const GenreList = ({ type, selectedGenre, onClose }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["genres", type],
    queryFn: () => {
      return apiClient.get(`/genre/${type}/list`).then((res: any) => res.data.genres);
    },
  });

  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const hideGenreList =
    location.pathname.includes("/movieDetail") ||
    location.pathname.includes("/tvDetail") ||
    location.pathname.includes("/app/watchlist") ||
    location.pathname.includes("app/myMovies");

  if (hideGenreList) return null;

  return (
    <div className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#141414]/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800/80 transition-colors">
      <div className="relative group flex items-center px-1 sm:px-4">
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 z-10 h-full px-2 items-center bg-gradient-to-r from-white via-white/90 dark:from-[#141414] dark:via-[#141414]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-gray-600 dark:text-gray-300 hover:text-[#E50914] transition-colors" size={20} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 sm:px-6 py-2 sm:py-2.5 scroll-smooth w-full items-center"
        >
          {isLoading
            ? Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-24 rounded-full bg-gray-200 dark:bg-zinc-800 flex-none" />
            ))
            : data?.map((genre: any) => {
              const isSelected = selectedGenre === genre.id;
              return (
                <button
                  key={genre.id}
                  onClick={() => {
                    onClose(genre.id);
                    document.getElementById(`genre-${genre.id}`)?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${isSelected
                    ? "bg-[#E50914] text-white shadow-md shadow-red-600/30"
                    : "bg-gray-100 dark:bg-zinc-800/90 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                >
                  {genre.name}
                </button>
              );
            })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 z-10 h-full px-2 items-center bg-gradient-to-l from-white via-white/90 dark:from-[#141414] dark:via-[#141414]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-gray-600 dark:text-gray-300 hover:text-[#E50914] transition-colors" size={20} />
        </button>
      </div>
    </div>
  );
};