import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Button } from "../ui/button";
import { Crown, Sparkles, Film, Tv, Calendar, ShieldCheck, FileText, ExternalLink } from "lucide-react";
import SubscriptionModal from "../payment/SubscriptionModal";
import { useFetchReceiptServer } from "../../hooks/useReceiptFetchHook";

const MyMovies = () => {
  const { user } = useOutletContext<any>() || {};
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const { receipt: myReceipts = [], loading: receiptsLoading } = useFetchReceiptServer("");

  const subscription = user?.subscription || {};
  const isVipActive =
    subscription.status === "active" &&
    subscription.expiresAt &&
    new Date(subscription.expiresAt) > new Date();

  const formattedExpiry = subscription.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const activePaymentId = subscription.razorpayPaymentId || subscription.razorpayOrderId;

  return (
    <>
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
      />

      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* HEADER BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-zinc-900 to-zinc-950 border border-red-900/30 p-8 md:p-10 shadow-2xl text-white">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" /> VIP Streaming Access
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                My VIP Membership & Vault
              </h1>
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                Enjoy full, unlimited streaming access to all HD Movies & TV Shows across TMDB without limits or individual paywalls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                onClick={() => setIsSubModalOpen(true)}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold px-6 py-6 rounded-2xl shadow-xl shadow-red-950/50 flex items-center gap-2 text-base"
              >
                <Crown className="w-5 h-5" />
                {isVipActive ? "Manage VIP Pass" : "Upgrade to VIP"}
              </Button>
            </div>
          </div>
        </div>

        {/* STATUS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-lg transition-colors flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Membership Status</span>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    isVipActive
                      ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                  }`}
                >
                  {isVipActive ? "ACTIVE VIP MEMBER" : "FREE USER"}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white pt-1">
                  {isVipActive ? `${subscription.plan?.toUpperCase()} PASS` : "No Active VIP Pass"}
                </h3>
              </div>
            </div>

            {activePaymentId && (
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-900">
                <Link to={`/receipt/${activePaymentId}`} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  <FileText className="w-3.5 h-3.5" /> View VIP Receipt PDF <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-lg transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Expiration Date</span>
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-zinc-400">Valid Until</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {formattedExpiry || "N/A"}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-lg transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Access Tier</span>
              <Sparkles className="w-5 h-5 text-red-500" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-zinc-400">Unlocked Content</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isVipActive ? "100% All Movies & Shows" : "Preview Trailer Mode"}
              </h3>
            </div>
          </div>
        </div>

        {/* PAYMENT RECEIPTS & INVOICES SECTION */}
        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm dark:shadow-lg transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" /> Official Tax Receipts & Invoices
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">View and download PDF receipts for all your TMDB purchases & subscriptions</p>
            </div>

            {activePaymentId && (
              <Link to={`/receipt/${activePaymentId}`} target="_blank">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-xs">
                  <FileText className="w-4 h-4" /> Open VIP Pass PDF Receipt
                </Button>
              </Link>
            )}
          </div>

          {receiptsLoading ? (
            <div className="py-6 text-center text-zinc-500 animate-pulse text-sm">Loading payment receipts...</div>
          ) : myReceipts.length === 0 && !activePaymentId ? (
            <div className="py-6 text-center text-zinc-500 text-sm">No payment receipts found yet.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-900">
              {myReceipts.map((item: any, idx: number) => {
                const targetId = item.receipt_number || item.payment_id || item.order_id;
                return (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{item.content_title || "TMDB VIP Pass"}</span>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                        <span>Date: {new Date(item.paid_at).toLocaleDateString()}</span>
                        <span>Payment ID: <code className="text-emerald-500">{item.payment_id || item.order_id}</code></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">₹{item.amount}</span>
                      <Link to={`/receipt/${targetId}`} target="_blank">
                        <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 text-xs font-semibold">
                          <FileText className="w-3.5 h-3.5" /> View PDF Receipt
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* QUICK NAVIGATION */}
        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 space-y-6 shadow-sm dark:shadow-lg transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" /> Start Streaming Unlimited HD Catalog
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/app/discover/movie"
              className="flex items-center justify-between p-5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 hover:bg-gray-100 dark:hover:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 hover:border-red-500/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-600/10 text-red-500 group-hover:scale-110 transition-transform">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors">Browse All HD Movies</h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Explore trending blockbusters & action</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-red-500">Stream Now →</span>
            </Link>

            <Link
              to="/app/discover/tv"
              className="flex items-center justify-between p-5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 hover:bg-gray-100 dark:hover:bg-zinc-900 border border-gray-200 dark:border-zinc-800/80 hover:border-blue-500/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-600/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <Tv className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">Browse All TV Series</h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Binge full seasons & episodes</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-500">Stream Now →</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyMovies;