import { User } from "./user";

export interface Purchase {
  _id: string;
  user: string | User;
  contentId: number;
  title: string;
  poster?: string;
  contentType: "subscription" | "movie" | "tv";
  plan?: "monthly" | "quarterly" | "yearly";
  startDate?: string;
  expiresAt?: string;
  amount: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: "paid" | "pending" | "failed";
  createdAt: string;
}

export interface Receipt {
  _id?: string;
  receiptNumber: string;
  purchase?: string | Purchase;
  user?: string | User;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  contentId?: number;
  title?: string;
  contentType?: "subscription" | "movie" | "tv";
  amount?: number;
  status?: string;
  createdAt?: string;
}
