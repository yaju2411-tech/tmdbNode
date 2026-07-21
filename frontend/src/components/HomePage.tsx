// components/HomePage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../servicies/api-client";
import { Play, Star, ShieldCheck, Tv, Film, Download, Menu, Moon, Sun, Volume2, VolumeX, X, PauseCircle, MoveIcon, Tv2Icon, HelpCircleIcon, IndianRupeeIcon } from "lucide-react";
import YouTube from "react-youtube";
import useSignUpHook from "../hooks/useSignUpHook";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage, } from "./ui/avatar";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { GoToTop } from "./GoToTop";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from "./ui/drawer";
import { MdMovie } from "react-icons/md";

const HomePage = () => {
  const [trending, setTrending] = useState<any>(null);
  const [showTrailer, setShowTrailer] = useState(true);
  const [trialkey, setTrialkey] = useState("");
  const navigate = useNavigate();
  const { userData, logout } = useSignUpHook();
  const [isDark, setIsDark] = useState(true);
  const [mute, setMute] = useState(true);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      const res = await apiClient.get("/discover/movie?with_origin_country=IN&sort_by=popularity.desc");
      for (const movie of res.data.results) {
        const videoRes = await apiClient.get(
          `/movie/${movie.id}/videos`
        );
        const trailer = videoRes.data.results.find(
          (v: any) => v.site === "YouTube"
        );
        if (trailer) {
          setTrending(movie);
          setTrialkey(trailer.key);
          break;
        }
      }
    };
    fetchTrending();
  }, []);
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
  const onReady = (e: any) => {
    setPlayer(e.target);
    e.target.mute();
    e.target.playVideo();
  }
  const togglemute = () => {
    if (!player) return;
    if (mute) {
      player.unMute();
    }
    else {
      player.mute();
    }
    setMute(!mute);
  }

  return (
    <><div className="min-h-screen bg-white dark:bg-[#141414] text-black dark:text-white overflow-y-auto">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E50914] tracking-wider hover:text-red-500 transition-colors">TMDB</h1>
          </Link>
          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6 font-medium">
            <a className="cursor-pointer" onClick={() => { userData ? navigate("/app/discover/movie") : toast.error("Login First"); }}>Movies</a>
            <a className="cursor-pointer" onClick={() => { userData ? navigate("/app/discover/tv") : toast.error("Login First"); }}>Tv</a>
            <a className="cursor-pointer" onClick={() => { userData ? navigate("/app/myMovies") : toast.error("Login First"); }}>Receipt</a>
            <a className="cursor-pointer" onClick={() => { navigate("/help"); }}>Help</a>
          </nav>
          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-black bg-gray-100 dark:text-white bg-gray-100 dark:bg-zinc-900 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex items-center gap-3 rounded-full bg-zinc-900 transition-all">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={userData?.avatar_url || ""} />
                      <AvatarFallback
                        className="bg-red-600 text-white font-bold">
                        {userData?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 rounded-2xl border border-zinc-800 bg-zinc-950 text-white p-2">
                  {/* USER INFO */}
                  <div
                    className="flex items-center gap-3 p-1 border-b border-zinc-800">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={userData?.user_metadata?.avatar_url || userData?.avatar_url} />
                      <AvatarFallback
                        className="bg-red-600 text-white font-bold">
                        {userData?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-base">
                        {userData?.email
                          ?.split("@")[0]}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {userData?.email}
                      </p>
                    </div>
                  </div>
                  {/* LOGOUT */}
                  <DropdownMenuItem
                    onClick={logout}
                    className="mt-2 rounded-xl cursor-pointer focus:bg-red-600 focus:text-white flex items-center gap-3 py-1">
                    <LogOut size={18} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="hidden md:flex"
                onClick={() => navigate("/loginPage")}
              >
                Login
              </Button>
            )}
            {/* Mobile Menu */}
            <Drawer direction="left">
              <DrawerTrigger asChild>
                <button className="md:hidden"><Menu /></button>
              </DrawerTrigger>
              <DrawerContent className="bg-black border-none rounded-none">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-red-600 p-3 rounded-xl rounded-b-none rounded-l-none">
                    <h2 className="text-3xl font-extrabold text-white tracking-wider transition-colors">TMDB</h2>
                    <DrawerClose asChild>
                      <X className="text-xl text-white" />
                    </DrawerClose>
                  </div>
                </div>
                <DrawerClose className="flex flex-col px-2 gap-4 mt-4">
                  <div className="flex items-center rounded-xl justify-start text-white gap-4 px-3 py-4 text-sm bg-zinc-900 hover:bg-zinc-500 hover:text-black" onClick={() => { userData ? navigate("/app/discover/movie") : toast.error("Login First"); }}>
                    <MdMovie size={20} /><p>Movie</p>
                  </div>
                  <div className="flex items-center rounded-xl justify-start text-white gap-4 px-3 py-4 text-sm bg-zinc-900 hover:bg-zinc-500 hover:text-black" onClick={() => { userData ? navigate("/app/discover/tv") : toast.error("Login First"); }}>
                    <Tv2Icon size={20} /><p>Tv Show</p>
                  </div>
                  <div className="flex items-center rounded-xl justify-start text-white gap-4 px-3 py-4 text-sm bg-zinc-900 hover:bg-zinc-500 hover:text-black" onClick={() => { userData ? navigate("/app/discover/myMovies") : toast.error("Login First"); }}>
                    <IndianRupeeIcon size={20} /><p>Receipt</p>
                  </div>
                  <div className="flex items-center rounded-xl justify-start text-white gap-4 px-3 py-4 text-sm bg-zinc-900 hover:bg-zinc-500 hover:text-black" onClick={() => navigate("/help")}>
                    <HelpCircleIcon size={20} /><p>Help</p>
                  </div>
                </DrawerClose>
                <DrawerFooter>
                  {userData ? <><div className="flex bg-zinc-900 px-3 py-2 justify-between items-center rounded-lg">
                    <div>
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={userData?.avatar_url || ""} />
                        <AvatarFallback
                          className="bg-red-600 text-white font-bold">
                          {userData?.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-lg text-white">{userData.name}</h2>
                      <p className="text-zinc-400 text-right">{userData.email}</p>
                    </div>
                  </div>
                    <Button variant={"default"} className="bg-red-600 text-white font-semibold" onClick={logout}>
                      SignOut
                    </Button></> :
                    <Button className="bg-red-600 text-white font-semibold" onClick={() => { navigate("loginPage"); }}>
                      Login / SignUp
                    </Button>}
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </header>
      {/* HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* BACKGROUND */}
        <div className="absolute inset-0">
          {showTrailer && (
            <div
              className="absolute inset-0 z-20 bg-black overflow-hidden"
              onClick={() => setShowTrailer(false)}
            >
              <div
                className="w-full h-full pointer-events-none flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <YouTube
                  videoId={trialkey} onReady={onReady}
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
                  className="w-full h-full scale-150 [&>iframe]:w-full [&>iframe]:h-full" />
              </div>
            </div>
          )}
          <img
            src={`https://image.tmdb.org/t/p/original${trending?.backdrop_path}`}
            className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute bottom-12 right-4 sm:bottom-16 sm:right-8 md:bottom-20 md:right-12 z-40 flex items-center gap-2">
          {!showTrailer && <Button className="bg-red-600 text-white"
            onClick={() => { setShowTrailer(true); }}
          >
            <Play className="" />
          </Button>}
          {showTrailer && <><Button className="bg-red-600 text-white"
            onClick={togglemute}
          >
            {mute ? <VolumeX /> : <Volume2 />}
          </Button><Button className="bg-red-600 text-white"
            onClick={() => {
              if (!player) return;
              player.pauseVideo();
            }}
            onDoubleClick={() => { player.playVideo(); }}
          >
              <PauseCircle />
            </Button><Button className="bg-red-600 text-white"
              onClick={() => { setShowTrailer(false); }}
            >
              <X className="" />
            </Button></>}
        </div>
        {/* CONTENT */}
        <div className="relative z-20 h-full flex items-center px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="max-w-xs sm:max-w-md md:max-w-2xl mt-16 md:mt-0">
            <p className="text-red-500 font-bold mb-2 md:mb-3 tracking-widest text-xs sm:text-sm">
              TRENDING NOW
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 text-white/80 leading-tight">
              {trending?.title}
            </h1>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 md:mb-5 text-xs sm:text-sm md:text-base">
              <div className="flex items-center gap-2 text-yellow-400">
                <Star size={18} fill="yellow" />
                <span>{trending?.vote_average?.toFixed(1)}</span>
              </div>
              <span className="text-white/80">
                {trending?.release_date?.split("-")[0]}
              </span>
              <span className="uppercase bg-red-600 px-3 py-1 rounded-full text-xs">
                HD
              </span>
            </div>
            <p className="text-gray-300 line-clamp-3 sm:line-clamp-4 text-sm sm:text-base md:text-lg leading-relaxed mb-6 md:mb-8">
              {trending?.overview}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
                onClick={() => { userData ? navigate(`app/movieDetail/${trending.id}`) : navigate("/loginPage"); }}
              >
                <Play className="mr-2" />
                Watch Now
              </Button>
              {!userData && <Button
                variant="outline"
                className="w-full sm:w-auto border-white text-white dark:text-white dark:bg-black/60 hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-black px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
                onClick={() => navigate("/loginPage")}
              >
                Create Account
              </Button>}
            </div>
          </div>
        </div>
      </section>
      {/* FEATURES */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-5">
            Why Choose TMDB?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Premium movie streaming platform with modern UI, fast streaming and secure payments.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="bg-gray-100 dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800 hover:scale-105 transition">
            <Film className="text-red-500 mb-5" size={45} />
            <h3 className="text-2xl font-bold mb-3">
              Latest Movies
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Watch trending and latest blockbuster movies instantly.
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800 hover:scale-105 transition">
            <Tv className="text-red-500 mb-5" size={45} />
            <h3 className="text-2xl font-bold mb-3">
              TV Shows
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Explore thousands of popular TV shows and episodes.
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800 hover:scale-105 transition">
            <ShieldCheck className="text-red-500 mb-5" size={45} />
            <h3 className="text-2xl font-bold mb-3">
              Secure Payments
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Razorpay integration with refund and payment support system.
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800 hover:scale-105 transition">
            <Download className="text-red-500 mb-5" size={45} />
            <h3 className="text-2xl font-bold mb-3">
              Purchased Library
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Access all your purchased movies anytime from your account.
            </p>
          </div>
        </div>
      </section>
      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 md:px-16 lg:px-24 bg-gray-100 dark:bg-zinc-950">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-5">
            How It Works
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Simple and smooth streaming experience.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 text-center border border-gray-200 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              1
            </div>
            <h3 className="text-2xl font-bold mb-3">
              Create Account
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Sign up and create your personal movie account.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 text-center border border-gray-200 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              2
            </div>
            <h3 className="text-2xl font-bold mb-3">
              Purchase Movie
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Securely purchase your favourite movie or TV show.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 text-center border border-gray-200 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              3
            </div>
            <h3 className="text-2xl font-bold mb-3">
              Start Watching
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Enjoy unlimited access from your purchased library.
            </p>
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 md:px-16 lg:px-24 text-center">
        <h2 id="help" className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6">
          Ready To Stream?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 text-sm sm:text-base">
          Join TMDB and enjoy a premium streaming experience today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
          <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
            onClick={() => { userData ? navigate("/app") : navigate("/loginPage"); }}>
            Get Started
          </Button>
          {!userData && <Link to="/loginPage" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg border-zinc-300 dark:border-zinc-800"
            >
              Login
            </Button>
          </Link>}
        </div>
      </section>
    </div>
      <GoToTop />
    </>);
};

export default HomePage;