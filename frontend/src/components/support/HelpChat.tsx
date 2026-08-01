import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertCircle, Loader2 } from "lucide-react";
import { api } from "../../servicies/api-client";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export const HelpChat = ({ onSwitchToTicket }: { onSwitchToTicket: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm the TMDB AI Assistant. How can I help you with your account, login, or purchases today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const fullHistory = [...messages, userMessage];
      const response = await api.post("/help/ai-chat", {
        messages: fullHistory.slice(-15),
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.data.reply },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting to my brain right now. " + (error.response?.data?.message || "Please try again later or submit a support ticket."),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[550px] justify-between bg-gray-50 dark:bg-zinc-950/50">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-[360px] max-h-[460px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex max-w-[80%] sm:max-w-[70%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-[#E50914] text-white"
                }`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-zinc-700 rounded-tl-sm"
                }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center mt-1">
                <Bot size={16} />
              </div>
              <div className="px-4 py-4 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-tl-sm flex items-center gap-1 shadow-sm">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Helper / Switch to Ticket (Fixed above input as in Screenshot 2) */}
      <div className="px-4 sm:px-6 py-2.5 bg-blue-50/80 dark:bg-blue-950/40 border-t border-blue-100 dark:border-blue-900/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 font-medium">
          <AlertCircle size={16} />
          <span>Still stuck?</span>
        </div>
        <button
          onClick={onSwitchToTicket}
          className="text-sm font-bold text-[#E50914] hover:underline"
        >
          Submit a Ticket
        </button>
      </div>

      {/* Input Area (Fixed at bottom) */}
      <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3.5 bg-gray-100 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:bg-white dark:focus:bg-zinc-900 transition-all disabled:opacity-50 dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-[#E50914] hover:bg-red-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-[#E50914]"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
};
