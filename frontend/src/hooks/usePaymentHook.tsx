import { useQueryClient } from "@tanstack/react-query";
import { useReducer } from "react";
import { api } from "../servicies/api-client";
import { loadRazorpay } from "../utils/razorpay";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type State = {
  success: boolean;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "START" }
  | { type: "SUCCESS" }
  | { type: "FAIL"; payload: string }
  | { type: "RESET" };

const initialState: State = {
  loading: false,
  success: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { loading: true, success: false, error: null };

    case "SUCCESS":
      return { loading: false, success: true, error: null };

    case "FAIL":
      return { loading: false, success: false, error: action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export const usePayment = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // CREATE ORDER via Backend
  const createOrder = async (
    id: number,
    title: string,
    posterPath: string,
    contentType: "movie" | "tv",
    amount: number
  ) => {
    const res = await api.post("/payment/create-order", {
      contentId: id,
      title,
      poster: posterPath,
      contentType,
      amount
    });
    return res.data.order;
  };

  // VERIFY PAYMENT via Backend
  const verifyPayment = async (
    response: any,
    id: number,
    contentType: "movie" | "tv" | "subscription",
    title: string
  ) => {
    try {
      const res = await api.post("/payment/verify", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      const data = res.data;
      if (!data.success) {
        dispatch({
          type: "FAIL",
          payload: "Payment verification failed",
        });
        toast.error("Payment Verification Failed", {
          description: `If money was deducted, please submit a ticket.\nContent Name: ${title}\nContent ID: ${id}\nOrder ID: ${response.razorpay_order_id}`,
          action: {
            label: "Copy ID",
            onClick: () => navigator.clipboard.writeText(String(id)),
          },
          duration: Number.POSITIVE_INFINITY,
          closeButton: true,
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["purchase-status"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["auth-me"],
      });
      dispatch({ type: "SUCCESS" });

      toast.success("🎉 VIP Subscription Activated!", {
        description: "Unlimited access granted across all Movies & TV Shows!",
      });

      if (data.receiptNumber) {
        navigate(`/receipt/${data.receiptNumber}`);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      dispatch({
        type: "FAIL",
        payload: err.response?.data?.message || err.message || "Verification failed",
      });
      toast.error("Payment Verification Failed", {
        description: `If money was deducted, please submit a ticket.\nContent Name: ${title}\nOrder ID: ${response.razorpay_order_id}`,
        action: {
          label: "Copy ID",
          onClick: () => navigator.clipboard.writeText(String(response.razorpay_order_id)),
        },
        duration: Number.POSITIVE_INFINITY,
        closeButton: true,
      });
      await queryClient.invalidateQueries({
        queryKey: ["purchase-status"],
      });
    }
  };

  // MAIN PAYMENT flow
  const startPayment = async (
    id: number,
    title: string,
    amount: number,
    posterPath: string = "",
    contentType: "movie" | "tv" | "subscription" = "subscription",
    plan: "monthly" | "quarterly" | "yearly" = "monthly"
  ) => {
    try {
      dispatch({ type: "START" });

      // LOAD SDK
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        dispatch({
          type: "FAIL",
          payload: "Razorpay SDK failed to load",
        });
        return;
      }

      // CREATE ORDER
      const res = await api.post("/payment/create-order", {
        contentId: id || 0,
        title,
        poster: posterPath,
        contentType,
        amount,
        plan,
      });

      const order = res.data.order;
      if (!order?.id) {
        dispatch({
          type: "FAIL",
          payload: "Order creation failed",
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["purchase-status", String(id), String(contentType)],
      });

      let isPaymentSuccessful = false;

      const options = {
        key: (order as any).key || res.data.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TJB5GvLQsk8Nw8",
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "TMDB VIP Subscription",
        description: title,

        handler: function (response: any) {
          isPaymentSuccessful = true;
          verifyPayment(response, id, contentType, title);
        },
        modal: {
          ondismiss: async () => {
            if (isPaymentSuccessful) return;
            dispatch({
              type: "FAIL",
              payload: "Payment process closed",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      dispatch({
        type: "FAIL",
        payload: err.response?.data?.message || err.message || "Something went wrong",
      });
    }
  };

  const initiatePayment = async (options: {
    id?: number;
    title: string;
    contentType?: "movie" | "tv" | "subscription";
    amount: number;
    plan?: "monthly" | "quarterly" | "yearly";
    posterPath?: string;
  }) => {
    return startPayment(
      options.id || 0,
      options.title,
      options.amount,
      options.posterPath || "",
      options.contentType || "subscription",
      options.plan || "monthly"
    );
  };

  return {
    state,
    startPayment,
    initiatePayment,
    loading: state.loading,
    success: state.success,
    error: state.error,
  };
};

export const usePaymentHook = usePayment;
