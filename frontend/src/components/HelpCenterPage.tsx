import React, { useState, useEffect } from "react";
import { HelpChat } from "../components/HelpChat";
import { HelpTicketForm } from "../components/HelpTicketForm";
import { Bot, Mail, ShieldAlert, ArrowLeft, SunIcon, MoonIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HelpCenterPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "ticket">("chat");
  const [isDark, setIsDark] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("theme") === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors relative">
      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-10">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors bg-gray-100 dark:bg-zinc-900/80 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-zinc-800"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-gray-100 dark:bg-zinc-900/80 text-gray-600 dark:text-gray-300 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors shadow-sm border border-gray-200 dark:border-zinc-800"
        >
          {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
      </div>

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-3">
            <ShieldAlert className="text-[#E50914] w-10 h-10" />
            TMDB Help Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get instant help from our AI assistant or submit a ticket to our support team.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${activeTab === "chat"
              ? "bg-white dark:bg-zinc-800 text-[#E50914] shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
          >
            <Bot size={18} />
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab("ticket")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${activeTab === "ticket"
              ? "bg-white dark:bg-zinc-800 text-[#E50914] shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
          >
            <Mail size={18} />
            Submit Ticket
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
          {activeTab === "chat" ? (
            <HelpChat onSwitchToTicket={() => setActiveTab("ticket")} />
          ) : (
            <HelpTicketForm />
          )}
        </div>
      </div>
    </div>
  );
}
