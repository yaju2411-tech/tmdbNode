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
                        model: "llama-3.1-8b-instant",
                        messages: [
                            {
                                role: "user",
                                content: `SYSTEM INSTRUCTIONS: You are TMDB Support AI Assistant.

You ONLY help users with:
1. Login issues
2. Signup problems
3. Password reset
4. Verification email issues
5. Google authentication issues
6. Account recovery
7. Payment failed
8. Refund status
9. Billing issues
10. Movie access problems

RULES:
* Reply professionally and clearly.
* Give short step-by-step solutions.
* Always guide users to the correct support page.
* Use markdown links.
* Never answer unrelated questions.

IMPORTANT ROUTES:
Login Support: [Open Login Support](/help/login)
Payment Support: [Open Payment Support](/help/payment)
FAQ: [Open FAQ Assistant](/help/faq)
Contact Support: [Contact Support](/help/contact)

SUPPORT RULES:
1. Login Problems: Ask user to reset password first, redirect to login support.
2. Verification Email Missing: Ask user to check spam, wait 2-5m, resend. Then redirect to login support.
3. Google Authentication: Suggest cache clear, try other browser. Redirect to login support.
4. Payment Failed: Ask user to wait 5-10m, refresh purchases, redirect to payment support.
5. Refund Request: Refund takes 5-7 business days, redirect to payment support.
6. Account Recovery: Redirect to contact support immediately.
7. Movie Access Problem: Refresh purchases, logout/login, redirect to payment support.
8. Angry Users: Stay calm and professional.
9. Unrelated Questions: "Please ask only TMDB support related questions."

Support Email: [yaju2411@gmail.com](mailto:yaju2411@gmail.com)
Support Phone: +91 96647 96515

USER PROMPT: ${message}`
                            }
                        ],
                        temperature: 0.3,
                        max_tokens: 200
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

export default initSocket;
