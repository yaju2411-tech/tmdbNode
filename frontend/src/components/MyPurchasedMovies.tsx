import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePurchasedMovies } from "../hooks/usePurchasedMovies";
import MovieCard from "./MovieCard";
import TvCard from "./TvCard";
import { Button } from "./ui/button";

const MyMovies = () => {
  const {fullMovies,fullTv,loading} = usePurchasedMovies();
  const [show,setShow] = useState(false);
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-[#E50914] rounded-full"></div>
      </div>
    );
  }
  return (<>
      <div className="flex justify-between px-6 py-2 items-center border-b mt-2">
        <h2 className="text-2xl font-bold text-white">Content vault :</h2>
        <div className="flex gap-3 item-center">
          <Button onClick={()=>setShow(false)} variant={"outline"} size={"lg"} className="border border-none bg-zinc-800 hover:bg-green-700">📺 Tv</Button>
          <Button onClick={()=>setShow(true)} variant={"outline"} size={"lg"} className="border border-none bg-zinc-800 hover:bg-green-700">🎬 Movie</Button>
        </div>
      </div>
      {show ? (
      <div className="flex-1 max-h-[70vh] overflow-y-auto px-6 py-5 scrollbar-hide">
        <h1 className="text-2xl font-bold mb-4 text-white">
          🎬 Purchased Movies
        </h1>
        {fullMovies.length === 0 ? (
          <p className="text-gray-400">No movies purchased</p>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {fullMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>) :
      (<div className="flex-1 max-h-[70vh] overflow-y-auto px-6 py-5 scrollbar-hide">
        <h1 className="text-2xl font-bold mb-4 text-white">
          📺 Purchased TV Shows
        </h1>
        {fullTv.length === 0 ? (
          <p className="text-gray-400">No TV shows purchased</p>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {fullTv.map((tv) => (
              <TvCard key={tv.id} tvShow={tv} />
            ))}
          </div>
        )}
      </div>)}
   </>);
};

export default MyMovies;