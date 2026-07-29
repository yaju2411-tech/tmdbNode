import { api } from "../servicies/api-client";
import { useQuery } from "@tanstack/react-query";

export const useCheckePurchased = (movieId: string | undefined, type: "movie" | "tv") => {
  const query = useQuery({
    queryKey: ["purchase-status", movieId, type],
    queryFn: async () => {
      const res = await api.get("/payment/check", {
        params: {
          contentId: movieId || "0",
          contentType: type
        }
      });
      return {
        status: res.data.status || null,
        isSubscribed: !!res.data.isSubscribed,
        subscription: res.data.subscription || null
      };
    },
    staleTime: 5 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    status: query.data?.status || null,
    isSubscribed: !!query.data?.isSubscribed,
    subscription: query.data?.subscription || null,
    loading: query.isLoading,
    refetch: query.refetch,
  };
};