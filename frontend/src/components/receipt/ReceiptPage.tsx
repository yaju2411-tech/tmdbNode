import { useParams, Link } from "react-router-dom";
import { useReceipt } from "../../hooks/useReceiptFetchHook";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { ReceiptCard } from "./ReceiptCard";
import { ArrowLeft, Download, RefreshCw, FileText } from "lucide-react";
import { Button } from "../ui/button";

export const ReceiptPage = () => {
  const { paymentId } = useParams();
  const isValidReceipt = Boolean(paymentId && paymentId.trim().length >= 3);

  if (!isValidReceipt) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-4">
        <h2 className="text-xl font-bold text-red-500 mb-2">Invalid Receipt Parameter</h2>
        <p className="text-zinc-400 text-sm mb-4">Please provide a valid Receipt Number, Payment ID, or Order ID.</p>
        <Link to="/">
          <Button variant="outline" className="border-zinc-800 text-white">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const { receipt, loading } = useReceipt(paymentId!);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-white space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#E50914]" />
        <p className="text-sm font-medium text-zinc-400 animate-pulse">Generating PDF Receipt...</p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-4 space-y-3">
        <FileText className="w-12 h-12 text-zinc-600" />
        <h2 className="text-xl font-bold text-white">Receipt Not Found</h2>
        <p className="text-zinc-400 text-sm">No receipt details found for verification ID: <span className="font-mono text-emerald-400">{paymentId}</span></p>
        <Link to="/">
          <Button variant="outline" className="border-zinc-800 text-white mt-2">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-zinc-950 flex flex-col">
      {/* Top Header Control Bar */}
      <div className="h-14 bg-zinc-900 border-b border-zinc-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Receipt: <span className="font-mono text-emerald-400">{receipt.receipt_number || paymentId}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <PDFDownloadLink
            document={<ReceiptCard receipt={receipt} />}
            fileName={`TMDB_Receipt_${receipt.receipt_number || "Document"}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <Button size="sm" className="bg-[#E50914] hover:bg-red-700 text-white font-semibold gap-2">
                <Download className="w-4 h-4" />
                {pdfLoading ? "Preparing PDF..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* PDF React Viewer Area */}
      <div className="flex-1 w-full h-full overflow-hidden bg-zinc-900">
        <PDFViewer width="100%" height="100%" className="border-none">
          <ReceiptCard receipt={receipt} />
        </PDFViewer>
      </div>
    </div>
  );
};