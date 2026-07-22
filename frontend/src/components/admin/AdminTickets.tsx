import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { api } from "../../servicies/api-client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MoreHorizontal,
  Search,
  Trash2,
  User,
  CreditCard,
  Key,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  Copy,
  Check,
  FilterX,
  Sparkles,
  Tv,
  Film,
  ShieldCheck,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AIEmailAssistant } from "./AIEmailAssistant";

export interface Ticket {
  _id: string;
  ticketId: string;
  name: string;
  email: string;
  category: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  adminNote?: string;
  createdAt: string;
  orderId?: string;
  paymentId?: string;
  receiptId?: string;
  contentName?: string;
  contentId?: string;
  contentType?: string;
  purchaseStatus?: string;
  proofImage?: string;
  proofImages?: string[];
}

const statusColors: Record<string, string> = {
  open: "bg-red-500/10 text-red-500 border-red-500/30 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50",
  in_progress: "bg-amber-500/10 text-amber-500 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
  resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
  closed: "bg-zinc-500/10 text-zinc-500 border-zinc-500/30 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700/50",
};

const categoryLabels: Record<string, string> = {
  cant_login: "Can't Login",
  otp_issues: "OTP Issues",
  google_signin: "Google Sign-in",
  payment_deducted: "Payment Failed",
  content_not_showing: "Content Missing",
  account_locked: "Account Locked",
  email_not_verified: "Email Unverified",
  password_reset: "Password Reset",
  other: "Other",
};

