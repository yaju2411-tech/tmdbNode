import { useParams, useOutletContext } from "react-router-dom";
import { useState } from "react";
import React from "react";
import MovieTrailer from "./MovieDetailPageTrailer";
import MovieDetailInfo from "./MovieDetailInfo";
import { RecommendationRow } from "../common/Recommanded";

const MovieDetailPage = () => {
  const { id: movieId } = useParams<{ id: string }>();
  const { user, watchlist } = useOutletContext<any>();
  const [show, setShow] = useState(false);

  if (!movieId) return <h1 className="text-gray-900 dark:text-white mt-10 text-center text-2xl font-bold">Invalid Movie</h1>;

  return (
    <div className="min-h-screen text-gray-900 dark:text-white pb-10 w-full px-2 sm:px-6">
      <MovieTrailer onMoreDetail={() => setShow(!show)} />
      {show && (
        <div className="z-10 mx-auto mt-4 sm:mt-8">
          <MovieDetailInfo onClose={() => setShow(false)} />
        </div>
      )}
      <RecommendationRow id={movieId!} type="movie" user={user?.id} watchlist={watchlist} />
    </div>
  );
};

export default MovieDetailPage;