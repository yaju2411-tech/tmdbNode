import { useEffect, useRef, useState } from "react";
import apiClient from "../servicies/api-client";

export function useHomePageHook() {
  const [trending, setTrending] = useState<any>(null);
  const [showTrailer, setShowTrailer] = useState(true);
  const [trialkey, setTrialkey] = useState("");
  const [topMovies, setTopMovies] = useState<any[]>([]);
  const [topTvShows, setTopTvShows] = useState<any[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mute, setMute] = useState(true);
  const [player, setPlayer] = useState<any>(null);

  const [isLoadingHero, setIsLoadingHero] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingTv, setIsLoadingTv] = useState(true);

  const movieScrollRef = useRef<HTMLDivElement | null>(null);
  const tvScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      setIsLoadingHero(true);
      try {
        const res = await apiClient.get("/discover/movie?with_origin_country=IN&sort_by=popularity.desc");
        if (res.data?.results) {
          for (const movie of res.data.results) {
            try {
              const videoRes = await apiClient.get(`/movie/${movie.id}/videos`);
              const trailer = videoRes.data.results?.find((v: any) => v.site === "YouTube");
              if (trailer) {
                setTrending(movie);
                setTrialkey(trailer.key);
                break;
              }
            } catch (err) {
              console.error("Error fetching video trailer:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
      } finally {
        setIsLoadingHero(false);
      }
    };

    const fetchMovies = async () => {
      setIsLoadingMovies(true);
      try {
        const moviesRes = await apiClient.get("/discover/movie?sort_by=popularity.desc");
        if (moviesRes.data?.results) {
          setTopMovies(moviesRes.data.results.slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching top movies:", error);
      } finally {
        setIsLoadingMovies(false);
      }
    };

    const fetchTv = async () => {
      setIsLoadingTv(true);
      try {
        const tvRes = await apiClient.get("/discover/tv?sort_by=popularity.desc");
        if (tvRes.data?.results) {
          setTopTvShows(tvRes.data.results.slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching top TV shows:", error);
      } finally {
        setIsLoadingTv(false);
      }
    };

    // Execute concurrently in parallel
    fetchHero();
    fetchMovies();
    fetchTv();
  }, []);

  const onReady = (e: any) => {
    setPlayer(e.target);
    e.target.mute();
    e.target.playVideo();
  };

  const togglemute = () => {
    if (!player) return;
    if (mute) {
      player.unMute();
    } else {
      player.mute();
    }
    setMute(!mute);
  };

  const pausePlayer = () => {
    if (player) {
      player.pauseVideo();
    }
  };

  const playPlayer = () => {
    if (player) {
      player.playVideo();
    }
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = 500;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return {
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
  };
}

export default useHomePageHook;
