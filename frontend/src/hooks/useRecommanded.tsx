import { Recommandation } from "../entities/recommanded";
import apiClient from "../servicies/api-client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const fetchResponse = async (
  id: string,
  type: "movie" | "tv"
) => {
  try {
    const endpoint =
      type === "movie"
        ? `/movie/${id}/recommendations`
        : `/tv/${id}/recommendations`;
    const { data } = await apiClient.get(endpoint);
    return data.results as Recommandation[];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const useRecommandation = (
  id: string,
  type: "movie" | "tv"
) => {
  return useQuery<Recommandation[]>({
    queryKey: ["recommandations", id, type],
    queryFn: () => fetchResponse(id, type),
    enabled: !!Number(id),
    staleTime: 24 * 60 * 60 * 1000,
  });
};