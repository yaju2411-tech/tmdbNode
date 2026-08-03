import {Home,Tv,Film,Heart,Receipt,Settings,ChevronLeft,ChevronRight,Star,Globe, X,HelpCircle, User, SunIcon, MoonIcon, Crown} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from "../ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SettingsModal } from "./SettingsModal";
import { MdFamilyRestroom, MdOutlineNoAdultContent, MdOutlineAdminPanelSettings } from "react-icons/md";
import { useRole } from "../../hooks/useRole";

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
  const navigate = useNavigate();
  const { role } = useRole();
  const isAdmin = role === "admin" || user?.role === "admin";
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
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !collapsed &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [collapsed, setCollapsed]);

  return (
    <TooltipProvider>
      {
        openSidebar && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={() => setOpenSidebar(false)}/>
      }
      <aside
        ref={sidebarRef}
        className={`
          fixed md:relative top-0 left-0 z-50 h-screen md:h-auto
          flex flex-col border-r border-gray-200 dark:border-zinc-800
          bg-white dark:bg-zinc-950 transition-all duration-300
          overflow-y-auto scrollbar-hide
          ${collapsed ? "md:w-16" : "md:w-60"}
          w-60 ${openSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* TOP HEADER / COLLAPSE TOGGLE */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <span className={`font-extrabold text-sm text-[#E50914] ${collapsed ? "md:hidden" : ""}`}>
            Menu & Filters
          </span>
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="hidden md:flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all ml-auto cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button
            onClick={() => setOpenSidebar(false)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all ml-auto cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* MENU */}
        <div className="flex-1 p-3 space-y-2">
          {menuItems.map((item) => (
            <Tooltip key={item.title}>
              <TooltipTrigger asChild>
                <Link
                  to={item.link}
                  onClick={() => setOpenSidebar(false)}
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

          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/adminPanel"
                  onClick={() => setOpenSidebar(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[#E50914] font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-all ${collapsed ? "md:justify-center md:px-0" : ""}`}
                >
                  <MdOutlineAdminPanelSettings size={22} className="shrink-0" />
                  <span className={`text-sm ${collapsed ? "md:hidden" : ""}`}>
                    Admin Panel
                  </span>
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="hidden md:block">
                  Admin Panel
                </TooltipContent>
              )}
            </Tooltip>
          )}

          {/* FILTER SECTION */}
          <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
            <h3 className={`text-xs font-bold uppercase text-red-500 mb-2 px-2 tracking-wider ${collapsed ? "md:hidden" : ""}`}>
              Filters
            </h3>
            {/* BY RATING */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1">
                  {collapsed ? (
                    <button
                      onClick={() => setCollapsed(false)}
                      className="hidden md:flex items-center justify-center w-full py-3 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                      title="Rating Filter"
                    >
                      <Star size={22} className="shrink-0 text-amber-500" />
                    </button>
                  ) : (
                    <div className="space-y-1 px-2">
                      <p className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                        <Star size={14} className="text-amber-500" /> Rating
                      </p>
                      <select
                        value={filters.rating}
                        onChange={(e) =>
                          setFilters((prev: any) => ({
                            ...prev,
                            rating: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-3 py-2 text-xs font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      >
                        <option value={0}>All Ratings</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}+ Rating
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="hidden md:block">
                  Rating Filters
                </TooltipContent>
              )}
            </Tooltip>

            {/* BY COUNTRY */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1 mt-3">
                  {collapsed ? (
                    <button
                      onClick={() => setCollapsed(false)}
                      className="hidden md:flex items-center justify-center w-full py-3 rounded-xl text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                      title="Country Filter"
                    >
                      <Globe size={22} className="shrink-0 text-blue-500" />
                    </button>
                  ) : (
                    <div className="space-y-1 px-2">
                      <p className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                        <Globe size={14} className="text-blue-500" /> Country
                      </p>
                      <select
                        value={filters.country}
                        onChange={(e) =>
                          setFilters((prev: any) => ({
                            ...prev,
                            country: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-3 py-2 text-xs font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-600 transition-all"
                      >
                        <option value="">All Countries</option>
                        <option value="US">USA</option>
                        <option value="IN">India</option>
                        <option value="JP">Japan</option>
                        <option value="KR">Korea</option>
                        <option value="GB">UK</option>
                      </select>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="hidden md:block">
                  Country Filters
                </TooltipContent>
              )}
            </Tooltip>
          </div>
          
          {/* SETTINGS SECTION (Desktop Only) */}
          <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 hidden md:block">
            <h3 className={`text-xs font-bold uppercase text-red-500 mb-2 px-2 tracking-wider ${collapsed ? "md:hidden" : ""}`}>
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
              {isAdmin && (
                <>
                  <DropdownMenuItem className="gap-3 cursor-pointer py-2 focus:bg-gray-100 dark:focus:bg-zinc-800 text-[#E50914] font-semibold" onSelect={() => { setOpenSidebar(false); navigate("/adminPanel"); }}>
                    <MdOutlineAdminPanelSettings size={18} /> Admin Panel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-zinc-800" />
                </>
              )}
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
