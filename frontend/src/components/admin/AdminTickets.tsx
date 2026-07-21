import React, { useState } from "react";
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
import { CheckCircle2, Circle, Clock, Eye, Mail, MoreHorizontal, Search, Trash2, User, CreditCard, Key, RotateCcw } from "lucide-react";
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
  proofImage?: string;
  proofImages?: string[];
}

const statusColors: any = {
  open: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  closed: "bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-400 border-gray-200 dark:border-zinc-700",
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
  
  // Modals
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isGrantAccessOpen, setIsGrantAccessOpen] = useState(false);
  const [isAIEmailOpen, setIsAIEmailOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [adminNote, setAdminNote] = useState("");
  
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

  const tickets = allTickets.filter((t: Ticket) => {
    const isPayment = t.category === "payment_deducted" || t.category === "content_not_showing";
    return ticketType === "payment" ? isPayment : !isPayment;
  });

  const filteredTickets = tickets.filter((ticket: Ticket) => {
    const matchesSearch =
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      await api.put(`/admin/tickets/${id}/status`, { status, adminNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTickets"] });
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] }); // Update bell icon
      toast.success("Ticket status updated");
      setIsDetailsOpen(false);
    },
    onError: () => toast.error("Failed to update ticket status"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTickets"] });
      toast.success("Ticket deleted");
    },
    onError: () => toast.error("Failed to delete ticket"),
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
      toast.success("Pending payment reset successfully. User can retry.");
      setIsDetailsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset payment");
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading tickets...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        <h3 className="text-lg font-bold mb-2">Error loading tickets</h3>
        <p className="text-sm">{(error as any)?.response?.data?.message || (error as any)?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Switch Toggle */}
      <div className="flex justify-center w-full pb-2">
        <div className="flex items-center bg-gray-100 dark:bg-zinc-900 p-1 rounded-lg border border-gray-200 dark:border-zinc-800">
          <button
            onClick={() => { setTicketType("account"); setCategoryFilter("all"); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${ticketType === "account" ? "bg-white dark:bg-zinc-800 shadow-sm text-[#E50914] dark:text-[#E50914]" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"}`}
            title="Account Issues"
          >
            <User className="w-4 h-4" />
            Account Issues
          </button>
          <button
            onClick={() => { setTicketType("payment"); setCategoryFilter("all"); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${ticketType === "payment" ? "bg-white dark:bg-zinc-800 shadow-sm text-[#E50914] dark:text-[#E50914]" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"}`}
            title="Payment Issues"
          >
            <CreditCard className="w-4 h-4" />
            Payment Issues
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
            {ticketType === "account" ? "Account Tickets" : "Payment Tickets"}
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search ID or Email..."
              className="pl-9 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-xs sm:text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900/50 dark:text-white w-[130px]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          {ticketType === "account" && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-xs sm:text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900/50 dark:text-white ">
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels)
                  .filter(([k]) => k !== "payment_deducted" && k !== "content_not_showing")
                  .map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Badge variant="outline" className="px-3 py-1 whitespace-nowrap">
            {filteredTickets.length} Total
          </Badge>
        </div>
      </div>
      <div className="rounded-md border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-zinc-900/50">
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>User</TableHead>
              {ticketType === "payment" ? (
                <>
                  <TableHead>Content Name</TableHead>
                  <TableHead>Payment ID</TableHead>
                </>
              ) : (
                <TableHead>Category</TableHead>
              )}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">{ticketType === "account" ? "Date" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  No tickets found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket: Ticket) => (
                <TableRow key={ticket._id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                  <TableCell className="font-mono text-xs">{ticket.ticketId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{ticket.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{ticket.email}</span>
                    </div>
                  </TableCell>

                  {ticketType === "payment" ? (
                    <>
                      <TableCell>
                        <span className="font-medium text-sm">{ticket.contentName || "Unknown"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{ticket.paymentId || "N/A"}</span>
                      </TableCell>
                    </>
                  ) : (
                    <TableCell>
                      <span className="text-sm">{categoryLabels[ticket.category] || ticket.category}</span>
                    </TableCell>
                  )}

                  <TableCell>
                    <Badge variant="outline" className={`capitalize font-medium border ${statusColors[ticket.status]}`}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  {ticketType === "account" ? (
                    <>
                      <TableCell className="text-right text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTicket(ticket);
                              setAdminNote(ticket.adminNote || "");
                              setIsDetailsOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedTicket(ticket); setIsAIEmailOpen(true); }}>
                              <Mail className="mr-2 h-4 w-4" /> Email User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: ticket._id, status: "open" })}>
                              <Circle className="mr-2 h-4 w-4 text-red-500" /> Mark as Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: ticket._id, status: "in_progress" })}>
                              <Clock className="mr-2 h-4 w-4 text-blue-500" /> Mark as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedTicket(ticket);
                              setAdminNote(ticket.adminNote || "");
                              setIsDetailsOpen(true);
                            }}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => deleteMutation.mutate(ticket._id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Ticket
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedTicket(ticket);
                            setAdminNote(ticket.adminNote || "");
                            setIsDetailsOpen(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setGrantContentId(ticket.contentId || "");
                            setGrantContentType(ticket.contentType || "movie");
                            setSelectedTicket(ticket);
                            setIsGrantAccessOpen(true);
                          }}>
                            <Key className="mr-2 h-4 w-4 text-yellow-500" /> Grant Access
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            if (confirm("Are you sure you want to reset this user's payment? This will delete their pending order so they can restart from scratch.")) {
                              resetPaymentMutation.mutate(ticket._id);
                            }
                          }}>
                            <RotateCcw className="mr-2 h-4 w-4 text-orange-500" /> Reset Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedTicket(ticket); setIsAIEmailOpen(true); }}>
                            <Mail className="mr-2 h-4 w-4" /> Email User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: ticket._id, status: "open" })}>
                            <Circle className="mr-2 h-4 w-4 text-red-500" /> Mark as Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: ticket._id, status: "in_progress" })}>
                            <Clock className="mr-2 h-4 w-4 text-blue-500" /> Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedTicket(ticket);
                            setAdminNote(ticket.adminNote || "");
                            setIsDetailsOpen(true);
                          }}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Mark as Resolved
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => deleteMutation.mutate(ticket._id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Ticket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ticket Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-6">
              {ticketType === "account" ? "Account Issue Details" : "Payment Issue Details"}
              {selectedTicket && (
                <Badge variant="outline" className={`capitalize border ${statusColors[selectedTicket.status]}`}>
                  {selectedTicket.status.replace("_", " ")}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              {selectedTicket && format(new Date(selectedTicket.createdAt), "MMM d, yyyy h:mm a")}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">User</p>
                  <p className="text-sm font-medium">{selectedTicket.name}</p>
                  <p className="text-sm text-gray-500">{selectedTicket.email}</p>
                </div>
                {ticketType === "payment" ? (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Content Name</p>
                      <p className="text-sm font-medium">{selectedTicket.contentName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment ID</p>
                      <p className="text-sm font-mono">{selectedTicket.paymentId || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                      <p className="text-sm font-mono">{selectedTicket.orderId || "N/A"}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ticket ID</p>
                    <p className="text-sm font-mono">{selectedTicket.ticketId}</p>
                  </div>
                )}
              </div>

              {ticketType === "account" && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-medium">{categoryLabels[selectedTicket.category] || selectedTicket.category}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                <div className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-md border border-gray-200 dark:border-zinc-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Render proofImages or legacy proofImage */}
              {ticketType === "payment" && (selectedTicket.proofImages?.length || selectedTicket.proofImage) ? (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Proof Images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedTicket.proofImages?.length ? (
                      selectedTicket.proofImages.map((imgUrl, index) => (
                        <a key={index} href={imgUrl} target="_blank" rel="noreferrer">
                          <img src={imgUrl} alt={`Payment Proof ${index + 1}`} className="h-32 w-full rounded-md border border-gray-200 dark:border-zinc-800 object-cover bg-black/5 hover:opacity-90 transition-opacity" />
                        </a>
                      ))
                    ) : (
                      selectedTicket.proofImage && (
                        <a href={selectedTicket.proofImage} target="_blank" rel="noreferrer">
                          <img src={selectedTicket.proofImage} alt="Payment Proof" className="h-32 w-full rounded-md border border-gray-200 dark:border-zinc-800 object-cover bg-black/5 hover:opacity-90 transition-opacity" />
                        </a>
                      )
                    )}
                  </div>
                </div>
              ) : null}

              {selectedTicket.status === "resolved" ? (
                <div>
                  <p className="text-xs font-semibold text-green-600 dark:text-green-500 uppercase tracking-wider mb-2 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Resolution Note
                  </p>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-md border border-green-200 dark:border-green-900/30 text-sm whitespace-pre-wrap text-green-900 dark:text-green-100">
                    {selectedTicket.adminNote || "No resolution note provided."}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Admin Resolution Note</p>
                  <Textarea
                    placeholder="Enter details on how this ticket was resolved..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="min-h-[100px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus-visible:ring-1"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">A note is required before marking this ticket as resolved.</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-center gap-2 sm:justify-between mt-4">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            
            <div className="flex gap-2 w-full sm:w-auto">
              {ticketType === "payment" && selectedTicket?.status !== "resolved" && (
                <Button 
                  onClick={() => {
                    setGrantContentId(selectedTicket?.contentId || "");
                    setGrantContentType(selectedTicket?.contentType || "movie");
                    setIsGrantAccessOpen(true);
                  }} 
                  className="w-full sm:w-auto bg-[#E50914] hover:bg-red-700 text-white"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Grant Access
                </Button>
              )}
              {selectedTicket && selectedTicket.status !== "resolved" && (
                <Button
                  disabled={!adminNote.trim() || updateStatusMutation.isPending}
                  onClick={() => updateStatusMutation.mutate({ id: selectedTicket._id, status: "resolved", note: adminNote.trim() })}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? "Resolving..." : "Resolve Ticket"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Access Dialog */}
      <Dialog open={isGrantAccessOpen} onOpenChange={setIsGrantAccessOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle>Grant Manual Access</DialogTitle>
            <DialogDescription>
              Provide access to the requested content. This will automatically resolve the ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content ID (TMDB)</label>
              <Input 
                value={grantContentId} 
                onChange={(e) => setGrantContentId(e.target.value)}
                placeholder="e.g., 1228710" 
                className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <Select value={grantContentType} onValueChange={setGrantContentType}>
                <SelectTrigger className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900/50 dark:text-white">
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="tv">TV Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGrantAccessOpen(false)}>Cancel</Button>
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
              className="bg-[#E50914] hover:bg-red-700 text-white"
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
