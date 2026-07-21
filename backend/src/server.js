import "./config/env.js";
import http from "http";
import app from "./app.js";
import connectDB from "./config/database.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    initSocket(server);
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();