import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Send, X, ShieldAlert, UploadCloud, CreditCard, Sparkles } from "lucide-react";
import { api } from "../servicies/api-client";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "cant_login", label: "Can't Login to Account" },
  { id: "otp_issues", label: "OTP Not Received / Expired" },
  { id: "google_signin", label: "Google Sign-in Issue" },
  { id: "payment_deducted", label: "Payment Deducted but VIP Locked" },
  { id: "content_not_showing", label: "VIP Pass Active but Stream Issues" },
  { id: "account_locked", label: "Account Locked" },
  { id: "email_not_verified", label: "Email Not Verified" },
  { id: "password_reset", label: "Password Reset Issue" },
  { id: "other", label: "Other General Query" },
];

export const HelpTicketForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "payment_deducted",
    description: "",
    plan: "quarterly",
    amount: "399",
    orderId: "",
    paymentId: "",
    receiptId: "",
  });
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  useEffect(() => {
    const urls = proofImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [proofImages]);

  const handlePlanChange = (planValue: string) => {
    let amt = "399";
    if (planValue === "monthly") amt = "199";
    if (planValue === "yearly") amt = "1499";
    setFormData((prev) => ({ ...prev, plan: planValue, amount: amt }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (formData.description.trim().length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }

    const isPaymentIssue =
      formData.category === "payment_deducted" ||
      formData.category === "content_not_showing";

    if (isPaymentIssue) {
      if (!formData.plan) {
        toast.error("Please select your Subscription Plan");
        return;
      }
      if (!formData.amount || Number(formData.amount) <= 0) {
        toast.error("Please enter a valid Plan Amount");
        return;
      }
      if (proofImages.length === 0) {
        toast.error("Please upload at least one payment screenshot as proof");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (proofImages.length > 0) {
        proofImages.forEach((file) => {
          data.append("proofImages", file);
        });
      }

      const res = await api.post("/help/ticket", data);
      if (res.data.success) {
        setTicketId(res.data.ticketId);
        setSubmitted(true);
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to submit ticket.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center h-full min-h-[500px] animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-xl">
          <CheckCircle2 size={44} />
        </div>
        <h2 className="text-3xl font-extrabold mb-3 dark:text-white">Ticket Submitted!</h2>
        <p className="text-zinc-400 max-w-md mx-auto mb-6 text-sm">
          We have received your support request and sent a confirmation email to <strong className="text-white">{formData.email}</strong>. Our billing support team will review your payment proof shortly.
        </p>
        <div className="bg-zinc-950 px-6 py-4 rounded-2xl border border-zinc-800 shadow-lg">
          <span className="text-xs text-zinc-500 block mb-1 uppercase tracking-wider font-semibold">Your Support Ticket ID</span>
          <span className="font-mono text-xl font-bold text-red-500">{ticketId}</span>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: "", email: "", category: "payment_deducted", description: "",
              plan: "quarterly", amount: "399", orderId: "", paymentId: "", receiptId: ""
            });
            setProofImages([]);
          }}
          className="mt-8 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors underline"
        >
          Submit another ticket
        </button>
      </div>
    );
  }

  const isPaymentIssue =
    formData.category === "payment_deducted" ||
    formData.category === "content_not_showing";

  return (
    <div className="p-6 sm:p-10 overflow-y-auto max-h-[700px] scrollbar-hide space-y-8">
      <div className="border-b border-zinc-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldAlert className="w-3.5 h-3.5" /> Support Helpdesk
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold dark:text-white">Submit a Billing & Support Ticket</h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Have an issue with your VIP subscription or payment? Submit your details below for priority support.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-sm text-gray-900 dark:text-white transition-all"
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-sm text-gray-900 dark:text-white transition-all"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        {/* Category Radio Grid */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">Select Issue Type *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all ${
                  formData.category === cat.id
                    ? "border-red-600 bg-red-50 dark:bg-gradient-to-r dark:from-red-950/40 dark:to-zinc-900 shadow-sm ring-1 ring-red-600/40"
                    : "border-gray-200 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-950/60 hover:bg-gray-100 dark:hover:bg-zinc-900"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  className="hidden"
                  onChange={() => setFormData({ ...formData, category: cat.id })}
                />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 shrink-0 ${
                  formData.category === cat.id ? "border-red-500 bg-red-600/20" : "border-gray-400 dark:border-zinc-700"
                }`}>
                  {formData.category === cat.id && <div className="w-2 h-2 rounded-full bg-red-600" />}
                </div>
                <span className={`text-xs sm:text-sm ${
                  formData.category === cat.id ? "text-red-700 dark:text-white font-bold" : "text-gray-700 dark:text-zinc-400"
                }`}>
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Subscription Payment Details Section */}
        {isPaymentIssue && (
          <div className="p-6 bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-5 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800/80 pb-3">
              <CreditCard className="w-4 h-4 text-red-600 dark:text-red-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Subscription & Payment Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Plan Required */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">Subscription Plan *</label>
                <select
                  value={formData.plan}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-red-600 outline-none text-sm text-gray-900 dark:text-white font-semibold"
                >
                  <option value="monthly">Monthly Pass (₹199)</option>
                  <option value="quarterly">Quarterly VIP (₹399)</option>
                  <option value="yearly">Annual VIP (₹1499)</option>
                </select>
              </div>

              {/* Amount Required */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">Amount Paid (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-red-600 outline-none text-sm text-gray-900 dark:text-white font-semibold"
                  placeholder="e.g. 399"
                />
              </div>

              {/* Optional IDs */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400">Order ID (Optional)</label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none text-xs text-gray-900 dark:text-white"
                  placeholder="order_xxxxxxxx"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400">Payment ID (Optional)</label>
                <input
                  type="text"
                  value={formData.paymentId}
                  onChange={(e) => setFormData({ ...formData, paymentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none text-xs text-gray-900 dark:text-white"
                  placeholder="pay_xxxxxxxx"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400">Receipt ID (Optional)</label>
                <input
                  type="text"
                  value={formData.receiptId}
                  onChange={(e) => setFormData({ ...formData, receiptId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none text-xs text-gray-900 dark:text-white"
                  placeholder="REC-2026-XXXXX"
                />
              </div>
            </div>

            {/* Upload Proof Images Required */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Payment Screenshot Proof (Required *)</span>
                <span className="text-[10px] text-gray-500 dark:text-zinc-500 font-normal">Up to 5 images</span>
              </label>

              <div className="relative border-2 border-dashed border-gray-300 dark:border-zinc-800 hover:border-red-500/50 rounded-2xl p-6 text-center transition-all bg-white dark:bg-zinc-900/40">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files);
                      setProofImages((prev) => {
                        const combined = [...prev, ...newFiles];
                        if (combined.length > 5) {
                          toast.error("You can only upload up to 5 images");
                          return prev;
                        }
                        return combined;
                      });
                      e.target.value = "";
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-semibold">
                  Click or drag payment screenshots here to upload
                </p>
                <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-1">PNG, JPG, JPEG formats allowed</p>
              </div>

              {proofImages.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-emerald-400 font-semibold">{proofImages.length} image proof(s) attached</p>
                  <div className="flex flex-wrap gap-3">
                    {proofImages.map((_, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border border-zinc-800 w-20 h-20 shadow-md">
                        <img
                          src={previewUrls[index]}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProofImages((prev) => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Issue Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Describe Your Issue *</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-sm dark:text-white resize-none transition-all"
            placeholder="Please provide details about your subscription issue..."
          />
          <p className="text-[10px] text-zinc-500">Minimum 20 characters.</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Send size={18} />
              Submit Support Ticket
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default HelpTicketForm;
