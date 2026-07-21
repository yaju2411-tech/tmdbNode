import { useQuery } from "@tanstack/react-query";
import apiClient from "../servicies/api-client";

export const useGlobalSearch = (query: string) => {
  return useQuery({
    queryKey: ["global-search", query],
    queryFn: async () => {
      if (!query) return [];
      const [movies, tv] = await Promise.all([
        apiClient.get("/search/movie", {
          params: { query },
        }),
        apiClient.get("/search/tv", {
          params: { query },
        }),
      ]);
      return [
        ...movies.data.results.map((m: any) => ({
          ...m,
          media_type: "movie",
        })),
        ...tv.data.results.map((t: any) => ({
          ...t,
          media_type: "tv",
        })),
      ];
    },
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
  });
};