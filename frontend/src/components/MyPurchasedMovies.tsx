import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Button } from "./ui/button";
import { Crown, Sparkles, CheckCircle2, Film, Tv, Calendar, ShieldCheck } from "lucide-react";
import SubscriptionModal from "./SubscriptionModal";

const MyMovies = () => {
  const { user } = useOutletContext<any>() || {};
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

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

            <Button
              onClick={() => setIsSubModalOpen(true)}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold px-6 py-6 rounded-2xl shadow-xl shadow-red-950/50 flex items-center gap-2 text-base shrink-0"
            >
              <Crown className="w-5 h-5" />
              {isVipActive ? "Manage VIP Pass" : "Upgrade to VIP"}
            </Button>
          </div>
        </div>

        {/* STATUS CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-lg transition-colors">
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