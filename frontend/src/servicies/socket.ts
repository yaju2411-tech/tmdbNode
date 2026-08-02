import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket", "polling"]
});

export default socket;
