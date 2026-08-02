import { useEffect, useState } from "react";
import { api } from "../servicies/api-client";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Stats = {
  revenue: number;
  orders: number;
  users: number;
  movieRevenue: number;
  tvRevenue: number;
  movieOrder: number;
  tvOrder: number;
  successOrders: number;
  pendingOrders: number;
  failedOrders: number;
};

export const useAdminHook = (filters: {
  from?: string;
  to?: string;
  type?: string;
} = {}, status: string = "") => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [mpurchase, setMpurchase] = useState<any[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const useUsers = (search: string) => {
    return useQuery({
      queryKey: ["users", search],
      queryFn: async () => {
        const res = await api.get("/admin/users", {
          params: { search }
        });
        return res.data.users || [];
      },
    });
  };

  const { data: admin = [] } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await api.get("/admin/admins");
      return res.data.admins || [];
    },
    staleTime: Infinity,
  });

  const useMoviePurchases = (search: string, filters: { type: string }) => {
    return useQuery({
      queryKey: ["movie-purchases", page, limit, search, filters.type],
      queryFn: async () => {
        const res = await api.get("/admin/purchases", {
          params: {
            page,
            limit,
            search,
            type: filters.type
          }
        });
        return {
          rows: res.data.purchases || res.data.rows || [],
          total: res.data.pagination?.total || res.data.total || 0,
        };
      },
      placeholderData: keepPreviousData,
    });
  };

  // Fetch status according to filters
  const statsQuery = useQuery({
    queryKey: ["admin-stats", filters, status],
    queryFn: async () => {
      const res = await api.get("/admin/stats", {
        params: {
          status,
          from: filters.from,
          to: filters.to,
          type: filters.type
        }
      });
      return {
        table: res.data.table || [],
        stats: res.data.stats || {
          revenue: 0,
          orders: 0,
          users: 0,
          movieRevenue: 0,
          tvRevenue: 0,
          movieOrder: 0,
          tvOrder: 0,
          successOrders: 0,
          pendingOrders: 0,
          failedOrders: 0,
        }
      };
    },
  });

  const table = statsQuery.data?.table || [];
  const stats = statsQuery.data?.stats || {
    revenue: 0,
    orders: 0,
    users: 0,
    movieRevenue: 0,
    tvRevenue: 0,
    movieOrder: 0,
    tvOrder: 0,
    successOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
  };

  // Update user profile by Admin
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, name, email, file }: { id: string; name: string; email: string; file?: File | null; }) => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (file) {
        formData.append("avatar", file);
      }
      const res = await api.put(`/admin/user/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return res.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  // Update admin profile details
  const updateAdminMutation = useMutation({
    mutationFn: async ({ id, name, email, file }: { id: string; name: string; email: string; file?: File | null; }) => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (file) {
        formData.append("avatar", file);
      }
      const res = await api.put(`/admin/profile/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return res.data.admin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admins"],
      });
      toast.success("Admin updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  // Delete regular user by Admin
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const confirmed = window.confirm("Delete this user?");
      if (!confirmed) return false;
      await api.delete(`/admin/user/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  // Admin Logout
  const adminSignOutMutation = useMutation({
    mutationFn: async () => {
      await api.get("/auth/logout");
      return true;
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/loginPage");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    },
  });

  return {
    admin,
    moviePurchase: useMoviePurchases,
    setMpurchase,
    useUsers,
    page,
    setPage,
    setLimit,
    limit,
    stats,
    table,
    updateUserByAdmin: updateUserMutation.mutateAsync,
    deleteUserByAdmin: deleteUserMutation.mutateAsync,
    updateAdmin: updateAdminMutation.mutateAsync,
    adminSignOut: adminSignOutMutation.mutateAsync
  };
};