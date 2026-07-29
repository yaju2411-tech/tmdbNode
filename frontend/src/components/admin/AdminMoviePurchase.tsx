import { useAdminHook } from "../../hooks/UseAdminHook";
import React, { useState } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { Badge } from "../ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { toast } from "sonner";
import { CircleEllipsisIcon, InfoIcon, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export const AdminMoviePurchase = () => {
  const [select, setSelected] = useState<any>(null);
  const [filters, setFilters] = useState({ type: "all" });
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { moviePurchase, page, limit, setPage, } = useAdminHook({ from: "", to: "", type: "all" }, "");
  const { data, isLoading, isFetching, } = moviePurchase(search, filters);
  const mpurchase = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, i) => i + 1
      );
    }
    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (page >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages,];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages,];
  };
  const pages = getPages();

  if (!mpurchase) toast.info("No records are here", { position: "top-center" });
  return (<>
    <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-900 shadow-xl overflow-x-hidden max-w-full">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-900 flex flex-col sm:flex-row gap-5 justify-between">
        <h2 className="text-lg font-semibold">
          Sales
        </h2>
        <div className="flex flex-col sm:flex-row gap-5">
          <select className="px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white text-sm outline-none"
            onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          >
            <option value="all">All</option>
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
          <input
            type="text"
            placeholder="Search movie..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 text-sm outline-none focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-md"
            />
          ))}
        </div>
      )
        : (<div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Content-Name</TableHead>
                <TableHead>Content-Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mpurchase.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          p.avatar_url ||
                          "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                        }
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold">{p.user_name}</span>
                        <span className="text-sm text-gray-500">{p.user_email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.movie_name}
                  </TableCell>
                  <TableCell>
                    {p.content_type === "tv" ? <p>Tv</p> : <p>Movie</p>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center"><FaRupeeSign className="mt-1" /> {p.amount}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`px-2 py-1 rounded-md font-bold uppercase dark:bg-gray-700 ${p.status === "success" ? "text-green-700 dark:text-green-500" :
                        p.status === "pending" ? "text-yellow-700 dark:text-yellow-500" :
                          p.status === "failed" ? "text-red-700 dark:text-red-500" :
                            p.status === "cancelled" ? "text-gray-700 dark:text-gray-500" :
                              p.status === "verification_failed" ? "text-red-700 dark:text-red-500" :
                                p.status === "expired" ? "text-orange-700 dark:text-orange-500" :
                                  p.status === "gateway_failed" ? "text-purple-700 dark:text-purple-500"
                                    : "text-white"
                        }`}
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(p.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><CircleEllipsisIcon /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-200 dark:bg-zinc-900 mr-20">
                        <DropdownMenuGroup>
                          <DropdownMenuItem className="border-b rounded-none border-gray-200">
                            <Button onClick={() => setSelected(p)} variant="ghost" className="gap-2 dark:text-white hower:bg-gray-400 text-black transition">
                              <InfoIcon />Get More Detail
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>)}
      <div className="flex items-center justify-center gap-3 my-3">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg text-white bg-green-600 dark:bg-green-600 disabled:opacity-50"
        >
          Previous
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2">...</span>
          ) : (
            <button
              key={i}
              onClick={() => setPage(p as number)}
              className={`px-3 py-1 rounded-md rounded-2xl ${page === p
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-zinc-900"
                }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-lg text-white bg-green-600 dark:bg-green-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
    {/*Drawer for rows*/}
    <Drawer open={!!select} onOpenChange={() => setSelected(null)} direction="right">
      <DrawerContent className="bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-900">
        <DrawerHeader>
          <DrawerTitle className="text-3xl font-bold dark:text-white">
            Purchase Details
          </DrawerTitle>
        </DrawerHeader>
        {select && (
          <div className="flex flex-col p-6 space-y-6 dark:text-white">
            {/* TOP: Image or Plan Badge */}
            <div className="flex items-center justify-center py-2">
              {select.poster_path && select.poster_path !== "undefined" ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500/${select.poster_path}`}
                  alt="Poster"
                  className="w-28 h-40 rounded-2xl object-cover shadow-lg border border-gray-200 dark:border-zinc-800"
                />
              ) : (
                <div className="w-48 h-28 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-red-700 flex flex-col items-center justify-center text-white shadow-xl p-4 border border-red-500/30">
                  <Crown className="w-8 h-8 mb-1.5 text-amber-200" />
                  <span className="font-extrabold text-xs tracking-wider uppercase text-center truncate max-w-full">
                    {select.movie_name || select.title || "TMDB VIP PASS"}
                  </span>
                  <span className="text-[10px] bg-black/25 text-red-100 px-2 py-0.5 rounded-full mt-1.5 font-bold uppercase tracking-widest">
                    VIP SUBSCRIPTION
                  </span>
                </div>
              )}
            </div>
            {/* USER INFO */}
            <div className="space-y-1">
              <p className="text-lg font-semibold">{select.user_name}</p>
              <p className="text-sm text-gray-500">{select.user_email}</p>
            </div>
            {/* SUBSCRIPTION / MOVIE INFO */}
            <div className="border-t pt-4 space-y-2">
              <p><span className="font-semibold">Title / Pass:</span> {select.movie_name || select.title || "TMDB VIP Pass"}</p>
              <p><span className="font-semibold">Content Type:</span> {select.content_type || "subscription"}</p>
            </div>
            {/* PAYMENT INFO */}
            <div className="border-t pt-4 space-y-2 text-md">
              <p className="flex"><span>Amount:</span> <FaRupeeSign className="mt-1" />{select.amount}</p>
              <p><span>Order ID:</span> {select.order_id}</p>
              <p><span>Payment ID:</span> {select.payment_id}</p>
              <p>
                <span>Status :</span>
                <Badge className={`ms-1 px-2 py-3 rounded-md font-bold uppercase dark:bg-gray-700 ${select.status === "success"
                  ? "text-green-700 dark:text-green-500"
                  : "text-red-700 dark:text-red-500"
                  }`}>{select.status}</Badge>
              </p>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  </>);

};