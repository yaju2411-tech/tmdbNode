import apiClient from "../servicies/api-client";
import { useQuery } from "@tanstack/react-query";

export const useTvByGenre = (genreId: number,filters:any) => {
  return useQuery({
    queryKey: ["tvByGenre", genreId,filters],
    queryFn: () =>  apiClient.get("/discover/tv", {
          params: {
            with_genres: genreId,
            sort_by: "popularity.desc",
            "vote_average.gte": filters.rating,
            with_origin_country: filters.country,
            include_adult:!filters.familySafe,
            ...(filters.familySafe && {
              certification_country: "US",
              "certification.lte": "PG-13",
            })
          },
        })
        .then((res:any) => res.data),
    staleTime: 1000 * 60 * 60,
  });
};