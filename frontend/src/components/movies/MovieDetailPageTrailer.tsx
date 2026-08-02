import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import useMovieDetail, { useMovieDetailCast } from "../../hooks/useMovieDetail";
import { useMemo, useState } from "react";
import { usePayment } from "../../hooks/usePaymentHook";
import { Button } from "../ui/button";
import { useCheckePurchased } from "../../hooks/useCheckPurchased";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotification";
import { ChevronLeft, IndianRupee, Crown, Play, Info, Share2, Star } from "lucide-react";
import { toast } from "sonner";
import { Watchlist } from "../common/WatchlistButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { usePaymentId } from "../../hooks/usePaymentId";
import { ShareModal } from "../common/ShareModal";
import { ReportPendingModal } from "../payment/ReportPendingModal";
import { ReportButton } from "../support/ReportButton";
import { VidSrcPlayerModal } from "../common/VidSrcPlayerModal";
import SubscriptionModal from "../payment/SubscriptionModal";

interface Props {
  onMoreDetail: () => void;
}

export const MovieTrailer = ({ onMoreDetail }: Props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: movie, isLoading, error } = useMovieDetail(id);
  const { data: cast } = useMovieDetailCast(id);
  const { state, startPayment } = usePayment();
  const { status, loading: purchaseLoading } = useCheckePurchased(id, "movie");
  const { user, watchlist } = useOutletContext<any>();
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const userId = user?.id;

  useRealtimeNotifications(userId, (payload: any) => {
    toast.success(payload.new.title, {
      description: payload.new.message,
      style: {
        background: "#052e16",
        color: "#bbf7d0",
        border: "1px solid #16a34a",
      },
    });
  });

  const { orderId, paymentId } = usePaymentId(String(id), "movie");
  const rating = movie?.vote_average || 0;
  const amount = useMemo(() => {
    return rating < 3 ? 200 : 500;
  }, [rating]);

  if (isLoading)
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#E50914]"></div>
      </div>
    );
  if (error || !movie)
    return <div className="text-gray-900 dark:text-white text-center mt-10 font-bold">Movie not found!</div>;

  const trailer = (movie as any).videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
  const teaser = (movie as any).videos?.results?.find((v: any) => v.type === "Teaser" && v.site === "YouTube");
  const videoToPlay = trailer || teaser || (movie as any).videos?.results?.[0];
  const videoUrl = videoToPlay ? `https://www.youtube.com/watch?v=${videoToPlay.key}` : "";

  const bgImageUrl = movie.poster_path
    ? `url(https://image.tmdb.org/t/p/original${movie.poster_path})`
    : movie.backdrop_path
    ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
    : "";
  const ftImageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
    : "https://placehold.co/300x450?text=No+Poster";

  const handlePayment = () => {
    startPayment(Number(movie.id), movie.title, amount, movie.poster_path, "movie");
  };
  const handleRetry = () => {
    startPayment(Number(movie.id), movie.title, amount, movie.poster_path, "movie");
  };

  return (
    <>
      {bgImageUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center -z-20 transition-all pointer-events-none opacity-20 dark:opacity-40"
          style={{ backgroundImage: bgImageUrl }}
        />
      )}
      <div className="fixed inset-0 bg-white/80 dark:bg-[#141414]/90 backdrop-blur-2xl -z-10 pointer-events-none" />
      
      <div className="relative text-gray-900 dark:text-white transition-colors duration-300">
        {state.loading && (
          <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-[#E50914]"></div>
          </div>
        )}

        <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-7xl relative z-10 pt-4 sm:pt-8 pb-8">
          {/* Top Back Navigation Button */}
          <Button
            onClick={() => navigate(-1)}
            className="mb-4 sm:mb-6 bg-gray-200 text-gray-900 dark:bg-zinc-800 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-700 p-2.5 rounded-full transition-all cursor-pointer shadow-md"
            aria-label="Go Back"
          >
            <ChevronLeft size={20} />
          </Button>

          <div className="flex flex-col md:flex-row gap-6 sm:gap-10 items-center md:items-start">
            {/* Poster Card Image */}
            <div className="w-48 sm:w-64 md:w-[280px] lg:w-[320px] aspect-[2/3] shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800 bg-zinc-900">
              <img src={ftImageUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* Movie Details Info Column */}
            <div className="flex flex-col items-start gap-4 w-full">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-tight break-words">
                {movie.title}
              </h1>

              {/* Action Buttons Grid / Row */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-3 w-full sm:w-auto my-1">
                <Button
                  onClick={() => {
                    if (videoToPlay) {
                      window.open(videoUrl);
                    } else {
                      toast.error("No Trailer or Teaser available for this movie!");
                    }
                  }}
                  className="bg-[#E50914] hover:bg-red-700 text-white font-bold h-10 sm:h-11 px-3 sm:px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play size={16} className="fill-white" />
                  <span>Play Trailer</span>
                </Button>

                <Button
                  onClick={onMoreDetail}
                  variant="outline"
                  className="bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white border-gray-300 dark:border-zinc-800 font-semibold h-10 sm:h-11 px-3 sm:px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Info size={16} />
                  <span>More Details</span>
                </Button>

                <Button
                  onClick={() => setShareOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 sm:h-11 px-3 sm:px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </Button>

                {/* Purchase / Watch Buttons */}
                {state.loading || purchaseLoading ? (
                  <Button disabled className="bg-yellow-500 text-white font-bold h-10 sm:h-11 px-4 rounded-xl">
                    Processing...
                  </Button>
                ) : status === "success" || status === "manual_access" ? (
                  <Button
                    onClick={() => setPlayerOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 sm:h-11 px-4 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play size={16} className="fill-white" />
                    <span>Watch Now</span>
                  </Button>
                ) : status === "pending" ? (
                  <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                    <Button disabled className="bg-amber-600 text-white font-semibold cursor-not-allowed h-10 sm:h-11 rounded-xl">
                      Pending
                    </Button>
                    <ReportButton onClick={() => setReportOpen(true)} />
                  </div>
                ) : status === "cancelled" || status === "failed" || status === "gateway_failed" ? (
                  <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                    <Button
                      onClick={handleRetry}
                      className="bg-red-600 text-white hover:bg-red-700 font-semibold h-10 sm:h-11 rounded-xl flex items-center gap-1"
                    >
                      <span>Buy ₹{amount}</span>
                      <IndianRupee size={14} />
                    </Button>
                    <ReportButton onClick={() => setReportOpen(true)} />
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsSubModalOpen(true)}
                    className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold h-10 sm:h-11 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <Crown size={16} />
                    <span>Subscribe</span>
                  </Button>
                )}
              </div>

              {/* Modals */}
              <ShareModal open={shareOpen} onOpenChange={setShareOpen} id={movie.id} title={movie.title} type="movie" />
              <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
              <VidSrcPlayerModal isOpen={playerOpen} onClose={() => setPlayerOpen(false)} id={movie.id} title={movie.title} type="movie" />
              <ReportPendingModal
                open={reportOpen}
                onOpenChange={setReportOpen}
                contentId={movie.id}
                contentTitle={movie.title}
                contentType="movie"
                orderId={orderId || undefined}
                paymentId={paymentId || undefined}
                user={user}
              />

              {/* Metadata Badges Row */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-200 my-1">
                <div className="flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-md font-bold shadow-sm">
                  <Star size={13} className="fill-white" />
                  <span>{rating.toFixed(1)}</span>
                </div>
                <span>{movie.release_date?.split("-")[0] || "2026"}</span>
                <span>{movie.runtime ? `${movie.runtime} min` : "N/A"}</span>
                <span className="p-1 rounded-full bg-gray-200 dark:bg-zinc-800">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Watchlist item={movie} userId={user?.id} type="movie" watchlist={watchlist} />
                      </TooltipTrigger>
                      <TooltipContent>Add to Watchlist</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </div>

              {/* Synopsis / Overview */}
              <p className="text-sm sm:text-base leading-relaxed max-w-4xl text-gray-700 dark:text-zinc-300 my-1">
                {movie.overview || "No detailed synopsis available for this movie."}
              </p>

              {/* Categories */}
              {movie.genres?.length > 0 && (
                <div className="w-full mt-1">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2">
                    Categories:
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((g: any) => (
                      <span
                        key={g.id}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 shadow-sm"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast & Characters */}
              {cast?.cast && cast.cast.length > 0 && (
                <div className="w-full mt-1">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2">
                    Cast & Characters:
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {cast.cast.slice(0, 6).map((c: any) => (
                      <span
                        key={c.cast_id || c.credit_id}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 shadow-sm"
                      >
                        {c.character ? `${c.character} (${c.name})` : c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieTrailer;
