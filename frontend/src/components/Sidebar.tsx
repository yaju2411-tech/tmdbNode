import {Home,Tv,Film,Heart,Receipt,Settings,ChevronLeft,ChevronRight,Star,Globe, X,HelpCircle, User, SunIcon, MoonIcon} from "lucide-react";
import { Link } from "react-router-dom";
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from "./ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SettingsModal } from "./SettingsModal";
import { MdFamilyRestroom } from "react-icons/md";
import { MdOutlineNoAdultContent } from "react-icons/md";

interface Props {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  filters:any;
  setFilters:any;
  openSidebar:boolean;
  setOpenSidebar:any;
  user?: any;
}
const menuItems = [
  {
    title: "Home",
    icon: Home,
    link: "/",
  },
  {
    title: "Movies",
    icon: Film,
    link: "/app/discover/movie",
  },
  {
    title: "TV Shows",
    icon: Tv,
    link: "/app/discover/tv",
  },
  {
    title: "Watchlist",
    icon: Heart,
    link: "/app/watchlist",
  },
  {
    title: "VIP Vault",
    icon: Crown,
    link: "/app/myMovies",
  },
  {
    title: "Help",
    icon: HelpCircle,
    link: "/help",
  },
];

export const AppSidebar = ({
  collapsed,
  setCollapsed,
  filters,
  setFilters,openSidebar,setOpenSidebar,user
}: Props) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = React.useState(true);
  
  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
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
    <TooltipProvider>
      {
        openSidebar && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={() => setOpenSidebar(false)}/>
      }
      <aside
        className={`
          fixed md:relative top-0 left-0 z-50 h-screen md:h-auto
          flex flex-col border-r border-gray-200 dark:border-zinc-800
          bg-white dark:bg-zinc-950 transition-all duration-300
          overflow-y-auto scrollbar-hide
          ${collapsed ? "md:w-16" : "md:w-60"}
          w-60 ${openSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className={`font-bold text-lg ${collapsed ? "md:hidden" : ""}`}>Menu</h2>
          <button
            onClick={() => {
              if (window.innerWidth >= 768) {
                setCollapsed(!collapsed);
              } else {
                setOpenSidebar(false);
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition">
            {
              window.innerWidth >= 768 ? (
                collapsed ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronLeft size={18} />
                )
              ) : (
                <X size={18} />
              )
            }
          </button>
        </div>
        {/* MENU */}
        <div className="flex-1 p-3 space-y-2">
          {menuItems.map((item) => (
            <Tooltip key={item.title}>
              <TooltipTrigger asChild>
                <Link
                  to={item.link}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-all ${collapsed ? "md:justify-center md:px-0" : ""}`}>
                  <item.icon size={22} className="shrink-0" />
                  <span className={`text-sm font-medium ${collapsed ? "md:hidden" : ""}`}>
                    {item.title}
                  </span>
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="hidden md:block">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
          {/* FILTER SECTION */}
          <div className="pt-6">
            <h3 className={`text-md uppercase text-red-500 mb-2 px-2 ${collapsed ? "md:hidden" : ""}`}>
              Filters
            </h3>
            {/* BY RATING */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`space-y-2 ${collapsed ? "md:hidden" : ""}`}>
                    <p className="text-xs text-zinc-500 px-2">
                        Rating
                    </p>
                    <select
                        value={filters.rating}
                        onChange={(e) =>
                        setFilters((prev: any) => ({
                            ...prev,
                            rating: Number(e.target.value),
                        }))
                        }
                        className="w-full rounded-lg dark:bg-zinc-900 border dark:border-zinc-800 px-3 py-2 text-sm">
                        <option value={0}>All Ratings</option>
                        {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                        <option key={num} value={num}>
                            {num}+ Rating
                        </option>
                        ))}
                    </select>
                </div>              
                </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="hidden md:block text-xs text-zinc-500 px-2">
                  Top Rated
                </TooltipContent>
              )}
            </Tooltip>
            {/* BY COUNTRY */}
            <Tooltip>
              <TooltipTrigger asChild>
            <div className={`space-y-2 mt-4 ${collapsed ? "md:hidden" : ""}`}>
                <p className="text-xs text-zinc-500 px-2">
                    Country
                </p>
                <select
                    value={filters.country}
                    onChange={(e) =>
                    setFilters((prev: any) => ({
                        ...prev,
                        country: e.target.value,
                    }))
                    }
                    className="w-full rounded-lg dark:bg-zinc-900 border dark:border-zinc-800 px-3 py-2 text-sm">
                    <option value="">All Countries</option>
                    <option value="US">USA</option>
                    <option value="IN">India</option>
                    <option value="JP">Japan</option>
                    <option value="KR">Korea</option>
                    <option value="GB">UK</option>
                </select>
            </div>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="hidden md:block">
                  By Country
                </TooltipContent>
              )}
            </Tooltip>
          </div>
          
          {/* SETTINGS SECTION (Desktop Only) */}
          <div className="pt-6 hidden md:block">
            <h3 className={`text-md uppercase text-red-500 mb-2 px-2 ${collapsed ? "md:hidden" : ""}`}>
              Settings
            </h3>
            <div className="space-y-1 mt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setIsSettingsOpen(true)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-all ${collapsed ? "md:justify-center md:px-0" : ""}`}>
                    <User size={22} className="shrink-0" />
                    <span className={`text-sm font-medium ${collapsed ? "md:hidden" : ""}`}>Update Profile</span>
                  </button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right" className="hidden md:block">Update Profile</TooltipContent>}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-all ${collapsed ? "md:justify-center md:px-0" : ""}`}>
                    {isDark ? <SunIcon size={22} className="shrink-0"/> : <MoonIcon size={22} className="shrink-0"/>}
                    <span className={`text-sm font-medium ${collapsed ? "md:hidden" : ""}`}>{isDark ? "Light Mode" : "Dark Mode"}</span>
                  </button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right" className="hidden md:block">{isDark ? "Light Mode" : "Dark Mode"}</TooltipContent>}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setFilters((prev: any) => ({ ...prev, familySafe: !prev.familySafe }))} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-all ${collapsed ? "md:justify-center md:px-0" : ""}`}>
                    {filters.familySafe ? <MdOutlineNoAdultContent size={22} className="shrink-0" /> : <MdFamilyRestroom size={22} className="shrink-0" />}
                    <span className={`text-sm font-medium ${collapsed ? "md:hidden" : ""}`}>{filters.familySafe ? "Adult Content" : "Family Safe"}</span>
                  </button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right" className="hidden md:block">{filters.familySafe ? "Adult Content" : "Family Safe"}</TooltipContent>}
              </Tooltip>
            </div>
          </div>
          
        </div>
        
        <SettingsModal isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
        {/* FOOTER (Mobile Only) */}
        <div className="md:hidden p-3 border-t border-gray-200 dark:border-zinc-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full focus:outline-none rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-900 transition">
                {/* Mobile User Avatar */}
                {user && (
                  <div className="flex items-center gap-3 px-2 py-3">
                    <Avatar className="w-10 h-10 border border-gray-300 dark:border-zinc-800 shrink-0">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-gray-200 dark:bg-zinc-800 text-black dark:text-white">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start overflow-hidden w-full">
                      <span className="text-sm font-medium truncate w-full text-left">{user.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-left">{user.email}</span>
                    </div>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" sideOffset={10} className="w-64 bg-white dark:bg-zinc-950 text-black dark:text-white border-gray-200 dark:border-zinc-800 space-y-1 z-[110]">
              <DropdownMenuItem className="gap-3 cursor-pointer py-2 focus:bg-gray-100 dark:focus:bg-zinc-800" onSelect={() => setIsSettingsOpen(true)}>
                <User size={16} /> Update Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-zinc-800" />
              <DropdownMenuItem className="gap-3 cursor-pointer py-2 focus:bg-gray-100 dark:focus:bg-zinc-800" onSelect={(e) => { e.preventDefault(); toggleTheme(); }}>
                {isDark ? <SunIcon size={16}/> : <MoonIcon size={16}/> } 
                {isDark ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 cursor-pointer py-2 focus:bg-gray-100 dark:focus:bg-zinc-800" onSelect={(e) => { e.preventDefault(); setFilters((prev: any) => ({ ...prev, familySafe: !prev.familySafe })); }}>
                {filters.familySafe ? <MdOutlineNoAdultContent size={18} /> : <MdFamilyRestroom size={18} /> }
                {filters.familySafe ? "Adult Content" : "Family Safe"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  );
};
