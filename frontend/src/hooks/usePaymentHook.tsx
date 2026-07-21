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
    contentType: "movie" | "tv",
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
        await api.post("/payment/update-status", {
          orderId: response.razorpay_order_id,
          status: "failed",
        });
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
        queryKey: ["purchase-status", String(id), contentType],
      });
      dispatch({ type: "SUCCESS" });

      const toastId = toast.loading("Navigate to Receipt Page", {
        position: "top-center",
      });
      setTimeout(() => {
        navigate(`/receipt/${data.receiptNumber}`);
        toast.dismiss(toastId);
      }, 6000);
    } catch (err: any) {
      dispatch({
        type: "FAIL",
        payload: err.response?.data?.message || err.message || "Verification failed",
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
      try {
        await api.post("/payment/update-status", {
          orderId: response.razorpay_order_id,
          status: "failed",
        });
      } catch (updateErr) {
        console.error("Failed to update status on error:", updateErr);
      }
      await queryClient.invalidateQueries({
        queryKey: ["purchase-status", String(id), contentType],
      });
    }
  };

  // MAIN PAYMENT flow
  const startPayment = async (
    id: number,
    title: string,
    amount: number,
    posterPath: string,
    contentType: "movie" | "tv"
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

      // Check if already purchased or pending via backend `/check` endpoint
      const checkRes = await api.get("/payment/check", {
        params: {
          contentId: id,
          contentType,
        },
      });

      const existingStatus = checkRes.data.status;
      if (existingStatus === "success") {
        dispatch({ type: "RESET" });
        return;
      }
      if (existingStatus === "pending") {
        dispatch({
          type: "FAIL",
          payload: "Payment already in progress",
        });
        return;
      }

      // CREATE ORDER
      const order = await createOrder(id, title, posterPath, contentType, amount);
      if (!order?.id) {
        dispatch({
          type: "FAIL",
          payload: "Order creation failed",
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["purchase-status", String(id), contentType],
      });

      const options = {
        key: "rzp_test_SeXOMHGaiWMMQd",
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "TMDB",
        description: title,

        handler: async function (response: any) {
          await verifyPayment(response, id, contentType, title);
        },
        modal: {
          ondismiss: async () => {
            dispatch({
              type: "FAIL",
              payload: "Payment cancelled",
            });
            toast.error("Payment Cancelled", {
              description: `If your money was deducted but content is locked, submit a ticket.\nContent Name: ${title}\nContent ID: ${id}\nOrder ID: ${order.id}`,
              action: {
                label: "Copy ID",
                onClick: () => navigator.clipboard.writeText(String(id)),
              },
              duration: Number.POSITIVE_INFINITY,
              closeButton: true,
            });
            try {
              await api.post("/payment/update-status", {
                orderId: order.id,
                status: "failed",
              });
            } catch (cancelErr) {
              console.error("Failed to cancel payment status:", cancelErr);
            }
            await queryClient.invalidateQueries({
              queryKey: ["purchase-status", String(id), contentType],
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

  return {
    state,
    startPayment,
  };
};
