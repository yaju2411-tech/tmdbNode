import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { api } from "../servicies/api-client";
import { toast } from "sonner";
import { AlertCircle, Loader2, Send, Upload, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string | number;
  contentTitle: string;
  contentType: "movie" | "tv";
  orderId?: string;
  paymentId?: string;
  user?: any;
}

export const ReportPendingModal = ({
  open,
  onOpenChange,
  contentId,
  contentTitle,
  contentType,
  orderId,
  paymentId,
  user,
}: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urls = proofImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [proofImages]);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
    }
    setDescription(
      `I am experiencing a payment issue for "${contentTitle}" (ID: ${contentId}). Please review my purchase and payment deduction proof.`
    );
  }, [user, contentTitle, contentId, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    if (proofImages.length >= 5) {
      toast.error("Maximum 5 screenshots allowed");
      return;
    }

    if (proofImages.length + selected.length > 5) {
      toast.error("You can upload a maximum of 5 images in total");
      const allowedCount = 5 - proofImages.length;
      setProofImages((prev) => [...prev, ...selected.slice(0, allowedCount)]);
    } else {
      setProofImages((prev) => [...prev, ...selected]);
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setProofImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (description.trim().length < 20) {
      toast.error("Please describe your issue in at least 20 characters");
      return;
    }
    if (proofImages.length === 0) {
      toast.error("Please attach at least one screenshot (bank payment deduction or email receipt proof)");
      return;
    }
    if (proofImages.length > 5) {
      toast.error("Maximum 5 screenshots allowed");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("category", "payment_deducted");
      formData.append("description", description.trim());
      formData.append("contentName", contentTitle);
      formData.append("contentId", String(contentId));
      formData.append("contentType", contentType);
      if (orderId) formData.append("orderId", orderId);
      if (paymentId) formData.append("paymentId", paymentId);

      if (proofImages.length > 0) {
        proofImages.forEach((file) => {
          formData.append("proofImages", file);
        });
      }

      const res = await api.post("/help/ticket", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success(`Report submitted successfully! Ticket ID: ${res.data.ticketId}`);
        onOpenChange(false);
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to submit report";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-950 text-white border-zinc-800 shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-500">
            <AlertCircle size={22} /> Report Payment Issue
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Submit a support report with payment proof for <strong className="text-white">{contentTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Your Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="bg-zinc-900 border-zinc-800 text-white text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Your Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="bg-zinc-900 border-zinc-800 text-white text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
            <div>
              <span className="text-xs text-zinc-400 block">Content Title</span>
              <span className="text-sm font-semibold text-white">{contentTitle}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 block">TMDB ID</span>
              <span className="text-sm font-mono text-white">{contentId} ({contentType})</span>
            </div>
            {orderId && (
              <div>
                <span className="text-xs text-zinc-400 block">Order ID</span>
                <span className="text-xs font-mono text-amber-400">{orderId}</span>
              </div>
            )}
            {paymentId && (
              <div>
                <span className="text-xs text-zinc-400 block">Payment ID</span>
                <span className="text-xs font-mono text-emerald-400">{paymentId}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Issue Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-zinc-900 border-zinc-800 text-white text-sm"
              placeholder="Describe your payment issue..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Proof Screenshots (Bank Deduction / Receipt) <span className="text-red-500">*</span> <span className="text-[11px] text-zinc-400 font-normal">(Max 5)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className={`flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-300 transition-colors ${proofImages.length >= 5 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-800"}`}>
                <Upload size={14} /> Attach Screenshots
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={proofImages.length >= 5}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-zinc-400">
                {proofImages.length} / 5 file(s) selected
              </span>
            </div>

            {/* Thumbnail Image Previews with Remove Button */}
            {proofImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-3">
                {proofImages.map((file, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 aspect-square shadow-sm">
                      <img
                        src={previewUrls[idx]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 hover:bg-red-700 transition-colors shadow-md"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 px-1 py-0.5 text-[10px] text-zinc-300 truncate text-center">
                        {file.name}
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>

          {/* User Informative Note */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
            <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-400 block mb-0.5">Important Note:</strong>
              Please check your registered email for payment confirmation details. If your payment was deducted from your account/bank, please attach screenshots of the <strong>email receipt</strong> and <strong>bank/UPI payment deduction proof</strong> above so support can verify and grant access immediately.
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send size={16} /> Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
