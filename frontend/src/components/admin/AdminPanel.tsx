import React, { useState, useEffect } from "react";
import { UserAdminTable } from "./UserAdminTable";
import { AdminTable } from "./AdminTable";
import { AdminDiscloser } from "./AdminDiscloaser";
import { BadgeCheckIcon, Bell, BellIcon, CreditCardIcon, LogOutIcon, Moon, Sun, X, Menu, Settings } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AdminMoviePurchase } from "./AdminMoviePurchase";
import { AdminAnalytics } from "./AdminAnalystic";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useAdminHook } from "../../hooks/UseAdminHook";
import { useAdminNotifications } from "../../hooks/useRealtimeNotification";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "../ui/sheet";
import { FaChartPie, FaUser } from "react-icons/fa";
import { MdMovie, MdSupportAgent } from "react-icons/md";
import { AdminUpdateProfileDialog } from "./AdminUpdateProfileDialog";
import { AdminTickets } from "./AdminTickets";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../servicies/api-client";
import { useTheme } from "../../hooks/useTheme";

export const AdminPanel = () => {
  const { admin, adminSignOut } = useAdminHook();
  const location = useLocation();
  const [tab, setTab] = useState<"admin" | "users" | "mpurchases" | "analytics" | "helpNotify">(location.state?.tab || "analytics");
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Handle location state updates if the user clicks the bell while already on the AdminPanel page
  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location.state]);

  //notification
  useAdminNotifications((payload: any) => {
    console.log(" ADMIN TOAST TRIGGER:", payload);
    toast.success(payload.new.title, {
      description: payload.new.message,
      style: {
        background: "#09052d",
        color: "white",
      },
    });
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["adminTickets"],
    queryFn: async () => {
      const res = await api.get("/admin/tickets");
      return res.data?.tickets || [];
    },
    staleTime: 0,
  });
  const openTicketsCount = tickets.filter((t: any) => t.status === "open").length;

  const adminProfile = admin?.[0] || {};

  return (
    <>
      <div className="min-h-screen overflow-x-hidden w-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white font-sans flex flex-col transition-colors duration-300">
        {/* Navbar */}
        <div className="flex overflow-x-hidden max-w-full fixed top-0 justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur z-30 transition-colors duration-300 w-full">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-zinc-200 dark:hover:bg-zinc-800">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px] flex flex-col bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 p-0">
                <SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                  <SheetTitle className="text-left text-xl font-bold text-[#E50914]">TMDB Admin</SheetTitle>
                </SheetHeader>

                {/* Mobile Tabs */}
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="flex flex-col space-y-2 px-4 dark:text-white">
                    <Button variant={tab === "analytics" ? "default" : "ghost"} className="justify-start gap-3 w-full" onClick={() => setTab("analytics")}>
                      <FaChartPie size={18} /> Analytics
                    </Button>
                    <Button variant={tab === "users" ? "default" : "ghost"} className="justify-start gap-3 w-full" onClick={() => setTab("users")}>
                      <FaUser size={18} /> Users
                    </Button>
                    <Button variant={tab === "mpurchases" ? "default" : "ghost"} className="justify-start gap-3 w-full" onClick={() => setTab("mpurchases")}>
                      <MdMovie size={20} /> Purchases
                    </Button>
                    <Button variant={tab === "helpNotify" ? "default" : "ghost"} className="justify-start gap-3 w-full" onClick={() => setTab("helpNotify")}>
                      <MdSupportAgent size={20} /> Tickets
                    </Button>
                  </div>
                </div>

                {/* Mobile Sidebar Footer */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/50 dark:text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={adminProfile.avatar_url || "https://github.com/shadcn.png"} />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold truncate">{adminProfile.name || "Admin User"}</span>
                      <span className="text-xs text-zinc-500 truncate">{adminProfile.email || "admin@tmdb.com"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full justify-between border-zinc-300 dark:border-zinc-700" onClick={toggleTheme}>
                      <span className="flex items-center gap-2"><Settings size={16} /> Theme</span>
                      {isDark ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-blue-500" />}
                    </Button>
                    <AdminUpdateProfileDialog adminData={adminProfile} />
                    <Button variant="destructive" className="w-full justify-start gap-2 mt-2" onClick={() => adminSignOut()}>
                      <LogOutIcon size={16} /> Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Notify Bell (aside of open sidebar button) */}
            <button
              onClick={() => setTab("helpNotify")}
              className="md:hidden relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              title={`${openTicketsCount} open tickets`}
            >
              <Bell size={22} />
              {openTicketsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-zinc-950"></span>
                </span>
              )}
            </button>

            <Link to="/" className="text-xl font-bold text-[#E50914] tracking-wider hover:text-red-500 transition-colors">
              TMDB Admin
            </Link>
          </div>

          {/* Desktop User Dropdown & Notify Bell */}
          <div className="hidden md:flex items-center gap-4 me-3">
            {adminProfile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="destructive" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src={adminProfile.avatar_url || "https://github.com/shadcn.png"} alt="Admin Avatar" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-100 dark:bg-zinc-900 text-black dark:text-white min-w-[150px] py-3 px-2">
                  <DropdownMenuGroup>
                    <AdminUpdateProfileDialog adminData={adminProfile}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                        <BadgeCheckIcon />
                        {adminProfile.name || "Admin"} (Update Profile)
                      </DropdownMenuItem>
                    </AdminUpdateProfileDialog>
                    <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                      {isDark ? <Sun size={15} /> : <Moon size={15} />} Colormode
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-red-900 h-px" />
                  <DropdownMenuItem onClick={() => { adminSignOut(); }} className="text-red-500 text-sm cursor-pointer">
                    <LogOutIcon />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Notification Bell (at right side of avatar on desktop) */}
            <button
              onClick={() => setTab("helpNotify")}
              className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              title={`${openTicketsCount} open tickets`}
            >
              <Bell size={22} />
              {openTicketsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-zinc-950"></span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar (hidden on mobile) */}
          <AdminDiscloser setTab={setTab} />

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto w-full max-w-7xl py-4 px-4 sm:px-6 md:ml-[60px] mt-16 transition-all">
            {/* {tab === "admin" && <AdminTable />} */}
            {tab === "users" && <UserAdminTable />}
            {tab === "mpurchases" && <AdminMoviePurchase />}
            {tab === "analytics" && <AdminAnalytics setTab={setTab} />}

            {tab === "helpNotify" && <AdminTickets />}
          </div>
        </div>
      </div>
    </>
  );
};