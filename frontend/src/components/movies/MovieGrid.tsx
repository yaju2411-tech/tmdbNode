import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../servicies/api-client";
import MovieRow from "./MovieRow";
import { useOutletContext } from "react-router-dom";
import { HeroSlider } from "../common/HeroSlider";

const MovieGrid = () => {
  const { filters, searchText } = useOutletContext<any>();
  const { data: genres } = useQuery({
    queryKey: ["genres", "movie"],
    queryFn: () =>
      apiClient.get("/genre/movie/list").then((res: any) => res.data.genres),
  });

  if (searchText) return null;

  return (
    <div className="pt-4 px-2 sm:px-4 lg:px-6">
      <HeroSlider type="movie" />
      {genres?.map((genre: any) => (
        <MovieRow key={genre.id} genre={genre} filters={filters} searchText={searchText} />
      ))}
    </div>
  );
};

export default MovieGrid;