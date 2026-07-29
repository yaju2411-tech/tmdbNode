import React, { useState } from "react";
import { X, Check, Crown, Zap, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { usePaymentHook } from "../hooks/usePaymentHook";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "yearly">("quarterly");
  const { initiatePayment, loading } = usePaymentHook();

  if (!isOpen) return null;

  const plans = [
    {
      id: "monthly" as const,
      name: "Monthly Pass",
      price: 199,
      duration: "1 Month",
      badge: "Flexible",
      features: [
        "Unlimited access to ALL Movies & TV Shows",
        "Full HD 1080p Streaming",
        "Multiple Fast Servers",
        "Cancel Anytime",
      ],
    },
    {
      id: "quarterly" as const,
      name: "Quarterly VIP",
      price: 399,
      duration: "3 Months",
      badge: "Most Popular",
      popular: true,
      features: [
        "Unlimited access to ALL Movies & TV Shows",
        "Full HD 1080p Streaming",
        "Multiple Fast Servers",
        "Save 33% compared to Monthly",
        "Priority Customer Support",
      ],
    },
    {
      id: "yearly" as const,
      name: "Annual VIP",
      price: 1499,
      duration: "1 Year",
      badge: "Best Value",
      features: [
        "Unlimited access to ALL Movies & TV Shows",
        "Full HD 1080p & 4K Ultra HD Streaming",
        "Multiple Fast Servers",
        "Save 37% + 2 Months Free",
        "VIP Support & Early Access",
      ],
    },
  ];

  const handleSubscribe = async () => {
    const current = plans.find((p) => p.id === selectedPlan);
    if (!current) return;

    await initiatePayment({
      id: 0,
      title: current.name,
      contentType: "subscription",
      amount: current.price,
      plan: current.id,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-500 rounded-2xl border border-red-500/30">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Unlock Unlimited Access <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-xs text-zinc-400">
                Choose a plan to watch all movies and TV shows instantly
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-b from-red-950/30 to-zinc-900 border-red-600 shadow-xl shadow-red-950/40 ring-2 ring-red-600/50"
                    : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                {plan.badge && (
                  <span
                    className={`absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                      plan.popular
                        ? "bg-gradient-to-r from-red-600 to-amber-500 text-white"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 mb-4">{plan.duration} access</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-white">₹{plan.price}</span>
                    <span className="text-xs text-zinc-500 font-medium">/ {plan.duration}</span>
                  </div>

                  <ul className="space-y-2.5 mb-6 text-xs text-zinc-300">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                    isSelected
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-400 group-hover:text-white"
                  }`}
                >
                  {isSelected ? "Selected" : "Select Plan"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-zinc-900/80 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Secure 256-bit Encrypted Payment via Razorpay. Cancel anytime.</span>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-900/30 transition-all"
          >
            {loading ? "Processing..." : `Subscribe Now (₹${plans.find((p) => p.id === selectedPlan)?.price})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
