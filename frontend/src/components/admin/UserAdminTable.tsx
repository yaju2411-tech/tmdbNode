import React, { useState } from "react";
import { Edit, Trash2, X, Search, ShieldCheck, Crown, User, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useAdminHook } from "../../hooks/UseAdminHook";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export const UserAdminTable = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { useUsers, updateUserByAdmin, deleteUserByAdmin } = useAdminHook();
  const { data: users = [], isLoading } = useUsers(search);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>();

  // Filter users by status
  const filteredUsers = users.filter((u: any) => {
    const sub = u.subscription || {};
    const isSubActive = sub.status === "active" && sub.expiresAt && new Date(sub.expiresAt) > new Date();

    if (statusFilter === "active") return isSubActive;
    if (statusFilter === "expired") return !isSubActive;
    return true;
  });

  // Pagination calculation
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (u: any) => {
    setSelectedId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPreview(u.avatar_url);
    setFile(null);
    setIsOpen(true);
  };

  const handleUpdate = async () => {
    await updateUserByAdmin({ id: selectedId, name, email, file });
    setIsOpen(false);
  };

  const handleDelete = async (id: any) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUserByAdmin(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-zinc-900 shadow-2xl overflow-hidden mt-2 transition-all">
      {/* Header & Title Bar */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-zinc-900 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/10 text-red-600 rounded-xl border border-red-500/20">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Registered Users
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Manage accounts, VIP passes, and profiles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full text-xs font-bold text-gray-700 dark:text-zinc-300">
              Total: {users.length}
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-600 transition-all"
            />
            {search && (
              <X
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-red-500"
                onClick={() => setSearch("")}
              />
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            <button
              onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                statusFilter === "all"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => { setStatusFilter("active"); setCurrentPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"
              }`}
            >
              <Crown size={14} /> Active VIP
            </button>
            <button
              onClick={() => { setStatusFilter("expired"); setCurrentPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                statusFilter === "expired"
                  ? "bg-zinc-700 text-white"
                  : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"
              }`}
            >
              Free / Expired
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-zinc-900 bg-gray-50/50 dark:bg-zinc-900/40">
              <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400">User Profile</TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400">Email Address</TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400">Subscription Status</TableHead>
              <TableHead className="py-4 font-bold text-xs uppercase text-gray-500 dark:text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-sm text-gray-500 dark:text-zinc-400">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((u: any) => {
                const sub = u.subscription || {};
                const isSubActive = sub.status === "active" && sub.expiresAt && new Date(sub.expiresAt) > new Date();

                return (
                  <TableRow key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-900/30 transition-colors border-b border-gray-100 dark:border-zinc-900">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-zinc-800 shadow-sm"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[180px]">
                            {u.name || "Unnamed User"}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-zinc-400 capitalize">
                            Role: {u.role || "user"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm font-medium text-gray-600 dark:text-zinc-300">
                      <span className="truncate max-w-[220px] block">{u.email}</span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                          isSubActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800"
                        }`}
                      >
                        {isSubActive && <Crown size={12} className="text-amber-500" />}
                        {isSubActive ? `VIP (${sub.plan?.toUpperCase() || "PASS"})` : "Free User"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="p-2 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
        {paginatedUsers.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500 dark:text-zinc-400">
            No users found matching query.
          </div>
        ) : (
          paginatedUsers.map((u: any) => {
            const sub = u.subscription || {};
            const isSubActive = sub.status === "active" && sub.expiresAt && new Date(sub.expiresAt) > new Date();

            return (
              <div
                key={u.id}
                className="bg-gray-50/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-sm"
              >
                {/* User Info Header */}
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <img
                      src={u.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-zinc-800 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                        {u.name || "Unnamed User"}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(u)}
                      className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg transition-all"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-zinc-800/80 text-[11px]">
                  <span className="text-gray-500 dark:text-zinc-400 font-semibold">
                    Role: <strong className="text-gray-800 dark:text-zinc-200 capitalize">{u.role || "user"}</strong>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                      isSubActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                    }`}
                  >
                    {isSubActive && <Crown size={10} className="text-amber-500" />}
                    {isSubActive ? `VIP (${sub.plan?.toUpperCase() || "PASS"})` : "Free / Expired"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination & Stats Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-zinc-950/50">
        <span className="text-xs text-gray-500 dark:text-zinc-400 font-semibold">
          Showing <strong className="text-gray-900 dark:text-white">{paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{" "}
          <strong className="text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of{" "}
          <strong className="text-gray-900 dark:text-white">{totalItems}</strong> users
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs font-bold px-2 text-gray-700 dark:text-zinc-300">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Edit User Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-zinc-900">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Update User Account</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-center">
                <img
                  src={preview || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-zinc-800 shadow-md"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">Avatar Image</label>
                  <button type="button" onClick={() => setPreview("")} className="text-[11px] text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      setPreview(URL.createObjectURL(f));
                    }
                  }}
                  className="w-full text-xs text-gray-600 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-zinc-900 file:text-gray-900 dark:file:text-white hover:file:bg-gray-200 dark:hover:file:bg-zinc-800 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-900 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-900 text-xs text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-gray-200 dark:border-zinc-900 bg-gray-50 dark:bg-zinc-900/30">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-zinc-300 bg-transparent hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-600/30"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};