import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import useTvDetail, { useTvDetailCast } from "../../hooks/useTvDetail";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { usePayment } from "../../hooks/usePaymentHook";
import { useCheckePurchased } from "../../hooks/useCheckPurchased";
import { toast } from "sonner";
import { ChevronLeft, IndianRupee, ReceiptIndianRupee, Crown } from "lucide-react";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotification";
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

const TvDetailTrailer = ({ onMoreDetail }: Props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: Tv, isLoading, error } = useTvDetail(id);
  const { state, startPayment } = usePayment();
  const { status, loading: purchaseLoading } = useCheckePurchased(id, "tv");
  const { data: cast } = useTvDetailCast(id);
  const rating = Tv?.vote_average || 0;
  const { user, watchlist } = useOutletContext<any>();
  const { orderId, paymentId, loading: paymentLoading, receiptNumber } = usePaymentId(String(id), "tv");
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
  const amount = useMemo(() => {
    return rating < 5 ? 600 : 800;
  }, [rating]);
  if (isLoading) return <div className="h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500"></div></div>;
  if (error || !Tv) return <div className="text-white text-center mt-10">Tv not found!</div>;
  const trailer = Tv.videos?.results.find(
    (v: any) => v.type === "Trailer" && v.site === "YouTube"
  );
  const teaser = Tv.videos?.results.find(
    (v: any) => v.type === "Teaser" && v.site === "YouTube"
  );

  const videoToPlay = trailer || teaser || Tv.videos?.results?.[0];
  const videoUrl = videoToPlay ? `https://www.youtube.com/watch?v=${videoToPlay.key}` : "";
  const bgImageUrl = Tv.poster_path ? `url(https://image.tmdb.org/t/p/original${Tv.poster_path})` : Tv.backdrop_path ? `url(https://image.tmdb.org/t/p/original${Tv.backdrop_path})` : "";
  const ftImageUrl = Tv.poster_path ? `https://image.tmdb.org/t/p/w500${Tv.poster_path}` : "";
  const canRery = status === "cancelled" || status === "gateway_failed" || status === "verification_failed"
  if (canRery) toast.error("Payment error, go to help center");
  const handlePayment = () => {
    startPayment(Number(Tv.id), Tv.name, amount, Tv.poster_path, "tv");
  }
  const handleRetry = () => {
    startPayment(Number(Tv.id), Tv.name, amount, Tv.poster_path, "tv");
  }
  return (
    <>
      {bgImageUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center -z-20 transition-all pointer-events-none opacity-50"
          style={{ backgroundImage: bgImageUrl }}
        />
      )}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl -z-10 pointer-events-none" />
      <div className="relative text-white transition-colors duration-500">
        {state.loading && (
          <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center transition-colors">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
          </div>
        )}
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10 pt-12 pb-12 transition-all">
          <Button onClick={() => navigate(-1)} className="bg-gray-200 text-black dark:bg-white/60 dark:text-black p-2 rounded-full absolute left-14 md:left-8">
            <ChevronLeft />
          </Button>
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            <div className="shadow-2xl shadow-black/30 dark:shadow-black/80 rounded-lg overflow-hidden min-w-[320px] max-w-[320px] transition-all">
              <img
                src={ftImageUrl}
                alt={Tv.name}
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex flex-col gap-6 pt-2 items-start justify-between w-full">
                <h1 className="text-4xl md:text-5xl font-bold-md tracking-tight text-black dark:text-white transition-colors flex-1 break-words">
                  {Tv.name}
                </h1>
                <div className="flex flex-wrap gap-3 xl:justify-end shrink-0 mt-2 xl:mt-0">
                  <Button
                    onClick={() => {
                      if (videoToPlay) {
                        window.open(videoUrl);
                      } else {
                        alert("No Trailer or Teaser available for this Tv!");
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg py-2 px-3 rounded-md hover:scale-105 transition-transform font-bold border-none"
                  >
                    Play Trailer
                  </Button>
                  <Button
                    onClick={onMoreDetail}
                    variant="outline"
                    className="bg-black text-white font-semibold hover:scale-105 transition-transform font-bold dark:bg-gray-200 dark:text-black"
                  >
                    More Details
                  </Button>
                  <Button className="bg-blue-500" onClick={() => setShareOpen(true)}>Share Link</Button>
                  <ShareModal open={shareOpen} onOpenChange={setShareOpen} id={Tv.id} title={Tv.name} type="tv" />
                  <VidSrcPlayerModal
                    isOpen={playerOpen}
                    onClose={() => setPlayerOpen(false)}
                    id={Tv.id}
                    title={Tv.name}
                    type="tv"
                  />
                  {state.loading || purchaseLoading ? (
                    <Button disabled className="bg-yellow-500">
                      Processing...
                    </Button>
                  ) : status === "success" ? (
                    <Button onClick={() => setPlayerOpen(true)} className="bg-green-500 hover:bg-green-600 font-bold">
                      Watch Now
                    </Button>
                  ) : status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <Button disabled className="bg-yellow-600 text-white font-semibold cursor-not-allowed">
                        Payment Processing (Pending)
                      </Button>
                      <ReportButton onClick={() => setReportOpen(true)} />
                    </div>
                  ) : status === "verification_failed" ? (
                    <div className="flex items-center gap-2">
                      <Button disabled className="bg-orange-500 text-white font-semibold cursor-not-allowed">
                        Verification Failed
                      </Button>
                      <ReportButton onClick={() => setReportOpen(true)} />
                    </div>
                  ) : status === "gateway_failed" ? (
                    <div className="flex items-center gap-2">
                      <Button onClick={handleRetry} className="bg-red-600 text-white font-semibold hover:bg-red-700">
                        Gateway Failed - Retry
                      </Button>
                      <ReportButton onClick={() => setReportOpen(true)} />
                    </div>
                  ) : status === "cancelled" ? (
                    <div className="flex items-center gap-2">
                      <Button onClick={handlePayment}
                        className="bg-gray-500 text-zinc-100 hover:bg-gray-600 hover:text-white py-2 rounded-md transition-colors font-semibold">
                        Cancelled - Buy {amount} <IndianRupee className="w-4 h-4 ml-1" />
                      </Button>
                      <ReportButton onClick={() => setReportOpen(true)} />
                    </div>
                  ) : status === "failed" ? (
                    <div className="flex items-center gap-2">
                      <Button onClick={handlePayment}
                        className="bg-red-800 text-zinc-100 hover:bg-red-900 hover:text-white py-2 rounded-md transition-colors font-semibold">
                        Failed - Buy {amount} <IndianRupee className="w-4 h-4 ml-1" />
                      </Button>
                      <ReportButton onClick={() => setReportOpen(true)} />
                    </div>
                  ) : status === "manual_access" ? (
                    <Button onClick={() => setPlayerOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                      Watch Now (Manual Access)
                    </Button>
                  ) : (
                    <Button onClick={() => setIsSubModalOpen(true)}
                      className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold py-2 px-5 rounded-xl shadow-lg transition-all flex items-center gap-1.5">
                      <Crown className="w-4 h-4" /> Subscribe to Watch
                    </Button>
                  )}
                  <SubscriptionModal
                    isOpen={isSubModalOpen}
                    onClose={() => setIsSubModalOpen(false)}
                  />
                  <ReportPendingModal
                    open={reportOpen}
                    onOpenChange={setReportOpen}
                    contentId={Tv.id}
                    contentTitle={Tv.name}
                    contentType="tv"
                    orderId={orderId || undefined}
                    paymentId={paymentId || undefined}
                    user={user}
                  />
                </div>
              </div>

              <div className="flex gap-5 text-lg text-black dark:text-zinc-300 items-center transition-colors font-medium">
                <span className="bg-green-600 text-white px-2 py-0.5 rounded-md text-sm font-bold shadow-sm">
                  {Tv.vote_average.toFixed(1)}
                </span>
                <span>{Tv.name.split("-")[0] || "Unknown"}</span>
                <span>{Tv.episode_run_time || "???"} min</span>
                <span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Watchlist
                          item={Tv} userId={user?.id}
                          type="tv" watchlist={watchlist} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add to Watchlist</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </div>
              <p className="text-lg leading-relaxed max-w-4xl text-zinc-800 dark:text-white transition-colors mt-2">
                {Tv.tagline || (Tv as any).overview}
              </p>

              <div className="mt-2">
                <h2 className="text-black font-bold text-lg dark:text-white mb-3">Catagories :</h2>
                {Tv.genres.map((g: any) => (
                  <span
                    key={g.id}
                    className="border border-zinc-600/60 mx-1 dark:text-zinc-300 p-2 rounded-md text-xs uppercase font-semibold bg-white text-black dark:bg-black/40 shadow-sm"
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              <div className="mt-2">
                <h2 className="text-black font-bold text-lg dark:text-white mb-3">Character :</h2>
                {cast?.cast
                  .filter((person: any) => person.known_for_department === "Acting")
                  .slice(0, 6)
                  .map((d: any) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center justify-center mx-1 my-1 border border-zinc-600/60 dark:text-zinc-300 p-2 rounded-md text-xs uppercase font-semibold bg-white text-black dark:bg-black/40 shadow-sm"
                    >
                      {d.name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default TvDetailTrailer;