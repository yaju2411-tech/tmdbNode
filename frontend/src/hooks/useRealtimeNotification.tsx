import { useEffect, useState } from "react";
import { socket } from "../servicies/socket";
import { api } from "../servicies/api-client";

export const useRealtimeNotifications = (userId: string | null, onChange: any) => {
  useEffect(() => {
    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-room", userId);

    const handleNotification = (payload: any) => {
      onChange(payload);
    };

    socket.on("user-notification", handleNotification);

    return () => {
      socket.off("user-notification", handleNotification);
    };
  }, [userId, onChange]);
};

export const useAdminNotifications = (onChange: any) => {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-room", "admin");

    const handleAdminNotification = (payload: any) => {
      console.log("ADMIN EVENT:", payload);
      onChange(payload);
    };

    socket.on("admin-notification", handleAdminNotification);

    return () => {
      socket.off("admin-notification", handleAdminNotification);
    };
  }, [onChange]);
};

export const useNotificationBell = (userId: string | null) => {
  const [notification, setNotification] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const fetchNotification = async () => {
      try {
        const res = await api.get("/notifications");
        const list = res.data.notifications || [];
        setNotification(list);
        setUnread(list.filter((n: any) => !n.is_read).length);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotification();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-room", userId);

    const handleNewNotification = (payload: any) => {
      setNotification((prev: any) => [payload.new, ...prev]);
      setUnread((prev) => prev + 1);
    };

    socket.on("user-notification", handleNewNotification);

    return () => {
      socket.off("user-notification", handleNewNotification);
    };
  }, [userId]);

  const markAllRead = async () => {
    if (!userId) return;
    try {
      await api.put("/notifications/mark-read");
      setUnread(0);
      setNotification((prev: any) =>
        prev.map((n: any) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  return { markAllRead, notification, unread };
};