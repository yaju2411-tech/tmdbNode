import { useQuery } from "@tanstack/react-query";
import type { MovieDetail } from "../entities/movieDetail";
import apiClient from "../servicies/api-client";

const useMovieDetail = (id?:string) => {
  return useQuery<MovieDetail>({
    queryKey: ["movieDetail", id],
    queryFn: () =>
      apiClient
        .get<MovieDetail>(`/movie/${id}`, {
          params: { 
            append_to_response: "videos",
          },
        })
        .then((res) => res.data),
    staleTime:24*60*60*1000,
    enabled: !!id, 
  });
};
export default useMovieDetail;

export const useMovieDetailCast = (id?:string) => {
  return useQuery<MovieDetail>({
    queryKey:['movieCast',id],
    queryFn:()=>apiClient
                .get<MovieDetail>(`/movie/${id}/credits`)
                .then((res)=>res.data),
    staleTime:24*60*60*1000,
    enabled:!!id
  });
}


