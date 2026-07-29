import { useQuery } from "@tanstack/react-query";
import { type CastResponse, type TvDetail } from "../entities/tvDeatil";
import apiClient from "../servicies/api-client";

const useTvDetail = (id?:string) => {
  return useQuery<TvDetail>({
    queryKey: ["TvDetail", id],
    queryFn: () =>
      apiClient
        .get<TvDetail>(`/tv/${id}`, {
          params: { 
            append_to_response: "videos",
          },
        })
        .then((res) => res.data),
    enabled: !!id, 
  });
};
export default useTvDetail;

export const useTvDetailCast = (id?:string) => {
    return useQuery<CastResponse>({
        queryKey:['tv-cast',id],
        queryFn:()=>apiClient.get(`/tv/${id}/credits`).then((res)=>res.data),
        staleTime:24*60*60*1000,
        enabled:!!id,
    });
}
