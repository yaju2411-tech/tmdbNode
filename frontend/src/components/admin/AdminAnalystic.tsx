import { useAdminHook } from "../../hooks/UseAdminHook";
import { UserRoundCheck } from "lucide-react";
import React, {useEffect, useState } from "react";
import { FaRupeeSign } from "react-icons/fa";
import {XAxis,YAxis,Tooltip,Legend,ResponsiveContainer,BarChart,Bar, Area, AreaChart,} from "recharts";
import { Button } from "../ui/button";
export const AdminAnalytics = ({setTab}:{setTab:(tab:any)=>void}) => {
  const [filters, setFilters] = useState({
    from : "",
    to:"",
    type: "all",
  });
  const [status,setStatus] = useState("");
  const {stats,table} = useAdminHook(filters,status);
  const[page,setPage] = useState(1);
  const itemSet = 5;
  const totalPages = Math.ceil(table.length/itemSet);
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
    <div className="space-y-5 overflow-x-hidden max-w-full">
      <div className="flex flex-col sm:flex-row gap-5 justify-end">
        <input
          type="date" className="px-2 py-1 rounded-md dark:bg-zinc-900"
          onChange={(e) => {setFilters({ ...filters, from: e.target.value })}}
        />
        <input
          type="date" className="px-2 py-1 rounded-md dark:bg-zinc-900"
          onChange={(e) => {setFilters({ ...filters, to: e.target.value })}}/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* USERS */}
        <div className="py-5 px-8 rounded-xl shadow-sm hover:shadow-lg transition bg-white dark:bg-zinc-900 flex justify-between">
          <div className="mt-2">
            <p className="text-sm text-gray-500">Total Users</p>
            <h2 className="text-3xl font-bold mt-2">
              {stats.users}
            </h2>
          </div>
          <div className="mt-8">
            <UserRoundCheck size={35}/>
          </div>
        </div>
          <div className="p-5 rounded-xl shadow-sm hover:shadow-lg transition bg-white dark:bg-zinc-900 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Subscription Orders</p>
              <h2 className="text-3xl font-bold mt-2">
                {stats.orders}
              </h2>
            </div>
          <div className="mt-3 text-sm text-gray-500 space-y-1">
            <p className="text-green-500 font-semibold">✔ {stats.successOrders} Active VIP</p>
            <p className="text-yellow-500 font-semibold">⏳ {stats.pendingOrders} Pending</p>
            <p className="text-red-500 font-semibold"> ❌ {stats.failedOrders} Failed</p>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-sm hover:shadow-lg transition bg-white dark:bg-zinc-900 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Subscription Revenue</p>
            <h2 className="flex text-3xl font-bold mt-1">
              <FaRupeeSign className="mr-1 mt-2" />
              {stats.revenue}
            </h2>
          </div>
          <div className="mt-3 text-xs text-gray-400 space-y-1">
            <p className="flex justify-between gap-4 font-semibold text-emerald-400">
              <span>Monthly (₹199):</span>
              <span>₹{(planChartData[0]?.revenue || 0)}</span>
            </p>
            <p className="flex justify-between gap-4 font-semibold text-blue-400">
              <span>Quarterly (₹399):</span>
              <span>₹{(planChartData[1]?.revenue || 0)}</span>
            </p>
            <p className="flex justify-between gap-4 font-semibold text-amber-400">
              <span>Yearly (₹1499):</span>
              <span>₹{(planChartData[2]?.revenue || 0)}</span>
            </p>
          </div>
        </div>
      </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 h-[600px] space-y-8 w-full">
        <h2 className="text-lg font-bold border-b border-gray-200 dark:border-gray-800 py-3">Subscription Plans Breakdown</h2>
        <ResponsiveContainer width="100%" height={450}>
      <BarChart
        data={planChartData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 0,
        }}
        barCategoryGap="20%"
      >
      <XAxis dataKey="name"/>
      <YAxis allowDecimals={false} />
      <Tooltip
        content={({ active, payload, label }) => {
          if (!active || !payload?.length) return null;
          const data = payload[0].payload;
          return (
            <div className="rounded-xl border bg-gray-200 dark:bg-zinc-900 p-4 shadow-lg space-y-2 min-w-[180px]">
              <p className="font-bold text-center border-b pb-1">{label}</p>
              <p className="text-sm font-semibold text-emerald-400">Sales: {data.sales} VIP Pass(es)</p>
              <p className="text-sm font-semibold text-blue-400">Revenue: ₹{data.revenue}</p>
            </div>
          );
        }}
      />
      <Legend />
      <Bar
        dataKey="revenue"
        name="Revenue (₹)"
        fill="#e50914"
        radius={[10, 10, 0, 0]}
      />
      </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 h-[600px] w-full space-y-8">
        <h2 className="text-lg font-bold border-b border-gray-200 dark:border-gray-800 py-3">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={450}>
            <AreaChart
              responsive
              data={chartData}
              margin={{top:0,right:30,bottom:30,left:0}}
              onContextMenu={(_, e) => e.preventDefault()}
            >
              <XAxis dataKey="month" />
              <YAxis/>
              <Tooltip content={
                ({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return(<>
                    <div className="rounded-xl border bg-gray-200  dark:bg-zinc-900 p-4 shadow-lg space-y-3">
                      <h1 className="text-md border-b pb-1">{label}</h1>
                      <p className="">Total Revenue : {data.totalRevenue}</p>
                    </div>
                  </>);
                }
              }
              />
              <Area type="bump" dataKey="totalRevenue" fill="#26ed29"/>
              </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

      <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-900 shadow-xl overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-900 flex flex-col sm:flex-row justify-between gap-4">
          <h2 className="text-lg font-semibold">Invoices</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" className="bg-green-500 text-white dark:bg-green-700" onClick={() => { setTab("mpurchases");}}>View All</Button>
            <select className="px-2 py-1 rounded-md dark:bg-zinc-900"
              onChange={(e) => {setFilters({ ...filters, type: e.target.value });setPage(1);}}
            >
              <option value="all">Content Type</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>
            <select className="px-2 py-1 rounded-md dark:bg-zinc-900"
              onChange={(e) => {setStatus(e.target?.value);setPage(1);}}
            >
              <option value="">Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="manual_access">Manual</option>
              <option value="cancelled">Cancelled</option>
              <option value="verification_failed">Not Verified</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-md text-left">
            <thead className="text-sm uppercase bg-gray-100 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-900">
              {paginatedData.length === 0 ? (
                <tr className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900/30">
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                  >
                    <td className="px-6 py-4">
                      {item.movie_name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          item.content_type === "movie"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {item.content_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex">
                      <FaRupeeSign className="mt-1"/> {item.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          item.status === "success"
                            ? "bg-green-500/20 text-green-400 "
                            : item.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400 "
                            : "bg-red-500/20 text-red-400 "
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center my-4 gap-3">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded-md bg-gray-200 dark:bg-zinc-800 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-md bg-gray-200 dark:bg-zinc-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};