import { api } from "../servicies/api-client";
import { useQuery } from "@tanstack/react-query";

export const useCheckePurchased = (movieId: string | undefined, type: "movie" | "tv") => {
  const query = useQuery({
    queryKey: ["purchase-status", movieId, type],
    queryFn: async () => {
      if (!movieId) return null;
      const res = await api.get("/payment/check", {
        params: {
          contentId: movieId,
          contentType: type
        }
      });
      return res.data.status || null;
    },
    enabled: !!movieId,
    staleTime: 5 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    status: query.data,
    loading: query.isLoading,
    refetch: query.refetch,
  };
};