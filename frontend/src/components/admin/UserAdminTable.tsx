import React, { useEffect, useState } from "react";
import { Edit, Trash2, X } from "lucide-react";
import { useAdminHook } from "../../hooks/UseAdminHook";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export const UserAdminTable = () => {
  const [search, setSearch] = useState("");
  const { useUsers, updateUserByAdmin, deleteUserByAdmin } = useAdminHook();
  const { data: users = [] } = useUsers(search);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>();

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
    await deleteUserByAdmin(id);
  }

  if (!users) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-zinc-900 shadow-xl overflow-hidden mt-4 transition-colors overflow-x-hidden max-w-full">
      <div className="p-6 border-b border-gray-200 dark:border-zinc-900 flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-200">Registered Users</h2>
        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="px-3 border border-gray-600 rounded-lg dark:bg-zinc-900 text-white"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>VIP Subscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u: any) => {
              const sub = u.subscription || {};
              const isSubActive = sub.status === "active" && sub.expiresAt && new Date(sub.expiresAt) > new Date();

              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-zinc-800" />
                        <span className="font-medium text-gray-900 dark:text-gray-200">{u.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 dark:text-gray-400">{u.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isSubActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {isSubActive
                        ? `VIP (${sub.plan?.toUpperCase()})`
                        : "Free / Expired"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(u)} className="p-2 text-gray-400 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md transition-colors inline-block" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-2 border border-transparent text-[#E50914] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transition-colors">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update User</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                <img src={preview || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-zinc-900 shadow-md" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Avatar</label>
                  <button type="button" onClick={() => setPreview("")} className="text-xs text-[#E50914] hover:underline">Remove</button>
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
                  className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-zinc-900 file:text-gray-900 dark:file:text-white hover:file:bg-gray-200 dark:hover:file:bg-zinc-800 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900/50 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E50914] transition-colors outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900/50 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E50914] transition-colors outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-900 bg-gray-50 dark:bg-zinc-900/20">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-white bg-transparent hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md transition-colors outline-none">
                Cancel
              </button>
              <button onClick={handleUpdate} className="px-4 py-2 text-sm font-semibold text-white bg-[#E50914] hover:bg-red-700 rounded-md transition-colors outline-none">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};