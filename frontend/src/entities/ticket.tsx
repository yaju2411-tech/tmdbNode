export type TicketCategory =
  | "cant_login"
  | "google_signin"
  | "payment_deducted"
  | "content_not_showing"
  | "account_locked"
  | "email_not_verified"
  | "password_reset"
  | "other";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Ticket {
  _id: string;
  ticketId: string;
  name: string;
  email: string;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  adminNote?: string;
  proofImages?: string[];
  plan?: "monthly" | "quarterly" | "yearly";
  amount?: number;
  orderId?: string;
  paymentId?: string;
  receiptId?: string;
  contentId?: string;
  contentType?: "subscription" | "movie" | "tv";
  contentName?: string;
  purchaseStatus?: "success" | "pending" | "failed" | "no_record";
  createdAt: string;
  updatedAt?: string;
}