export const AdminTickets = () => {
  const queryClient = useQueryClient();
  const [ticketType, setTicketType] = useState<"account" | "payment">("account");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Razorpay Live State
  const [razorpayData, setRazorpayData] = useState<any>(null);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  // Modals
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isGrantAccessOpen, setIsGrantAccessOpen] = useState(false);
  const [isAIEmailOpen, setIsAIEmailOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [adminNote, setAdminNote] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Grant Access State
  const [grantContentId, setGrantContentId] = useState("");
  const [grantContentType, setGrantContentType] = useState("movie");

  const { data: allTickets = [], isLoading, isError, error } = useQuery({
    queryKey: ["adminTickets"],
    queryFn: async () => {
      const res = await api.get("/admin/tickets");
      return res.data.tickets;
    },
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, ticketType, itemsPerPage]);

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text || text === "N/A") return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(`Copied "${text}" to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const tickets = allTickets.filter((t: Ticket) => {
    const isPayment = t.category === "payment_deducted" || t.category === "content_not_showing";
    return ticketType === "payment" ? isPayment : !isPayment;
  });

  const filteredTickets = tickets.filter((ticket: Ticket) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      ticket.ticketId.toLowerCase().includes(term) ||
      ticket.email.toLowerCase().includes(term) ||
      ticket.name.toLowerCase().includes(term) ||
      (ticket.contentName && ticket.contentName.toLowerCase().includes(term)) ||
      (ticket.orderId && ticket.orderId.toLowerCase().includes(term)) ||
      (ticket.paymentId && ticket.paymentId.toLowerCase().includes(term)) ||
      (ticket.receiptId && ticket.receiptId.toLowerCase().includes(term));

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate Metrics
  const openCount = tickets.filter((t: Ticket) => t.status === "open").length;
  const inProgressCount = tickets.filter((t: Ticket) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t: Ticket) => t.status === "resolved").length;

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const checkRazorpayMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const res = await api.post(`/admin/tickets/${ticketId}/check-razorpay`);
      return res.data;
    },
    onSuccess: (data) => {
      setRazorpayData(data.verification);
      setIsRazorpayModalOpen(true);
      toast.success("Fetched live Razorpay verification data!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to fetch Razorpay data");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      await api.put(`/admin/tickets/${id}/status`, { status, adminNote: note });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminTickets"] });
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
      toast.success(`Ticket status updated to '${variables.status.replace("_", " ")}'`);
      setIsDetailsOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update ticket status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTickets"] });
      toast.success("Ticket deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete ticket");
    },
  });

  const grantAccessMutation = useMutation({
    mutationFn: async ({ id, contentId, contentType }: { id: string; contentId: string; contentType: string }) => {
      await api.post(`/admin/tickets/${id}/grant-access`, { contentId, contentType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTickets"] });
      toast.success("Access granted and ticket resolved!");
      setIsGrantAccessOpen(false);
      setIsDetailsOpen(false);
      setIsRazorpayModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to grant access");
    }
  });

  const resetPaymentMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/admin/tickets/${id}/reset-payment`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTickets"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-status"] });
      toast.success("Payment reset successfully. User can now retry purchasing.");
      setIsDetailsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset payment");
    }
  });

  const handleDeleteTicket = (ticket: Ticket) => {
    if (ticket.status !== "resolved") {
      toast.error("Cannot delete an unresolved ticket!", {
        description: "Please set the ticket to 'In Progress', resolve the issue, and add a resolution note before deleting."
      });
      return;
    }

    if (!ticket.adminNote || ticket.adminNote.trim().length < 5) {
      toast.error("Cannot delete ticket without an admin resolution note!", {
        description: "Please add a note explaining how the issue was resolved."
      });
      setSelectedTicket(ticket);
      setAdminNote(ticket.adminNote || "");
      setIsDetailsOpen(true);
      return;
    }

    if (confirm(`Are you sure you want to delete resolved ticket #${ticket.ticketId}?`)) {
      deleteMutation.mutate(ticket._id);
    }
  };

  const getResolvedPaymentBadge = (ticket: Ticket) => {
    const value = ticket.receiptId || ticket.paymentId || ticket.orderId;
    if (!value || value === "N/A") {
      return (
        <span className="text-zinc-500 font-mono text-xs italic">N/A</span>
      );
    }
    const isReceipt = Boolean(ticket.receiptId);
    const isPayment = Boolean(ticket.paymentId && ticket.paymentId !== "N/A");

    return (
      <button
        onClick={() => copyToClipboard(value, ticket._id + value)}
        className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 transition-colors text-xs font-mono text-zinc-300 hover:text-white"
        title="Click to copy ID"
      >
        <span className={isReceipt ? "text-emerald-400 font-medium" : isPayment ? "text-blue-400 font-medium" : "text-amber-400 font-medium"}>
          {value}
        </span>
        {copiedField === ticket._id + value ? (
          <Check className="w-3 h-3 text-emerald-400" />
        ) : (
          <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        )}
      </button>
    );
  };

  const isFilterActive = searchTerm !== "" || statusFilter !== "all" || categoryFilter !== "all";

  const resetAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3 text-zinc-400">
        <Sparkles className="w-8 h-8 animate-spin text-[#E50914]" />
        <p className="font-medium text-sm animate-pulse">Loading Support Tickets...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-950/20 border border-red-900/40 rounded-xl">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h3 className="text-lg font-bold mb-1">Error Loading Tickets</h3>
        <p className="text-sm text-red-400">{(error as any)?.response?.data?.message || (error as any)?.message || "Failed to connect to backend server"}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Category Toggle Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div className="flex items-center bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800/80 shadow-inner">
          <button
            onClick={() => { setTicketType("account"); resetAllFilters(); }}
            className={`flex items-center gap-2.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${ticketType === "account"
                ? "bg-gradient-to-r from-red-600 to-[#E50914] text-white shadow-md shadow-red-950/50"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
          >
            <User className="w-4 h-4" />
            Account Issues
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-black/30 border border-white/10 font-bold">
              {allTickets.filter((t: Ticket) => t.category !== "payment_deducted" && t.category !== "content_not_showing").length}
            </span>
          </button>

          <button
            onClick={() => { setTicketType("payment"); resetAllFilters(); }}
            className={`flex items-center gap-2.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${ticketType === "payment"
                ? "bg-gradient-to-r from-red-600 to-[#E50914] text-white shadow-md shadow-red-950/50"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
          >
            <CreditCard className="w-4 h-4" />
            Payment Issues
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-black/30 border border-white/10 font-bold">
              {allTickets.filter((t: Ticket) => t.category === "payment_deducted" || t.category === "content_not_showing").length}
            </span>
          </button>
        </div>

        {/* Quick Stats Metric Cards */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            Total: <strong className="text-white font-bold">{tickets.length}</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-900/30 bg-red-950/20 text-xs text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Open: <strong className="text-white font-bold">{openCount}</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-900/30 bg-amber-950/20 text-xs text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            In Progress: <strong className="text-white font-bold">{inProgressCount}</strong>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-900/30 bg-emerald-950/20 text-xs text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Resolved: <strong className="text-white font-bold">{resolvedCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder={ticketType === "payment" ? "Search Ticket ID, Email, Name, Content, Order/Payment ID..." : "Search Ticket ID, User Email, Name..."}
            className="pl-9 bg-zinc-950/80 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-[#E50914] text-sm rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-zinc-950/80 border-zinc-800 text-xs sm:text-sm text-white rounded-lg">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">🔴 Open</SelectItem>
              <SelectItem value="in_progress">🟡 In Progress</SelectItem>
              <SelectItem value="resolved">🟢 Resolved</SelectItem>
            </SelectContent>
          </Select>

          {ticketType === "account" && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] bg-zinc-950/80 border-zinc-800 text-xs sm:text-sm text-white rounded-lg">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels)
                  .filter(([k]) => k !== "payment_deducted" && k !== "content_not_showing")
                  .map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          {isFilterActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllFilters}
              className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs gap-1.5 h-9"
            >
              <FilterX className="w-3.5 h-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950/90 shadow-xl">
        <Table>
          <TableHeader className="bg-zinc-900/80 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="w-[160px] text-xs uppercase tracking-wider font-bold text-zinc-400">Ticket ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold text-zinc-400">User</TableHead>
              {ticketType === "payment" ? (
                <>
                  <TableHead className="text-xs uppercase tracking-wider font-bold text-zinc-400">Content Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-bold text-zinc-400">Payment / Receipt ID</TableHead>
                </>
              ) : (
                <TableHead className="text-xs uppercase tracking-wider font-bold text-zinc-400">Category</TableHead>
              )}
              <TableHead className="text-xs uppercase tracking-wider font-bold text-zinc-400">Status</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider font-bold text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTickets.length === 0 ? (
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableCell colSpan={6} className="h-36 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FilterX className="w-6 h-6 text-zinc-600" />
                    <p className="font-medium text-sm">No tickets match your filter criteria.</p>
                    {isFilterActive && (
                      <Button variant="link" onClick={resetAllFilters} className="text-[#E50914] text-xs">
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket: Ticket) => (
                <TableRow
                  key={ticket._id}
                  className="border-b border-zinc-800/60 hover:bg-zinc-900/40 transition-colors group"
                >
                  {/* Ticket ID Column */}
                  <TableCell className="font-mono text-xs font-semibold py-3.5">
                    <button
                      onClick={() => copyToClipboard(ticket.ticketId, ticket._id + "tkt")}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition-colors group-hover:border-red-900/50"
                      title="Click to copy Ticket ID"
                    >
                      <span>{ticket.ticketId}</span>
                      {copiedField === ticket._id + "tkt" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </TableCell>

                  {/* User Column */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {ticket.name ? ticket.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm text-zinc-100 truncate">{ticket.name}</span>
                        <span className="text-xs text-zinc-400 truncate">{ticket.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Content / Category Column */}
                  {ticketType === "payment" ? (
                    <>
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2">
                          {ticket.contentType === "tv" ? (
                            <Tv className="w-4 h-4 text-blue-400 shrink-0" />
                          ) : (
                            <Film className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-zinc-200">{ticket.contentName || "Unknown Content"}</span>
                            {ticket.contentId && (
                              <span className="text-[11px] text-zinc-500 font-mono">ID: {ticket.contentId} ({ticket.contentType || "movie"})</span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Payment ID Column */}
                      <TableCell className="py-3.5">
                        {getResolvedPaymentBadge(ticket)}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-300 font-normal text-xs px-2.5 py-0.5">
                        {categoryLabels[ticket.category] || ticket.category}
                      </Badge>
                    </TableCell>
                  )}

                  {/* Status Column */}
                  <TableCell className="py-3.5">
                    <Badge variant="outline" className={`capitalize font-semibold border ${statusColors[ticket.status]}`}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="text-right py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-xl">
                          <DropdownMenuLabel className="text-xs font-semibold text-zinc-400">Manage Ticket</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedTicket(ticket);
                            setAdminNote(ticket.adminNote || "");
                            setIsDetailsOpen(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4 text-zinc-400" /> View Full Details
                          </DropdownMenuItem>

                          {ticketType === "payment" && (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setSelectedTicket(ticket);
                                checkRazorpayMutation.mutate(ticket._id);
                              }}>
                                <ShieldCheck className="mr-2 h-4 w-4 text-emerald-400" /> Verify Live Razorpay Status
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => {
                                if (ticket.status === "open") {
                                  updateStatusMutation.mutate({ id: ticket._id, status: "in_progress" });
                                }
                                setGrantContentId(ticket.contentId || "");
                                setGrantContentType(ticket.contentType || "movie");
                                setSelectedTicket(ticket);
                                setIsGrantAccessOpen(true);
                              }}>
                                <Key className="mr-2 h-4 w-4 text-amber-400" /> Grant Manual Access
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => {
                                if (confirm("Are you sure you want to reset this user's payment? This will clear their pending/failed purchase state so they can repurchase.")) {
                                  resetPaymentMutation.mutate(ticket._id);
                                }
                              }}>
                                <RotateCcw className="mr-2 h-4 w-4 text-orange-400" /> Reset Payment State
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuItem onClick={() => { setSelectedTicket(ticket); setIsAIEmailOpen(true); }}>
                            <Mail className="mr-2 h-4 w-4 text-blue-400" /> Draft Response Email
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-zinc-800" />

                          {ticket.status === "open" && (
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: ticket._id, status: "in_progress" })}>
                              <Clock className="mr-2 h-4 w-4 text-blue-400" /> Mark as In Progress
                            </DropdownMenuItem>
                          )}

                          {ticket.status !== "resolved" && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedTicket(ticket);
                              setAdminNote(ticket.adminNote || "");
                              setIsDetailsOpen(true);
                            }}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" /> Resolve Ticket
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator className="bg-zinc-800" />

                          <DropdownMenuItem
                            className={ticket.status === "resolved" ? "text-red-400 font-medium focus:bg-red-950/40" : "text-zinc-500 cursor-not-allowed"}
                            onClick={() => handleDeleteTicket(ticket)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Ticket
                            {ticket.status !== "resolved" && <AlertTriangle className="ml-auto h-3 h-3 text-amber-500" />}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Enhanced Professional Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-zinc-800 bg-zinc-900/60">
          {/* Status Counter */}
          <div className="text-xs text-zinc-400">
            Showing <span className="font-semibold text-white">{filteredTickets.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, filteredTickets.length)}</span> of{" "}
            <span className="font-semibold text-white">{filteredTickets.length}</span> tickets
          </div>

          <div className="flex items-center gap-4">
            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 whitespace-nowrap">Rows:</span>
              <Select value={String(itemsPerPage)} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
                <SelectTrigger className="h-8 w-[75px] text-xs bg-zinc-950 border-zinc-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="h-8 w-8 p-0 border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30"
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="h-8 w-8 p-0 border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="text-xs text-zinc-600 px-1">...</span>}
                        <Button
                          variant={currentPage === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(p)}
                          className={`h-8 w-8 p-0 text-xs font-semibold ${currentPage === p
                              ? "bg-[#E50914] text-white hover:bg-red-700"
                              : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                            }`}
                        >
                          {p}
                        </Button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="h-8 w-8 p-0 border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="h-8 w-8 p-0 border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30"
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Live Verification Modal */}
      <Dialog open={isRazorpayModalOpen} onOpenChange={setIsRazorpayModalOpen}>
        <DialogContent className="sm:max-w-xl bg-zinc-950 text-white border-zinc-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-400 text-xl font-bold">
              <ShieldCheck className="w-6 h-6" /> Razorpay Live Verification
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Live status directly queried from Razorpay API.
            </DialogDescription>
          </DialogHeader>

          {razorpayData && (
            <div className="space-y-4 py-2">
              {/* Top Banner Status */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${razorpayData.hasCapturedPayment
                  ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-300"
                  : "bg-red-950/30 border-red-800/50 text-red-300"
                }`}>
                <div>
                  <p className="text-xs uppercase font-bold tracking-wider opacity-80">Payment Status in Razorpay</p>
                  <p className="text-lg font-black tracking-tight">
                    {razorpayData.hasCapturedPayment ? "CAPTURED / PAID" : "FAILED / NO CAPTURED PAYMENT"}
                  </p>
                </div>
                <Badge className={razorpayData.hasCapturedPayment ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}>
                  {razorpayData.hasCapturedPayment ? "Verified Paid" : "Unverified"}
                </Badge>
              </div>

              {/* Order Info */}
              {razorpayData.orderDetails && (
                <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Razorpay Order Details</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-zinc-500">Order ID:</span> <span className="font-mono text-amber-400 font-bold">{razorpayData.orderDetails.id}</span></div>
                    <div><span className="text-zinc-500">Order Status:</span> <span className="font-bold text-white capitalize">{razorpayData.orderDetails.status}</span></div>
                    <div><span className="text-zinc-500">Amount:</span> <span className="font-bold text-white">₹{razorpayData.orderDetails.amount}</span></div>
                    <div><span className="text-zinc-500">Amount Paid:</span> <span className="font-bold text-emerald-400">₹{razorpayData.orderDetails.amountPaid}</span></div>
                    <div><span className="text-zinc-500">Payment Attempts:</span> <span className="font-bold text-white">{razorpayData.orderDetails.attempts}</span></div>
                    <div><span className="text-zinc-500">Created At:</span> <span className="text-zinc-300">{razorpayData.orderDetails.createdAt}</span></div>
                  </div>
                </div>
              )}

              {/* Payment Attempts List */}
              {razorpayData.payments && razorpayData.payments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Payment Attempts on Razorpay ({razorpayData.payments.length})</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {razorpayData.payments.map((p: any) => (
                      <div key={p.id} className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-mono text-emerald-400 font-bold">{p.id}</p>
                          <p className="text-zinc-400 text-[11px]">Method: <span className="text-white font-medium uppercase">{p.method}</span> | Email: {p.email}</p>
                          {p.errorDescription && <p className="text-red-400 text-[11px] mt-0.5">{p.errorDescription}</p>}
                        </div>
                        <div className="text-right">
                          <Badge className={p.status === "captured" ? "bg-emerald-600" : "bg-red-900/60 text-red-300"}>
                            {p.status}
                          </Badge>
                          <p className="text-[10px] text-zinc-500 mt-1">{p.createdAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-center gap-2 justify-between mt-4">
            <Button variant="outline" className="border-zinc-800 text-zinc-300" onClick={() => setIsRazorpayModalOpen(false)}>Close</Button>
            {razorpayData?.hasCapturedPayment && selectedTicket && (
              <Button
                onClick={() => {
                  setGrantContentId(selectedTicket.contentId || "");
                  setGrantContentType(selectedTicket.contentType || "movie");
                  setIsRazorpayModalOpen(false);
                  setIsGrantAccessOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <Key className="w-4 h-4 mr-1.5" /> Grant Access & Resolve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-6">
              {ticketType === "account" ? "Account Issue Details" : "Payment Issue Details"}
              {selectedTicket && (
                <Badge variant="outline" className={`capitalize border ${statusColors[selectedTicket.status]}`}>
                  {selectedTicket.status.replace("_", " ")}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {selectedTicket && format(new Date(selectedTicket.createdAt), "MMM d, yyyy h:mm a")}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">User</p>
                  <p className="text-sm font-medium text-white">{selectedTicket.name}</p>
                  <p className="text-sm text-zinc-400">{selectedTicket.email}</p>
                </div>
                {ticketType === "payment" ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Content Name</p>
                      <p className="text-sm font-medium text-white">{selectedTicket.contentName || "N/A"} {selectedTicket.contentId ? `(ID: ${selectedTicket.contentId})` : ""}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Order ID</p>
                      <p className="text-sm font-mono text-amber-400 font-semibold">{selectedTicket.orderId || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Payment ID</p>
                      <p className="text-sm font-mono text-emerald-400 font-semibold">{selectedTicket.paymentId || "N/A"}</p>
                    </div>
                    {selectedTicket.receiptId && (
                      <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Receipt ID</p>
                        <p className="text-sm font-mono text-blue-400 font-semibold">{selectedTicket.receiptId}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Ticket ID</p>
                    <p className="text-sm font-mono text-white">{selectedTicket.ticketId}</p>
                  </div>
                )}
              </div>

              {ticketType === "payment" && (selectedTicket.orderId || selectedTicket.paymentId) && (
                <div className="flex items-center justify-between bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/40">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs text-zinc-300">Verify if this Order/Payment ID was captured on Razorpay</span>
                  </div>
                  <Button
                    size="sm"
                    disabled={checkRazorpayMutation.isPending}
                    onClick={() => checkRazorpayMutation.mutate(selectedTicket._id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    {checkRazorpayMutation.isPending ? "Checking..." : "Verify Razorpay Live"}
                  </Button>
                </div>
              )}

              {ticketType === "account" && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-medium text-white">{categoryLabels[selectedTicket.category] || selectedTicket.category}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</p>
                <div className="bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 text-sm whitespace-pre-wrap leading-relaxed text-zinc-200">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Render proofImages or legacy proofImage */}
              {ticketType === "payment" && (selectedTicket.proofImages?.length || selectedTicket.proofImage) ? (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Payment Proof Images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedTicket.proofImages?.length ? (
                      selectedTicket.proofImages.map((imgUrl, index) => (
                        <a key={index} href={imgUrl} target="_blank" rel="noreferrer">
                          <img src={imgUrl} alt={`Payment Proof ${index + 1}`} className="h-32 w-full rounded-lg border border-zinc-800 object-cover bg-black/40 hover:opacity-90 transition-opacity" />
                        </a>
                      ))
                    ) : (
                      selectedTicket.proofImage && (
                        <a href={selectedTicket.proofImage} target="_blank" rel="noreferrer">
                          <img src={selectedTicket.proofImage} alt="Payment Proof" className="h-32 w-full rounded-lg border border-zinc-800 object-cover bg-black/40 hover:opacity-90 transition-opacity" />
                        </a>
                      )
                    )}
                  </div>
                </div>
              ) : null}

              {selectedTicket.status === "resolved" ? (
                <div>
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolution Note
                  </p>
                  <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30 text-sm whitespace-pre-wrap text-emerald-100 font-medium">
                    {selectedTicket.adminNote || "No resolution note provided."}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Admin Resolution Note</p>
                  <Textarea
                    placeholder="Enter details on how this ticket was resolved..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="min-h-[100px] bg-zinc-900 border-zinc-800 text-white focus-visible:ring-1 focus-visible:ring-[#E50914]"
                  />
                  <p className="text-xs text-amber-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> A resolution note (min 5 chars) is required before resolving or deleting this ticket.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-center gap-2 sm:justify-between mt-4">
            <Button variant="outline" className="w-full sm:w-auto border-zinc-800 text-zinc-300 hover:text-white" onClick={() => setIsDetailsOpen(false)}>Close</Button>

            <div className="flex gap-2 w-full sm:w-auto">
              {ticketType === "payment" && selectedTicket?.status !== "resolved" && (
                <Button
                  onClick={() => {
                    if (selectedTicket?.status === "open") {
                      updateStatusMutation.mutate({ id: selectedTicket._id, status: "in_progress" });
                    }
                    setGrantContentId(selectedTicket?.contentId || "");
                    setGrantContentType(selectedTicket?.contentType || "movie");
                    setIsGrantAccessOpen(true);
                  }}
                  className="w-full sm:w-auto bg-[#E50914] hover:bg-red-700 text-white font-semibold"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Grant Access
                </Button>
              )}
              {selectedTicket && selectedTicket.status !== "resolved" && (
                <Button
                  disabled={!adminNote.trim() || adminNote.trim().length < 5 || updateStatusMutation.isPending}
                  onClick={() => updateStatusMutation.mutate({ id: selectedTicket._id, status: "resolved", note: adminNote.trim() })}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? "Resolving..." : "Resolve Ticket"}
                </Button>
              )}
              {selectedTicket && selectedTicket.status === "resolved" && (
                <Button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleDeleteTicket(selectedTicket);
                  }}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Ticket
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Access Dialog */}
      <Dialog open={isGrantAccessOpen} onOpenChange={setIsGrantAccessOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-white border-zinc-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Grant Manual Access</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Provide access to the requested content. This will automatically resolve the ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Content ID (TMDB)</label>
              <Input
                value={grantContentId}
                onChange={(e) => setGrantContentId(e.target.value)}
                placeholder="e.g., 1228710"
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Content Type</label>
              <Select value={grantContentType} onValueChange={setGrantContentType}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-zinc-800">
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="tv">TV Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-zinc-800 text-zinc-300" onClick={() => setIsGrantAccessOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!grantContentId.trim()) return toast.error("Content ID is required");
                if (selectedTicket) {
                  grantAccessMutation.mutate({
                    id: selectedTicket._id,
                    contentId: grantContentId,
                    contentType: grantContentType
                  });
                }
              }}
              disabled={grantAccessMutation.isPending}
              className="bg-[#E50914] hover:bg-red-700 text-white font-semibold"
            >
              {grantAccessMutation.isPending ? "Granting..." : "Confirm & Resolve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Email Assistant Dialog */}
      {selectedTicket && (
        <AIEmailAssistant
          isOpen={isAIEmailOpen}
          onClose={() => setIsAIEmailOpen(false)}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
};
