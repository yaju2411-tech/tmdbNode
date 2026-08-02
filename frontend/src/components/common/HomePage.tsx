// components/HomePage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../servicies/api-client";
import {
  Play,
  Star,
  ShieldCheck,
  Tv,
  Film,
  Download,
  Menu,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  X,
  PauseCircle,
  Tv2Icon,
  HelpCircleIcon,
  IndianRupeeIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import YouTube from "react-youtube";
import useSignUpHook from "../../hooks/useSignUpHook";
import { useTheme } from "../../hooks/useTheme";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { GoToTop } from "./GoToTop";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "../ui/drawer";
import { MdMovie, MdUpdate, MdOutlineAdminPanelSettings } from "react-icons/md";
import { SettingsModal } from "./SettingsModal";
import { FaFacebook, FaInstagram, FaYoutube, FaSignOutAlt } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useRole } from "../../hooks/useRole";
import useHomePageHook from "../../hooks/useHomePageHook";
import { Skeleton } from "../ui/skeleton";

const HomePage = () => {
  const navigate = useNavigate();
  const { userData, logout } = useSignUpHook();
  const { isDark, toggleTheme } = useTheme();
  const { role } = useRole();

  const {
    trending,
    showTrailer,
    setShowTrailer,
    trialkey,
    topMovies,
    topTvShows,
    isSettingsOpen,
    setIsSettingsOpen,
    mute,
    player,
    isLoadingHero,
    isLoadingMovies,
    isLoadingTv,
    movieScrollRef,
    tvScrollRef,
    onReady,
    togglemute,
    pausePlayer,
    playPlayer,
    scrollContainer,
  } = useHomePageHook();

  return (
    <>
      <SettingsModal isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
      <div className="min-h-screen w-full bg-white dark:bg-[#141414] text-black dark:text-white transition-colors duration-300 overflow-x-hidden">

        {/* SECTION 1: HEADER NAVBAR */}
        <header className="w-full sticky top-0 z-50 border-b border-gray-200 dark:border-zinc-900 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <h1 className="text-2xl sm:text-3xl font-black text-[#E50914] tracking-wider hover:text-red-500 transition-colors">
                TMDB
              </h1>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 font-semibold text-sm sm:text-base">
              <a
                className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#E50914] dark:hover:text-red-500 transition-colors"
                onClick={() => (userData ? navigate("/app/discover/movie") : toast.error("Please login to access Movies"))}
              >
                Movies
              </a>
              <a
                className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#E50914] dark:hover:text-red-500 transition-colors"
                onClick={() => (userData ? navigate("/app/discover/tv") : toast.error("Please login to access TV Shows"))}
              >
                TV Shows
              </a>
              <a
                className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#E50914] dark:hover:text-red-500 transition-colors"
                onClick={() => (userData ? navigate("/app/myMovies") : toast.error("Please login to view Receipts"))}
              >
                Receipt
              </a>
              <a
                className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-[#E50914] dark:hover:text-red-500 transition-colors"
                onClick={() => navigate("/help")}
              >
                Help
              </a>
            </nav>

            {/* Desktop & Mobile Actions */}
            <div className="flex items-center gap-3">
              {userData ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-3 rounded-full border border-gray-200 dark:border-zinc-800 p-1 hover:border-gray-400 dark:hover:border-zinc-700 transition-all cursor-pointer">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={userData?.avatar_url || ""} />
                        <AvatarFallback className="bg-[#E50914] text-white font-bold">
                          {userData?.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-64 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white p-2 shadow-xl"
                  >
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 p-2 border-b border-gray-100 dark:border-zinc-800">
                      <Avatar className="w-11 h-11 border border-gray-200 dark:border-zinc-800">
                        <AvatarImage src={userData?.avatar_url || ""} />
                        <AvatarFallback className="bg-[#E50914] text-white font-bold">
                          {userData?.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate">
                          {userData?.name || userData?.email?.split("@")[0]}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                          {userData?.email}
                        </p>
                      </div>
                    </div>

                    {/* Admin Panel Link */}
                    {role === "admin" && (
                      <DropdownMenuItem
                        onClick={() => navigate("/adminPanel")}
                        className="mt-1 rounded-xl cursor-pointer focus:bg-gray-100 dark:focus:bg-zinc-900 flex items-center gap-3 py-2 text-sm font-medium text-[#E50914]"
                      >
                        <MdOutlineAdminPanelSettings size={18} />
                        Admin Panel
                      </DropdownMenuItem>
                    )}

                    {/* Update Profile Button */}
                    <DropdownMenuItem
                      onClick={() => setIsSettingsOpen(true)}
                      className="mt-1 rounded-xl cursor-pointer focus:bg-gray-100 dark:focus:bg-zinc-900 flex items-center gap-3 py-2 text-sm font-medium"
                    >
                      <MdUpdate size={18} />
                      Update Profile
                    </DropdownMenuItem>

                    {/* Theme Toggle Button (Inside Dropdown above Logout) */}
                    <DropdownMenuItem
                      onClick={toggleTheme}
                      className="rounded-xl cursor-pointer focus:bg-gray-100 dark:focus:bg-zinc-900 flex items-center gap-3 py-2 text-sm font-medium"
                    >
                      {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
                      {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-800 my-1" />

                    {/* Logout Button */}
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="rounded-xl cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/40 text-red-600 dark:text-red-500 flex items-center gap-3 py-2 text-sm font-medium"
                    >
                      <LogOut size={18} />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  className="hidden md:flex bg-[#E50914] hover:bg-red-700 text-white font-semibold rounded-xl px-5"
                  onClick={() => navigate("/loginPage")}
                >
                  Login
                </Button>
              )}

              {/* Mobile Drawer Menu */}
              <Drawer direction="left">
                <DrawerTrigger asChild>
                  <button className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
                    <Menu size={22} />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-900 rounded-none h-full text-gray-900 dark:text-white">
                  <div className="flex flex-col h-full justify-between p-4">
                    <div>
                      {/* Drawer Header */}
                      <div className="flex justify-between items-center bg-[#E50914] p-4 rounded-2xl mb-6">
                        <h2 className="text-2xl font-extrabold text-white tracking-wider">TMDB</h2>
                        <DrawerClose asChild>
                          <button className="text-white hover:opacity-80">
                            <X size={24} />
                          </button>
                        </DrawerClose>
                      </div>

                      {/* Navigation Options */}
                      <div className="flex flex-col gap-3 w-full">
                        <DrawerClose asChild>
                          <div
                            className="w-full flex items-center rounded-xl gap-4 px-4 py-3.5 text-sm font-medium bg-gray-100 dark:bg-zinc-900 hover:bg-[#E50914] hover:text-white dark:hover:bg-[#E50914] dark:hover:text-white transition-colors cursor-pointer"
                            onClick={() => (userData ? navigate("/app/discover/movie") : toast.error("Please login to access Movies"))}
                          >
                            <MdMovie size={20} />
                            <span>Movies</span>
                          </div>
                        </DrawerClose>

                        <DrawerClose asChild>
                          <div
                            className="w-full flex items-center rounded-xl gap-4 px-4 py-3.5 text-sm font-medium bg-gray-100 dark:bg-zinc-900 hover:bg-[#E50914] hover:text-white dark:hover:bg-[#E50914] dark:hover:text-white transition-colors cursor-pointer"
                            onClick={() => (userData ? navigate("/app/discover/tv") : toast.error("Please login to access TV Shows"))}
                          >
                            <Tv2Icon size={20} />
                            <span>TV Shows</span>
                          </div>
                        </DrawerClose>

                        <DrawerClose asChild>
                          <div
                            className="w-full flex items-center rounded-xl gap-4 px-4 py-3.5 text-sm font-medium bg-gray-100 dark:bg-zinc-900 hover:bg-[#E50914] hover:text-white dark:hover:bg-[#E50914] dark:hover:text-white transition-colors cursor-pointer"
                            onClick={() => (userData ? navigate("/app/myMovies") : toast.error("Please login to view Receipts"))}
                          >
                            <IndianRupeeIcon size={20} />
                            <span>Receipt</span>
                          </div>
                        </DrawerClose>

                        <DrawerClose asChild>
                          <div
                            className="w-full flex items-center rounded-xl gap-4 px-4 py-3.5 text-sm font-medium bg-gray-100 dark:bg-zinc-900 hover:bg-[#E50914] hover:text-white dark:hover:bg-[#E50914] dark:hover:text-white transition-colors cursor-pointer"
                            onClick={() => navigate("/help")}
                          >
                            <HelpCircleIcon size={20} />
                            <span>Help</span>
                          </div>
                        </DrawerClose>
                      </div>
                    </div>

                    {/* Drawer Footer with Profile, Update Profile & Logout */}
                    <DrawerFooter className="p-0 mt-6">
                      {userData ? (
                        <div className="flex flex-col gap-3 bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-gray-300 dark:border-zinc-700">
                              <AvatarImage src={userData?.avatar_url || ""} />
                              <AvatarFallback className="bg-[#E50914] text-white font-bold">
                                {userData?.email?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <h2 className="text-sm font-bold truncate text-gray-900 dark:text-white">
                                {userData.name || userData.email?.split("@")[0]}
                              </h2>
                              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{userData.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {/* Update Profile inside Mobile Profile */}
                            <DrawerClose asChild>
                              <Button
                                variant="outline"
                                className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 border-gray-300 dark:border-zinc-700"
                                onClick={() => setIsSettingsOpen(true)}
                              >
                                <MdUpdate size={16} />
                                Profile
                              </Button>
                            </DrawerClose>

                            {/* Theme Toggle inside Mobile Profile */}
                            <Button
                              variant="outline"
                              className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 border-gray-300 dark:border-zinc-700"
                              onClick={toggleTheme}
                            >
                              {isDark ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-500" />}
                              {isDark ? "Light" : "Dark"}
                            </Button>
                          </div>

                          {/* Sign Out inside Mobile Profile */}
                          <DrawerClose asChild>
                            <Button
                              className="w-full bg-[#E50914] hover:bg-red-700 text-white font-semibold text-xs mt-1"
                              onClick={() => logout()}
                            >
                              <FaSignOutAlt className="mr-2" />
                              Sign Out
                            </Button>
                          </DrawerClose>
                        </div>
                      ) : (
                        <DrawerClose asChild>
                          <Button
                            className="w-full bg-[#E50914] hover:bg-red-700 text-white font-semibold py-3 rounded-xl"
                            onClick={() => navigate("/loginPage")}
                          >
                            Login / SignUp
                          </Button>
                        </DrawerClose>
                      )}
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </header>

        {/* SECTION 1 CONTINUED: HERO TRAILER BANNER */}
        <section className="relative w-full min-h-[85vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-black">
          {/* Background Media / Video */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {showTrailer && trialkey ? (
              <div
                className="absolute inset-0 z-20 bg-black overflow-hidden"
                onClick={() => setShowTrailer(false)}
              >
                <div
                  className="w-full h-full pointer-events-none flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <YouTube
                    videoId={trialkey}
                    onReady={onReady}
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 1,
                        rel: 0,
                        modestbranding: 1,
                        controls: 0,
                        disablekb: 1,
                        iv_load_policy: 3,
                        fs: 0,
                      },
                    }}
                    onEnd={() => setShowTrailer(false)}
                    className="w-full h-full scale-150 [&>iframe]:w-full [&>iframe]:h-full"
                  />
                </div>
              </div>
            ) : null}

            {trending?.backdrop_path && (
              <img
                src={`https://image.tmdb.org/t/p/original${trending.backdrop_path}`}
                alt={trending?.title || "Hero Banner"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>

          {/* Central Pause Indicator overlay matching Image 2 */}
          {showTrailer && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="p-3 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-md text-white border border-white/20 shadow-2xl">
                <div className="text-2xl sm:text-3xl font-black tracking-widest leading-none">||</div>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-black/70 dark:from-[#141414] dark:via-[#141414]/60 dark:to-black/80 z-10" />

          {/* Player Controls */}
          <div className="absolute bottom-8 right-4 sm:bottom-12 sm:right-8 md:bottom-16 md:right-12 z-40 flex items-center gap-2">
            {!showTrailer && trialkey && (
              <Button
                className="bg-[#E50914] hover:bg-red-700 text-white rounded-full p-3 shadow-lg"
                onClick={() => setShowTrailer(true)}
              >
                <Play size={20} />
              </Button>
            )}

            {showTrailer && (
              <>
                <Button
                  className="bg-[#E50914] hover:bg-red-700 text-white rounded-full p-3 shadow-lg"
                  onClick={togglemute}
                >
                  {mute ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>

                <Button
                  className="bg-[#E50914] hover:bg-red-700 text-white rounded-full p-3 shadow-lg"
                  onClick={() => {
                    if (!player) return;
                    player.pauseVideo();
                  }}
                  onDoubleClick={() => {
                    if (!player) return;
                    player.playVideo();
                  }}
                >
                  <PauseCircle size={20} />
                </Button>

                <Button
                  className="bg-[#E50914] hover:bg-red-700 text-white rounded-full p-3 shadow-lg"
                  onClick={() => setShowTrailer(false)}
                >
                  <X size={20} />
                </Button>
              </>
            )}
          </div>

          {/* Centered Hero Content Container */}
          <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center">
            <div className="max-w-xl sm:max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#E50914]/20 border border-[#E50914]/40 px-3.5 py-1.5 rounded-full mb-4 backdrop-blur-sm">
                <Sparkles size={14} className="text-[#E50914]" />
                <span className="text-[#E50914] font-bold tracking-wider text-xs uppercase">
                  TRENDING NOW
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 text-gray-900 dark:text-white leading-tight drop-shadow-md">
                {trending?.title || "Unlimited Movies & Shows"}
              </h1>

              <div className="flex items-center gap-3 sm:gap-4 mb-5 text-xs sm:text-sm font-semibold">
                <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md">
                  <Star size={16} className="fill-amber-500 text-amber-500" />
                  <span>{trending?.vote_average?.toFixed(1) || "8.5"}</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  {trending?.release_date?.split("-")[0] || "2026"}
                </span>
                <span className="uppercase bg-[#E50914] text-white px-2.5 py-0.5 rounded font-bold text-[10px]">
                  4K ULTRA HD
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 line-clamp-3 sm:line-clamp-4 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
                {trending?.overview || "Discover thousands of movies, exclusive original series, and top trending content with lightning-fast streaming."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  className="w-full sm:w-auto bg-[#E50914] hover:bg-red-700 text-white px-8 py-6 text-base font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105"
                  onClick={() => {
                    userData ? navigate(`app/movieDetail/${trending?.id || 1}`) : navigate("/loginPage");
                  }}
                >
                  <Play className="mr-2 fill-white" size={20} />
                  Watch Now
                </Button>

                {!userData && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white bg-white/80 dark:bg-black/60 hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black px-8 py-6 text-base font-bold rounded-xl backdrop-blur-md transition-all hover:scale-105"
                    onClick={() => navigate("/loginPage")}
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: WHY CHOOSE TMDB & HOW IT WORKS */}
        <section className="w-full py-16 sm:py-24 bg-gray-50 dark:bg-[#0c0c0e] border-t border-gray-200 dark:border-zinc-900 transition-colors">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Why Choose TMDB Header */}
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
                Why Choose <span className="text-[#E50914]">TMDB</span>?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                The premier streaming destination crafted for true cinema lovers with unmatched speed and modern design.
              </p>
            </div>

            {/* Why Choose TMDB Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-[#E50914]/50 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-5 text-[#E50914] group-hover:scale-110 transition-transform">
                  <Film size={32} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Latest Blockbusters</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Stream brand new release movies in pristine 4K resolution directly on your favorite device.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-[#E50914]/50 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-5 text-[#E50914] group-hover:scale-110 transition-transform">
                  <Tv size={32} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Popular TV Shows</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Binge top rated series, full seasons, and exclusive trending TV shows without interruption.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-[#E50914]/50 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-5 text-[#E50914] group-hover:scale-110 transition-transform">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Instant Payments</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Seamless Razorpay integration with transparent receipts and instant subscription upgrades.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-[#E50914]/50 hover:shadow-xl transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-5 text-[#E50914] group-hover:scale-110 transition-transform">
                  <Download size={32} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Personal Library</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Keep lifetime access to all your purchased titles available across all smart screens.
                </p>
              </div>
            </div>

            {/* How It Works Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
                How It Works
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
                Start streaming your favorite titles in just 3 quick steps.
              </p>
            </div>

            {/* How It Works Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 text-center border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center mx-auto mb-5 text-xl font-black shadow-lg shadow-red-600/30">
                  1
                </div>
                <h3 className="text-lg font-bold mb-2">Create Free Account</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Register with your email to unlock personalized recommendations and watchlists.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 text-center border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center mx-auto mb-5 text-xl font-black shadow-lg shadow-red-600/30">
                  2
                </div>
                <h3 className="text-lg font-bold mb-2">Choose & Purchase</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Unlock individual blockbusters or subscribe to VIP for unlimited catalog access.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 text-center border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center mx-auto mb-5 text-xl font-black shadow-lg shadow-red-600/30">
                  3
                </div>
                <h3 className="text-lg font-bold mb-2">Stream Anywhere</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Enjoy ultra HD video playback on mobile, laptop, tablet, or smart TV screens.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3: TOP 10 MOVIES */}
        <section className="relative w-full py-8 sm:py-12 bg-white dark:bg-[#141414] border-t border-gray-200 dark:border-zinc-900 overflow-hidden">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={22} className="text-[#E50914]" />
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                    Top 10 Movies
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                  Most watched cinematic blockbusters right now
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollContainer(movieScrollRef, "left")}
                  className="p-2.5 rounded-full bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-[#E50914] hover:text-white transition-all cursor-pointer"
                  aria-label="Previous Movies"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollContainer(movieScrollRef, "right")}
                  className="p-2.5 rounded-full bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-[#E50914] hover:text-white transition-all cursor-pointer"
                  aria-label="Next Movies"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Movie Carousel without Scrollbars */}
            <div
              ref={movieScrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth pb-4 px-1"
            >
              {isLoadingMovies || topMovies.length === 0
                ? Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} className="flex-none w-[170px] sm:w-[200px] md:w-[230px]">
                      <Skeleton className="w-full aspect-[2/3] rounded-2xl bg-gray-200 dark:bg-zinc-800/80 border border-gray-300 dark:border-zinc-800" />
                    </div>
                  ))
                : topMovies.map((movie, index) => (
                    <div
                      key={movie.id}
                      onClick={() => (userData ? navigate(`/app/movieDetail/${movie.id}`) : navigate("/loginPage"))}
                      className="flex-none w-[170px] sm:w-[200px] md:w-[230px] group relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-[#E50914] cursor-pointer shadow-md transition-colors duration-200"
                    >
                      {/* Poster Image Container */}
                      <div className="relative aspect-[2/3] w-full overflow-hidden">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          loading="lazy"
                        />
                        
                        {/* Top Rank Badge Number */}
                        <div className="absolute top-2 left-2 z-10 bg-[#E50914] text-white px-2.5 py-1 rounded-lg font-black text-xs sm:text-sm shadow-md">
                          #{index + 1}
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                        {/* Content Info inside Poster */}
                        <div className="absolute bottom-0 inset-x-0 p-3.5 flex flex-col justify-end text-white">
                          <h3 className="font-bold text-sm sm:text-base line-clamp-1 group-hover:text-red-500 transition-colors">
                            {movie.title}
                          </h3>

                          <div className="flex items-center justify-between mt-1.5 text-xs">
                            <div className="flex items-center gap-1 text-amber-400 font-semibold">
                              <Star size={13} className="fill-amber-400" />
                              <span>{movie.vote_average?.toFixed(1)}</span>
                            </div>
                            <span className="text-gray-300 font-medium">
                              {movie.release_date?.split("-")[0]}
                            </span>
                          </div>

                          <Button
                            size="sm"
                            className="mt-2.5 w-full bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs rounded-lg py-1.5"
                          >
                            <Play size={13} className="mr-1 fill-white" />
                            Watch Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

          </div>
        </section>

        {/* SECTION 4: TOP 10 TV SHOWS */}
        <section className="relative w-full py-8 sm:py-12 bg-gray-50 dark:bg-[#0c0c0e] border-t border-gray-200 dark:border-zinc-900 transition-colors overflow-hidden">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Tv size={22} className="text-[#E50914]" />
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                    Top 10 TV Shows
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                  Highest rated TV series and trending episodes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollContainer(tvScrollRef, "left")}
                  className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-[#E50914] hover:text-white transition-all cursor-pointer"
                  aria-label="Previous TV Shows"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollContainer(tvScrollRef, "right")}
                  className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-[#E50914] hover:text-white transition-all cursor-pointer"
                  aria-label="Next TV Shows"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll TV Show Carousel without Scrollbars */}
            <div
              ref={tvScrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth pb-4 px-1"
            >
              {isLoadingTv || topTvShows.length === 0
                ? Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} className="flex-none w-[170px] sm:w-[200px] md:w-[230px]">
                      <Skeleton className="w-full aspect-[2/3] rounded-2xl bg-gray-200 dark:bg-zinc-800/80 border border-gray-300 dark:border-zinc-800" />
                    </div>
                  ))
                : topTvShows.map((tv, index) => (
                    <div
                      key={tv.id}
                      onClick={() => (userData ? navigate(`/app/tvDetail/${tv.id}`) : navigate("/loginPage"))}
                      className="flex-none w-[170px] sm:w-[200px] md:w-[230px] group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-[#E50914] cursor-pointer shadow-md transition-colors duration-200"
                    >
                      {/* Poster Image Container */}
                      <div className="relative aspect-[2/3] w-full overflow-hidden">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${tv.poster_path}`}
                          alt={tv.name}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          loading="lazy"
                        />

                        {/* Top Rank Badge Number */}
                        <div className="absolute top-2 left-2 z-10 bg-[#E50914] text-white px-2.5 py-1 rounded-lg font-black text-xs sm:text-sm shadow-md">
                          #{index + 1}
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                        {/* Content Info inside Poster */}
                        <div className="absolute bottom-0 inset-x-0 p-3.5 flex flex-col justify-end text-white">
                          <h3 className="font-bold text-sm sm:text-base line-clamp-1 group-hover:text-red-500 transition-colors">
                            {tv.name}
                          </h3>

                          <div className="flex items-center justify-between mt-1.5 text-xs">
                            <div className="flex items-center gap-1 text-amber-400 font-semibold">
                              <Star size={13} className="fill-amber-400" />
                              <span>{tv.vote_average?.toFixed(1)}</span>
                            </div>
                            <span className="text-gray-300 font-medium">
                              {tv.first_air_date?.split("-")[0]}
                            </span>
                          </div>

                          <Button
                            size="sm"
                            className="mt-2.5 w-full bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs rounded-lg py-1.5"
                          >
                            <Play size={13} className="mr-1 fill-white" />
                            Watch Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

          </div>
        </section>

        {/* SECTION 5: PROFESSIONAL OTT PLATFORM FOOTER */}
        <footer className="w-full py-16 bg-white dark:bg-[#09090b] border-t border-gray-200 dark:border-zinc-900 text-gray-900 dark:text-white transition-colors">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10 mb-12">

              {/* Brand Description */}
              <div className="sm:col-span-2 space-y-4">
                <Link to="/" className="inline-block">
                  <h2 className="text-3xl font-extrabold text-[#E50914] tracking-wider">TMDB</h2>
                </Link>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
                  TMDB is a next-generation OTT streaming platform bringing high-definition movies, TV shows, and exclusive originals right to your screens.
                </p>
                <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400 pt-2">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-gray-100 dark:bg-zinc-900 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors" aria-label="Facebook">
                    <FaFacebook size={18} />
                  </a>
                  <a href="https://x.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-gray-100 dark:bg-zinc-900 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors" aria-label="X (Twitter)">
                    <FaXTwitter size={18} />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-gray-100 dark:bg-zinc-900 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors">
                    <FaInstagram size={18} />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-gray-100 dark:bg-zinc-900 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors">
                    <FaYoutube size={18} />
                  </a>
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Navigation</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <a onClick={() => (userData ? navigate("/app/discover/movie") : navigate("/loginPage"))} className="hover:text-[#E50914] dark:hover:text-[#E50914] cursor-pointer transition-colors">
                      Movies
                    </a>
                  </li>
                  <li>
                    <a onClick={() => (userData ? navigate("/app/discover/tv") : navigate("/loginPage"))} className="hover:text-[#E50914] dark:hover:text-[#E50914] cursor-pointer transition-colors">
                      TV Shows
                    </a>
                  </li>
                  <li>
                    <a onClick={() => (userData ? navigate("/app/myMovies") : navigate("/loginPage"))} className="hover:text-[#E50914] dark:hover:text-[#E50914] cursor-pointer transition-colors">
                      My Library & Receipts
                    </a>
                  </li>
                  <li>
                    <a onClick={() => navigate("/help")} className="hover:text-[#E50914] dark:hover:text-[#E50914] cursor-pointer transition-colors">
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>

              {/* Genres Links */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Genres</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><span className="hover:text-[#E50914] cursor-pointer transition-colors">Action & Adventure</span></li>
                  <li><span className="hover:text-[#E50914] cursor-pointer transition-colors">Comedy Blockbusters</span></li>
                  <li><span className="hover:text-[#E50914] cursor-pointer transition-colors">Drama & Thrillers</span></li>
                  <li><span className="hover:text-[#E50914] cursor-pointer transition-colors">Sci-Fi & Fantasy</span></li>
                </ul>
              </div>

              {/* Legal & Support */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Legal & Support</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li><span className="hover:text-[#E50914] cursor-pointer transition-colors">Privacy Policy</span></li>
                  <li><span className="hover:text-[#E50914] cursor-pointer transition-colors">Terms of Service</span></li>
                  <li><span className="hover:text-[#E50914] cursor-pointer transition-colors">Cookie Preferences</span></li>
                  <li><span className="hover:text-[#E50914] cursor-pointer transition-colors">Security & Refund</span></li>
                </ul>
              </div>

            </div>

            {/* Bottom Copyright */}
            <div className="border-t border-gray-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-zinc-500">
              <p>© {new Date().getFullYear()} TMDB OTT Streaming Platform. All rights reserved.</p>
              <p className="flex items-center gap-1">
                Crafted for ultimate entertainment & cinema experience.
              </p>
            </div>
          </div>
        </footer>

      </div>
      <GoToTop />
    </>
  );
};

export default HomePage;