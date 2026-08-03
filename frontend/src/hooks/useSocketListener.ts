import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import socket from "../servicies/socket";

export const useSocketListener = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    // 1. Subscription & Payment Events
    const handleSubscriptionOrPayment = () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-status"] });
      queryClient.invalidateQueries({ queryKey: ["purchasedMovies"] });
      queryClient.invalidateQueries({ queryKey: ["userPurchases"] });
      queryClient.invalidateQueries({ queryKey: ["receipt-data"] });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["movie-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    };

    // 2. Ticket Created / Updated Events
    const handleTicket = () => {
      queryClient.invalidateQueries({ queryKey: ["adminTickets"] });
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-status"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    };

    // 3. User Updated Events
    const handleUser = () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    };

    // 4. Watchlist Updated Events
    const handleWatchlist = () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    };

    // 5. Dashboard Stats Updated Events
    const handleStats = () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["movie-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    };

    // Register all Socket.io event listeners
    socket.on("subscription_updated", handleSubscriptionOrPayment);
    socket.on("payment_success", handleSubscriptionOrPayment);
    socket.on("purchase_created", handleSubscriptionOrPayment);
    socket.on("purchase_updated", handleSubscriptionOrPayment);
    socket.on("purchase_deleted", handleSubscriptionOrPayment);
    socket.on("payment-status-updated", handleSubscriptionOrPayment);
    socket.on("ticket_created", handleTicket);
    socket.on("ticket_updated", handleTicket);
    socket.on("user_updated", handleUser);
    socket.on("watchlist_updated", handleWatchlist);
    socket.on("stats_updated", handleStats);

    return () => {
      socket.off("subscription_updated", handleSubscriptionOrPayment);
      socket.off("payment_success", handleSubscriptionOrPayment);
      socket.off("purchase_created", handleSubscriptionOrPayment);
      socket.off("purchase_updated", handleSubscriptionOrPayment);
      socket.off("purchase_deleted", handleSubscriptionOrPayment);
      socket.off("payment-status-updated", handleSubscriptionOrPayment);
      socket.off("ticket_created", handleTicket);
      socket.off("ticket_updated", handleTicket);
      socket.off("user_updated", handleUser);
      socket.off("watchlist_updated", handleWatchlist);
      socket.off("stats_updated", handleStats);
    };
  }, [queryClient]);
};

export default useSocketListener;
