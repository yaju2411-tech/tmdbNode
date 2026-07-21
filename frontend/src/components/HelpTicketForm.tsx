import React, { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { api } from "../servicies/api-client";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "cant_login", label: "Can't Login" },
  { id: "otp_issues", label: "OTP Not Received / Expired" },
  { id: "google_signin", label: "Google Sign-in Issue" },
  { id: "payment_deducted", label: "Payment Deducted but Content Locked" },
  { id: "content_not_showing", label: "Purchased Content Not Showing" },
  { id: "account_locked", label: "Account Locked" },
  { id: "email_not_verified", label: "Email Not Verified" },
  { id: "password_reset", label: "Password Reset Issue" },
  { id: "other", label: "Other Issue" },
];

export const HelpTicketForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    description: "",
    orderId: "",
    paymentId: "",
    receiptId: "",
    contentName: "",
    contentId: "",
    contentType: "movie",
  });
  const [proofImages, setProofImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (formData.description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }

    if (formData.category === "payment_deducted" || formData.category === "content_not_showing") {
      if (!formData.contentName.trim()) {
        toast.error("Content Name is required for this issue type");
        return;
      }
      if (!formData.contentId.trim()) {
        toast.error("TMDB ID is required for this issue type");
        return;
      }
      if (proofImages.length === 0) {
        toast.error("Please upload at least one screenshot as proof");
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
        proofImages.forEach(file => {
          data.append("proofImages", file);
        });
      }

      const res = await api.post("/help/ticket", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setTicketId(res.data.ticketId);
        setSubmitted(true);
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to submit ticket.";
      const errDetail = error.response?.data?.error || "";
      toast.error(`${errMsg} ${errDetail}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center h-full min-h-[500px]">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3 dark:text-white">Ticket Submitted Successfully!</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
          We've received your request and sent a confirmation to <strong className="text-gray-900 dark:text-gray-200">{formData.email}</strong>. Our support team will get back to you shortly.
        </p>
        <div className="bg-gray-50 dark:bg-zinc-950 px-6 py-4 rounded-xl border border-gray-200 dark:border-zinc-800">
          <span className="text-sm text-gray-500 block mb-1">Your Ticket ID</span>
          <span className="font-mono text-lg font-semibold text-[#E50914]">{ticketId}</span>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({ 
              name: "", email: "", category: "", description: "",
              orderId: "", paymentId: "", receiptId: "", contentName: "", contentId: "", contentType: "movie"
            });
            setProofImages([]);
          }}
          className="mt-8 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Submit another ticket
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 overflow-y-auto max-h-[600px]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Submit a Ticket</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Fill out the form below and we'll get back to you as soon as possible.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-[#E50914] focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-[#E50914] focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">What do you need help with?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${formData.category === cat.id
                    ? "border-[#E50914] bg-red-50 dark:bg-red-950/20"
                    : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                  }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  className="hidden"
                  onChange={() => setFormData({ ...formData, category: cat.id })}
                />
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${formData.category === cat.id ? "border-[#E50914]" : "border-gray-400"
                  }`}>
                  {formData.category === cat.id && <div className="w-2 h-2 rounded-full bg-[#E50914]" />}
                </div>
                <span className={`text-sm ${formData.category === cat.id ? "text-[#E50914] font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {(formData.category === "payment_deducted" || formData.category === "content_not_showing") && (
          <div className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Payment Details (Optional but Recommended)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Content Name (Movie/TV)</label>
                <input
                  type="text"
                  value={formData.contentName}
                  onChange={(e) => setFormData({ ...formData, contentName: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-[#E50914] outline-none text-sm dark:text-white"
                  placeholder="e.g. Inception"
                />
              </div>
              <div className="space-y-1.5 flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">TMDB ID</label>
                  <input
                    type="text"
                    value={formData.contentId}
                    onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-[#E50914] outline-none text-sm dark:text-white"
                    placeholder="e.g. 27205"
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    value={formData.contentType}
                    onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-[#E50914] outline-none text-sm dark:text-white"
                  >
                    <option value="movie">Movie</option>
                    <option value="tv">TV</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Payment ID</label>
                <input
                  type="text"
                  value={formData.paymentId}
                  onChange={(e) => setFormData({ ...formData, paymentId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-[#E50914] outline-none text-sm dark:text-white"
                  placeholder="pay_xxxxxxxx"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Order ID</label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-[#E50914] outline-none text-sm dark:text-white"
                  placeholder="order_xxxxxxxx"
                />
              </div>
            </div>
            <div className="space-y-1.5 mt-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Payment Screenshots (Proof) - Up to 5</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    if (files.length > 5) {
                      toast.error("You can only upload up to 5 images");
                      e.target.value = "";
                      return;
                    }
                    setProofImages(files);
                  }
                }}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-[#E50914] outline-none text-sm dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-950/30 dark:file:text-red-400"
              />
              {proofImages.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{proofImages.length} file(s) selected</p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-[#E50914] focus:border-transparent outline-none transition-all dark:text-white resize-none"
            placeholder="Please provide as much detail as possible about your issue..."
          />
          <p className="text-xs text-gray-500">Minimum 20 characters.</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-[#E50914] hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Send size={18} />
              Submit Ticket
            </>
          )}
        </button>
      </form>
    </div>
  );
};
