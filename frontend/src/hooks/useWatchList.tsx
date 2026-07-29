import { api } from "../servicies/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// fetch watchlist
export const useWatchList = (user: string) => {
  return useQuery({
    queryKey: ["watchlist", user],
    queryFn: async () => {
      const res = await api.get("/watchlist");
      return res.data ?? [];
    },
    enabled: !!user,
    staleTime: 24 * 60 * 60 * 1000,
  });
};

// insert watchlist
export const useAddMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: any) => {
      const res = await api.post("/watchlist", {
        media_id: item.id,
        media_type: item.media_type,
        title: item.title || item.name,
        poster_path: item.poster_path,
      });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["watchlist"],
      });
    },
  });
};

// delete watchlist
export const useRemoveWatchlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      media_id,
      media_type,
    }: any) => {
      const res = await api.delete(`/watchlist/${media_id}/${media_type}`);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["watchlist"],
      });
    },
  });
};