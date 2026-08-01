import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../servicies/api-client";
import MovieRow from "./MovieRow";
import { useOutletContext } from "react-router-dom";

const MovieGrid = () => {
  const { selectedGenre, filters, searchText,user} = useOutletContext<any>();
  const { data: genres } = useQuery({
    queryKey: ["genres", "movie"],
    queryFn: () =>
      apiClient.get("/genre/movie/list").then((res:any) => res.data.genres),
  });
  const filteredGenres = selectedGenre
    ? genres?.filter((g: any) => g.id === selectedGenre)
    : genres;
  if (searchText) return null;
  return (
    <div className="pt-4">
      {filteredGenres?.map((genre: any) => (
        <MovieRow key={genre.id} genre={genre} filters={filters} searchText={searchText}/>
      ))}
    </div>
  );
};

export default MovieGrid;