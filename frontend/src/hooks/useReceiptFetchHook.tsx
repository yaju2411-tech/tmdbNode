import { Receipt } from "../entities/receipt";
import { api } from "../servicies/api-client";
import { useEffect, useState } from "react";

export const useReceipt = (search: string) => {
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!search) return;
    const fetchReceipt = async () => {
      try {
        const res = await api.get(`/payment/receipt/${search}`);
        if (res.data.success && res.data.receipt) {
          setReceipt(res.data.receipt as Receipt);
        }
      } catch (err) {
        console.error("Failed to fetch receipt:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [search]);
  return { receipt, loading };
};

// for server
export const useFetchReceiptServer = (search: string) => {
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const res = await api.get("/payment/my-purchases");
        const list = res.data.purchases || [];
        
        const mappedList = list
          .filter((m: any) => {
            if (!search || search.trim() === "") return true;
            const term = search.toLowerCase();
            return (
              m.title?.toLowerCase().includes(term) ||
              m.razorpayPaymentId?.toLowerCase().includes(term)
            );
          })
          .map((m: any) => ({
            receipt_number: m.razorpayOrderId,
            uname: "Customer",
            uemail: "",
            payment_id: m.razorpayPaymentId,
            paid_at: m.createdAt,
            status: m.status === "paid" ? "success" : m.status,
            content_title: m.title,
            order_id: m.razorpayOrderId,
            content_type: m.contentType,
            amount: m.amount
          }));

        const offset = (page - 1) * limit;
        setReceipt(mappedList.slice(offset, offset + limit));
        setTotal(mappedList.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [page, limit, search]);

  return { loading, page, receipt, total, limit, setLimit, setPage };
};