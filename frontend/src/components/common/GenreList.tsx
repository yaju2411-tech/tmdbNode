import apiClient from "../../servicies/api-client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props{
    type : "movie" | "tv";
    onClose : (id:number|null) => void;
}
export const GenreList = ({type,onClose}:Props) => {
    const {data,isLoading} = useQuery({
        queryKey : ["genres",type],
        queryFn : () => { 
          return apiClient.get(`/genre/${type}/list`).then((res:any)=>(res.data.genres))
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

    const hideGenreList = location.pathname.includes("/movieDetail") || location.pathname.includes("/tvDetail") ||
                          location.pathname.includes("/app/watchlist") || location.pathname.includes("app/myMovies");
    if(hideGenreList) return null;
    return(
      <div className="relative group flex items-center border-b dark:border-zinc-800">
        <button
          onClick={() => scroll("left")}
          className="flex absolute left-0 z-10 h-full px-1 sm:px-2 items-center bg-gradient-to-r from-white via-white dark:from-[#141414] dark:via-[#141414] to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors" />
        </button>
        
        <div ref={scrollRef} className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 py-2 sm:py-3 scroll-smooth w-full">
        {isLoading ? Array.from({length:13}).map((_,index)=>(
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-[30px] w-[80px] rounded-2xl" />
          </div>
        )) :
        data?.map((genre: any) => (
        <button
          key={genre.id}
          onClick={()=> {
            document.getElementById(`genre-${genre.id}`)?.scrollIntoView({
              behavior : "smooth",
            });
          }}
          className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-zinc-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white text-sm whitespace-nowrap transition-colors"
        >
          {genre.name}
        </button>
      ))
    }
    </div>

        <button
          onClick={() => scroll("right")}
          className="flex absolute right-0 z-10 h-full px-1 sm:px-2 items-center bg-gradient-to-l from-white via-white dark:from-[#141414] dark:via-[#141414] to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors" />
        </button>
    </div>
    );
}