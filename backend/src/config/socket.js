import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Join room based on user id or ticket id
        socket.on("join-room", (roomName) => {
            socket.join(roomName);
            console.log(`👤 Client ${socket.id} joined room: ${roomName}`);
        });

        // Real-time Chatbot AI assistant handler
        socket.on("ask-chatbot", async (data) => {
            try {
                const { message } = data;
                if (!message) {
                    socket.emit("chatbot-error", "Message is required");
                    return;
                }

                // Notify client that AI is preparing response
                socket.emit("chatbot-status", "thinking");

                const apiKey = process.env.GROQ_API;
                const geminiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            {
                                role: "system",
                                content: `You are the TMDB AI Assistant — an expert, friendly, and highly intelligent customer support assistant for TMDB streaming platform.

SCOPES & KNOWLEDGE:
1. Account & Auth: Signup on /login (email/pass + captcha + 6-digit OTP or Google sign-in). Login on /login. Forgot password via OTP verification.
2. VIP Subscriptions: Monthly (₹199/30d), Quarterly (₹399/90d — Best Value!), Annual (₹1,499/365d — Save 37%). Grants 100% unlimited ad-free access to all movies and TV shows.
3. Payments: Pay via Razorpay (UPI, Credit/Debit Cards, NetBanking, Wallets). Activates instantly. If access is pending, do hard refresh (Ctrl+Shift+R) or submit ticket.
4. Receipts: Official tax receipts generated instantly for every purchase. View/download under "VIP Vault" / "Receipts".
5. Streaming: 5 HD servers (SmashyStream, VidSrc CC, VidLink, AutoEmbed, 2Embed). Change seasons & episodes directly in the player bar for TV shows.
6. Support Tickets: Submit at /app/help. Billing tickets require plan, amount, and payment screenshot proof image (up to 5 images).
7. Contact: Email: yaju2411@gmail.com | Phone: +91 96647 96515.

STRICT RULES:
- NEVER mention internal admin panels or admin features.
- Provide clear, concise, structured solutions using markdown links.
- For unrelated queries, state: "I can only answer TMDB platform support questions."`
                            },
                            {
                                role: "user",
                                content: message
                            }
                        ],
                        temperature: 0.4,
                        max_tokens: 350
                    })
                });

                const apiData = await geminiResponse.json();
                const reply = apiData?.choices?.[0]?.message?.content || "no response generated";

                // Return AI reply response
                socket.emit("chatbot-response", { reply });
            } catch (err) {
                console.error("Socket chatbot error:", err);
                socket.emit("chatbot-response", { reply: "AI support currently unavailable." });
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const broadcastEvent = (event, data) => {
    try {
        if (io) {
            io.emit(event, data);
        }
    } catch (err) {
        console.error(`Failed to broadcast socket event '${event}':`, err);
    }
};

export default initSocket;
