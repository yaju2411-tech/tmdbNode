import apiClient from "../../servicies/api-client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useOutletContext } from "react-router-dom";
import TvRow from "./TvRow";

const TvGrid = () => {
  const { selectedGenre } = useOutletContext<any>();
  const { data: genres } = useQuery({
    queryKey: ["genres", "tv"],
    queryFn: () =>
      apiClient.get("/genre/tv/list").then((res:any) => res.data.genres),
  });

  const filteredGenres = selectedGenre
    ? genres?.filter((g: any) => g.id === selectedGenre)
    : genres;

  return (
    <div className="pt-6">
      {filteredGenres?.map((genre: any) => (
        <TvRow key={genre.id} genre={genre} />
      ))}
    </div>
  );
};
export default TvGrid;