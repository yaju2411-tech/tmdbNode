import { useAdminHook } from "../../hooks/UseAdminHook";
import { UserRoundCheck, Calendar, TrendingUp, CreditCard, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import React, { useState } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart, Cell } from "recharts";
import { Button } from "../ui/button";

export const AdminAnalytics = ({ setTab }: { setTab: (tab: any) => void }) => {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    type: "all",
  });
  const [status, setStatus] = useState("");
  const { stats, table } = useAdminHook(filters, status);
  const [page, setPage] = useState(1);
  const itemSet = 5;
  const totalPages = Math.ceil(table.length / itemSet) || 1;
  const paginatedData = table.slice(
    (page - 1) * itemSet,
    page * itemSet
  );

  const planChartData = React.useMemo(() => {
    let monthlyCount = 0;
    let quarterlyCount = 0;
    let yearlyCount = 0;

    table.forEach((purchase: any) => {
      if (purchase.status !== "success" && purchase.status !== "paid") return;
      const plan = purchase.plan || (purchase.amount === 1499 ? "yearly" : purchase.amount === 399 ? "quarterly" : "monthly");
      if (plan === "yearly") yearlyCount++;
      else if (plan === "quarterly") quarterlyCount++;
      else monthlyCount++;
    });

    return [
      { name: "Monthly (₹199)", sales: monthlyCount, revenue: monthlyCount * 199 },
      { name: "Quarterly (₹399)", sales: quarterlyCount, revenue: quarterlyCount * 399 },
      { name: "Yearly (₹1499)", sales: yearlyCount, revenue: yearlyCount * 1499 },
    ];
  }, [table]);

  const chartData = React.useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr",
      "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec",
    ];
    const monthlyData = months.map((month) => ({
      month,
      totalRevenue: null as number | null,
    }));
    table.forEach((purchase: any) => {
      if (purchase.status !== "success" && purchase.status !== "paid") return;
      const date = new Date(purchase.created_at || purchase.createdAt);
      const monthIndex = date.getMonth();
      if (monthlyData[monthIndex].totalRevenue === null) {
        monthlyData[monthIndex].totalRevenue = 0;
      }
      const amount = Number(purchase.amount) || 0;
      monthlyData[monthIndex].totalRevenue! += amount;
    });
    return monthlyData;
  }, [table]);

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-gray-200 dark:border-zinc-900 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-600/10 text-red-600 rounded-xl border border-red-500/20">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">Analytics Overview</h3>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">Filter revenue performance by date range</p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs w-full sm:w-auto">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <span className="text-gray-500 font-bold">From:</span>
            <input
              type="date"
              className="bg-transparent text-gray-900 dark:text-white text-xs font-semibold outline-none w-full"
              onChange={(e) => { setFilters({ ...filters, from: e.target.value }); }}
            />
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs w-full sm:w-auto">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <span className="text-gray-500 font-bold">To:</span>
            <input
              type="date"
              className="bg-transparent text-gray-900 dark:text-white text-xs font-semibold outline-none w-full"
              onChange={(e) => { setFilters({ ...filters, to: e.target.value }); }}
            />
          </div>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* USERS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 shadow-xl flex justify-between items-center transition-all hover:scale-[1.01]">
          <div>
            <p className="text-xs uppercase font-extrabold text-gray-500 dark:text-zinc-400 tracking-wider">Total Registered Users</p>
            <h2 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">
              {stats.users}
            </h2>
          </div>
          <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
            <UserRoundCheck size={28} />
          </div>
        </div>

        {/* ORDERS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 shadow-xl flex justify-between items-center transition-all hover:scale-[1.01]">
          <div>
            <p className="text-xs uppercase font-extrabold text-gray-500 dark:text-zinc-400 tracking-wider">Subscription Orders</p>
            <h2 className="text-3xl font-black mt-2 text-gray-900 dark:text-white">
              {stats.orders}
            </h2>
          </div>
          <div className="text-[11px] space-y-1 text-right font-bold">
            <p className="text-emerald-500">✔ {stats.successOrders} Active VIP</p>
            <p className="text-amber-500">⏳ {stats.pendingOrders} Pending</p>
            <p className="text-red-500">❌ {stats.failedOrders} Failed</p>
          </div>
        </div>

        {/* REVENUE */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 shadow-xl flex justify-between items-center transition-all hover:scale-[1.01] sm:col-span-2 md:col-span-1">
          <div>
            <p className="text-xs uppercase font-extrabold text-gray-500 dark:text-zinc-400 tracking-wider">Subscription Revenue</p>
            <h2 className="flex items-center text-3xl font-black mt-1 text-emerald-500">
              <FaRupeeSign className="mr-0.5 text-2xl" />
              {stats.revenue}
            </h2>
          </div>
          <div className="text-[10px] sm:text-xs space-y-1 font-bold">
            <p className="flex justify-between gap-3 text-emerald-400">
              <span>Monthly:</span>
              <span>₹{(planChartData[0]?.revenue || 0)}</span>
            </p>
            <p className="flex justify-between gap-3 text-blue-400">
              <span>Quarterly:</span>
              <span>₹{(planChartData[1]?.revenue || 0)}</span>
            </p>
            <p className="flex justify-between gap-3 text-amber-400">
              <span>Yearly:</span>
              <span>₹{(planChartData[2]?.revenue || 0)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recharts Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 shadow-xl space-y-4 w-full">
          <h2 className="text-sm sm:text-base font-extrabold border-b border-gray-200 dark:border-zinc-900 pb-3 text-gray-900 dark:text-white">
            Subscription Plans Breakdown
          </h2>
          <div className="h-[280px] sm:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={planChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barCategoryGap="25%"
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-xl space-y-1 text-xs">
                        <p className="font-bold text-center border-b border-gray-200 dark:border-zinc-800 pb-1">{label}</p>
                        <p className="font-semibold text-emerald-500">Sales: {data.sales} VIP Pass(es)</p>
                        <p className="font-semibold text-blue-500">Revenue: ₹{data.revenue}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="revenue" name="Revenue (₹)" radius={[8, 8, 0, 0]}>
                  {planChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#3b82f6" : index === 1 ? "#10b981" : "#e50914"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 shadow-xl space-y-4 w-full">
          <h2 className="text-sm sm:text-base font-extrabold border-b border-gray-200 dark:border-zinc-900 pb-3 text-gray-900 dark:text-white">
            Monthly Revenue Trend
          </h2>
          <div className="h-[280px] sm:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-xl text-xs space-y-1">
                        <h4 className="font-bold border-b border-gray-200 dark:border-zinc-800 pb-1">{label}</h4>
                        <p className="font-bold text-emerald-500">Revenue: ₹{data.totalRevenue || 0}</p>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="totalRevenue" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Invoices Table Component */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-900 shadow-2xl overflow-hidden mt-6">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-zinc-900 flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
              <FileText size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-wide text-gray-900 dark:text-white">
              Recent Sales & Invoices
            </h2>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <select
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-red-600"
              onChange={(e) => { setStatus(e.target?.value); setPage(1); }}
            >
              <option value="">Status: All</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 rounded-xl shadow-md shadow-red-600/30"
              onClick={() => { setTab("mpurchases"); }}
            >
              View All Orders
            </Button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50/50 dark:bg-zinc-900/40 text-gray-500 dark:text-zinc-400 font-bold border-b border-gray-200 dark:border-zinc-900">
              <tr>
                <th className="px-6 py-4">Pass Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-900">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 text-xs">
                    No invoice records found
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {item.movie_name || (item.amount === 1499 ? "TMDB VIP Annual Pass" : item.amount === 399 ? "TMDB VIP Quarterly Pass" : "TMDB VIP Monthly Pass")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {item.content_type || "subscription"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{item.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                          item.status === "success" || item.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : item.status === "pending"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-zinc-400">
                      {new Date(item.created_at || item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="block md:hidden p-3 space-y-3">
          {paginatedData.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500 dark:text-zinc-400">
              No invoice records found.
            </div>
          ) : (
            paginatedData.map((item: any) => (
              <div
                key={item.id}
                className="bg-gray-50/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900 dark:text-white truncate max-w-[200px]">
                    {item.movie_name || (item.amount === 1499 ? "TMDB VIP Annual Pass" : item.amount === 399 ? "TMDB VIP Quarterly Pass" : "TMDB VIP Monthly Pass")}
                  </span>
                  <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                    ₹{item.amount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span
                    className={`px-2 py-0.5 rounded-full font-extrabold capitalize ${
                      item.status === "success" || item.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : item.status === "pending"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-gray-400">
                    {new Date(item.created_at || item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-zinc-900 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-950/50">
          <span className="text-xs text-gray-500 dark:text-zinc-400 font-semibold">
            Page <strong className="text-gray-900 dark:text-white">{page}</strong> of{" "}
            <strong className="text-gray-900 dark:text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Previous
            </button>
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
    </div>
  );
};