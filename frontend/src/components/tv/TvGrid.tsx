import apiClient from "../../servicies/api-client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useOutletContext } from "react-router-dom";
import TvRow from "./TvRow";
import { HeroSlider } from "../common/HeroSlider";

const TvGrid = () => {
  const { data: genres } = useQuery({
    queryKey: ["genres", "tv"],
    queryFn: () =>
      apiClient.get("/genre/tv/list").then((res: any) => res.data.genres),
  });

  return (
    <div className="pt-4 px-2 sm:px-4 lg:px-6">
      <HeroSlider type="tv" />
      {genres?.map((genre: any) => (
        <TvRow key={genre.id} genre={genre} />
      ))}
    </div>
  );
};

export default TvGrid;