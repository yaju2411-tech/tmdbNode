export interface Receipt {
  receipt_number: string;
  content_title: string;
  content_type: "movie" | "tv";
  amount: number;
  payment_id: string;
  order_id: string;
  status: "paid" | "refunded";
  paid_at: string;
  uname: string;
  uemail: string;
}