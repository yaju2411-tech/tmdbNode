import { useQuery } from "@tanstack/react-query";
import apiClient, { api } from "../servicies/api-client";

export const usePurchasedMovies = () => {
  const fetchPurchases = async () => {
    const res = await api.get("/payment/my-purchases");
    const purchases = res.data.purchases || [];

    const movieData = purchases.filter((p: any) => p.contentType === "movie");
    const tvData = purchases.filter((p: any) => p.contentType === "tv");

    const movieDetails = await Promise.all(
      movieData.map((m: any) =>
        apiClient.get(`/movie/${m.contentId}`).then((res) => ({
          ...res.data,
          payment_id: m.razorpayPaymentId,
        }))
      )
    );

    const tvDetails = await Promise.all(
      tvData.map((t: any) =>
        apiClient.get(`/tv/${t.contentId}`).then((res) => ({
          ...res.data,
          payment_id: t.razorpayPaymentId,
        }))
      )
    );

    return {
      fullMovies: movieDetails.filter(Boolean),
      fullTv: tvDetails.filter(Boolean),
    };
  };

  const { data, isLoading } = useQuery({
    queryKey: ["purchasedMovies"],
    queryFn: fetchPurchases,
    staleTime: 24 * 60 * 60 * 1000,
  });

  return {
    fullMovies: data?.fullMovies || [],
    fullTv: data?.fullTv || [],
    loading: isLoading,
  };
};