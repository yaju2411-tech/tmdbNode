import { api } from "../servicies/api-client";
import { useQuery } from "@tanstack/react-query";

export const usePaymentId = (movieId: string, type: "movie" | "tv") => {
  const query = useQuery({
    queryKey: ["receipt-data", movieId, type],
    queryFn: async () => {
      if (!movieId) return null;
      const res = await api.get("/payment/payment-id", {
        params: {
          contentId: movieId,
          contentType: type,
        },
      });
      return {
        orderId: res.data.orderId || null,
        paymentId: res.data.paymentId || null,
        receiptNumber: res.data.receiptNumber || null,
      };
    },
    enabled: !!movieId,
    staleTime: 5 * 1000,
  });

  return {
    orderId: query.data?.orderId || null,
    paymentId: query.data?.paymentId || null,
    receiptNumber: query.data?.receiptNumber || null,
    loading: query.isLoading,
  };
};