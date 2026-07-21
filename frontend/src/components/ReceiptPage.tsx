import { useParams } from "react-router-dom";
import { useReceipt } from "../hooks/useReceiptFetchHook";
import { PDFViewer } from "@react-pdf/renderer";
import { ReceiptCard } from "./ReceiptCard";

export const ReceiptPage = () => {
  const { paymentId } = useParams();
  const isValidReceipt =
    /^REC-\d{8}-\d{4}$/.test(paymentId || "");

  if (!isValidReceipt) {return <div>Receipt is not valid</div>;}
  const { receipt, loading } = useReceipt(paymentId!);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!receipt) {return <div>Receipt not found</div>;}

  return (
    <div className="h-screen w-screen relative">
      <PDFViewer width="100%" height="100%">
        <ReceiptCard receipt={receipt} />
      </PDFViewer>
    </div>
  );
};