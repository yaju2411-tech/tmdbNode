import { useAdminHook } from "../../hooks/UseAdminHook";
import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { InfoIcon, Crown, Calendar, User, CreditCard, Search, X, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export const AdminMoviePurchase = () => {
  const [select, setSelected] = useState<any>(null);
  const [filters] = useState({ type: "all" });
  const [search, setSearch] = useState("");
  const { moviePurchase, page, limit, setPage } = useAdminHook({ from: "", to: "", type: "all" }, "");
  const { data, isLoading } = moviePurchase(search, filters);
  const mpurchase = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-900 shadow-2xl overflow-hidden mt-2 transition-all">
        {/* Header & Search Controls */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-zinc-900 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Membership Purchases & Sales
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Real-time purchase history and order receipts
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search user email, pass name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-600 transition-all"
            />
            {search && (
              <X
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-red-500"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              />
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 dark:border-zinc-900 bg-gray-50/50 dark:bg-zinc-900/40">
                    <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400">User Profile</TableHead>
                    <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400">Pass Name</TableHead>
                    <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400">Type</TableHead>
                    <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400">Amount</TableHead>
                    <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400">Status</TableHead>
                    <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400">Date</TableHead>
                    <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mpurchase.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-sm text-gray-500 dark:text-zinc-400">
                        No purchase records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    mpurchase.map((p: any) => {
                      const userName = p.user?.name || p.user_name || "User";
                      const userEmail = p.user?.email || p.user_email || "N/A";
                      const userAvatar = p.user?.avatar?.url || p.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
                      const passTitle = p.title || p.movie_name || (p.amount === 1499 ? "TMDB VIP Annual Pass" : p.amount === 399 ? "TMDB VIP Quarterly Pass" : "TMDB VIP Monthly Pass");
                      const statusStr = p.status === "paid" ? "success" : p.status;

                      return (
                        <TableRow key={p._id || p.id} className="border-b border-gray-100 dark:border-zinc-900 hover:bg-gray-50/60 dark:hover:bg-zinc-900/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={userAvatar}
                                alt={userName}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-zinc-800 shadow-sm"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[160px]">{userName}</span>
                                <span className="text-[11px] text-gray-500 dark:text-zinc-400 truncate max-w-[180px]">{userEmail}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                            {passTitle}
                          </TableCell>
                          <TableCell>
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              {p.contentType || p.content_type || "subscription"}
                            </span>
                          </TableCell>
                          <TableCell className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                            ₹{p.amount}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold capitalize ${
                                statusStr === "success" || statusStr === "paid"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : statusStr === "pending"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                              }`}
                            >
                              {statusStr}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 dark:text-zinc-400">
                            {new Date(p.createdAt || p.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => setSelected(p)}
                              size="sm"
                              className="bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-900 dark:text-white font-bold text-xs gap-1.5 px-3 py-1 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm"
                            >
                              <InfoIcon className="w-3.5 h-3.5" /> Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List View (Visible on Mobile) */}
            <div className="block md:hidden p-3 space-y-3">
              {mpurchase.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500 dark:text-zinc-400">
                  No purchases found matching query.
                </div>
              ) : (
                mpurchase.map((p: any) => {
                  const userName = p.user?.name || p.user_name || "User";
                  const userEmail = p.user?.email || p.user_email || "N/A";
                  const userAvatar = p.user?.avatar?.url || p.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
                  const passTitle = p.title || p.movie_name || (p.amount === 1499 ? "TMDB VIP Annual Pass" : p.amount === 399 ? "TMDB VIP Quarterly Pass" : "TMDB VIP Monthly Pass");
                  const statusStr = p.status === "paid" ? "success" : p.status;

                  return (
                    <div
                      key={p._id || p.id}
                      className="bg-gray-50/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                          <img
                            src={userAvatar}
                            alt={userName}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-zinc-800 shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                              {userName}
                            </h4>
                            <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                              {userEmail}
                            </p>
                          </div>
                        </div>
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                          ₹{p.amount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] bg-white dark:bg-zinc-950 p-2 rounded-lg border border-gray-200/80 dark:border-zinc-800">
                        <span className="font-bold text-gray-800 dark:text-zinc-200 truncate mr-2">
                          {passTitle}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] capitalize shrink-0 ${
                            statusStr === "success" || statusStr === "paid"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : statusStr === "pending"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          }`}
                        >
                          {statusStr}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-400">
                          {new Date(p.createdAt || p.created_at).toLocaleDateString()}
                        </span>
                        <Button
                          onClick={() => setSelected(p)}
                          size="sm"
                          className="bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-900 dark:text-white font-bold text-xs gap-1 px-3 py-1 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm"
                        >
                          <InfoIcon className="w-3.5 h-3.5" /> Details
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-zinc-950/50">
          <span className="text-xs text-gray-500 dark:text-zinc-400 font-semibold">
            Showing Page <strong className="text-gray-900 dark:text-white">{page}</strong> of{" "}
            <strong className="text-gray-900 dark:text-white">{totalPages}</strong> ({total} total orders)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-xs font-bold px-2 text-gray-700 dark:text-zinc-300">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MORE DETAILS DRAWER / MODAL */}
      <Drawer open={!!select} onOpenChange={() => setSelected(null)} direction="right">
        <DrawerContent className="bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-900 w-full sm:max-w-md ml-auto">
          <DrawerHeader className="border-b border-gray-200 dark:border-zinc-900">
            <DrawerTitle className="text-xl font-extrabold dark:text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>Membership Purchase Details</span>
            </DrawerTitle>
          </DrawerHeader>
          {select && (
            <div className="flex flex-col p-6 space-y-6 text-gray-900 dark:text-white overflow-y-auto">
              {/* TOP: Pass Badge Card */}
              <div className="w-full rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-red-700 p-6 text-white shadow-xl flex flex-col items-center text-center border border-red-500/30">
                <Crown className="w-10 h-10 mb-2 text-amber-200" />
                <h3 className="text-lg font-black tracking-wide uppercase">
                  {select.title || select.movie_name || (select.amount === 1499 ? "TMDB VIP Annual Pass" : select.amount === 399 ? "TMDB VIP Quarterly Pass" : "TMDB VIP Monthly Pass")}
                </h3>
                <span className="mt-2 text-2xl font-extrabold bg-black/30 px-4 py-1 rounded-full border border-white/20">
                  ₹{select.amount}
                </span>
                <span className="text-[11px] bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full mt-3 font-extrabold uppercase tracking-widest border border-emerald-400/40">
                  {(select.status === "paid" ? "SUCCESS" : select.status || "PAID").toUpperCase()}
                </span>
              </div>

              {/* USER INFORMATION */}
              <div className="bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-gray-200 dark:border-zinc-800/80 space-y-3">
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-red-500" /> User Profile
                </h4>
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={select.user?.avatar?.url || select.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base truncate">{select.user?.name || select.user_name || "User"}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className="truncate">{select.user?.email || select.user_email || "N/A"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* SUBSCRIPTION DATES */}
              <div className="bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-gray-200 dark:border-zinc-800/80 space-y-3 text-sm">
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" /> Pass Validity & Dates
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-xs text-gray-400 block">Start Date:</span>
                    <span className="font-bold text-xs text-emerald-400">
                      {select.startDate ? new Date(select.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : new Date(select.createdAt || select.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Expiry Date:</span>
                    <span className="font-bold text-xs text-amber-400">
                      {select.expiresAt ? new Date(select.expiresAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* PAYMENT & TRANSACTION DETAILS */}
              <div className="bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-gray-200 dark:border-zinc-800/80 space-y-3 text-xs">
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" /> Transaction Identifiers
                </h4>
                <div className="space-y-2 pt-1 font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-zinc-800">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="font-bold text-gray-200 truncate max-w-[200px]">{select.razorpayOrderId || select.order_id || "MANUAL_GRANT"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-zinc-800">
                    <span className="text-gray-400">Payment ID / Receipt:</span>
                    <span className="font-bold text-emerald-400 truncate max-w-[200px]">{select.razorpayPaymentId || select.payment_id || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">Content Type:</span>
                    <span className="font-bold uppercase text-amber-400">{select.contentType || select.content_type || "subscription"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};