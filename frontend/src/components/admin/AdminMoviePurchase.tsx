import { useAdminHook } from "../../hooks/UseAdminHook";
import React, { useState } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { Badge } from "../ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { toast } from "sonner";
import { InfoIcon, Crown, Calendar, CheckCircle2, ShieldCheck, Mail, User, CreditCard } from "lucide-react";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export const AdminMoviePurchase = () => {
  const [select, setSelected] = useState<any>(null);
  const [filters, setFilters] = useState({ type: "all" });
  const [search, setSearch] = useState("");
  const { moviePurchase, page, limit, setPage } = useAdminHook({ from: "", to: "", type: "all" }, "");
  const { data, isLoading } = moviePurchase(search, filters);
  const mpurchase = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (page >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };
  const pages = getPages();

  return (
    <>
      <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-900 shadow-xl overflow-x-hidden max-w-full">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-900 flex flex-col sm:flex-row gap-5 justify-between items-center">
          <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span>Membership Purchases & Sales</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Search by user email, name, or pass..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 text-sm outline-none focus:ring-2 focus:ring-red-600 w-64 sm:w-80"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-md" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
                  <TableHead className="py-4">User</TableHead>
                  <TableHead className="py-4">Pass Name</TableHead>
                  <TableHead className="py-4">Type</TableHead>
                  <TableHead className="py-4">Amount</TableHead>
                  <TableHead className="py-4">Status</TableHead>
                  <TableHead className="py-4">Date</TableHead>
                  <TableHead className="py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mpurchase.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No purchase records found
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
                      <TableRow key={p._id || p.id} className="border-b border-gray-200 dark:border-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-900/40 transition">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={userAvatar}
                              alt={userName}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-zinc-800"
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{userName}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {passTitle}
                        </TableCell>
                        <TableCell>
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 capitalize">
                            {p.contentType || p.content_type || "subscription"}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-emerald-500">
                          ₹{p.amount}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                              statusStr === "success" || statusStr === "paid"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : statusStr === "pending"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {statusStr}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {new Date(p.createdAt || p.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => setSelected(p)}
                            variant="ghost"
                            size="sm"
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700"
                          >
                            <InfoIcon className="w-3.5 h-3.5" /> More Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-200 dark:border-zinc-900">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            Previous
          </button>
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={i} className="px-2 text-xs">...</span>
            ) : (
              <button
                key={i}
                onClick={() => setPage(p as number)}
                className={`px-3 py-1 rounded-md text-xs font-bold ${
                  page === p ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-zinc-900 text-gray-400"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            Next
          </button>
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
                  <div>
                    <p className="font-bold text-base">{select.user?.name || select.user_name || "User"}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      {select.user?.email || select.user_email || "N/A"}
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
                    <span className="font-bold text-gray-200">{select.razorpayOrderId || select.order_id || "MANUAL_GRANT"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-zinc-800">
                    <span className="text-gray-400">Payment ID / Receipt:</span>
                    <span className="font-bold text-emerald-400">{select.razorpayPaymentId || select.payment_id || "N/A"}</span>
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