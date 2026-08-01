import React, { useState, useEffect } from "react";
import { X, Check, Crown, Zap, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { usePaymentHook } from "../../hooks/usePaymentHook";
import { useOutletContext } from "react-router-dom";
import useSignUpHook from "../../hooks/useSignUpHook";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "yearly">("quarterly");
  const { initiatePayment, loading } = usePaymentHook();
  const outletContext = useOutletContext<any>() || {};
  const { userData } = useSignUpHook();

  const user = outletContext.user || userData;
  const subscription = user?.subscription || {};
  const isVipActive =
    subscription.status === "active" &&
    subscription.expiresAt &&
    new Date(subscription.expiresAt) > new Date();

  useEffect(() => {
    if (subscription.plan && ["monthly", "quarterly", "yearly"].includes(subscription.plan)) {
      setSelectedPlan(subscription.plan);
    }
  }, [subscription.plan]);

  const formattedExpiry = subscription.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

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
    if (isVipActive) return;
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-zinc-800 bg-gradient-to-r from-red-50 dark:from-red-950/40 via-gray-50 dark:via-zinc-900 to-white dark:to-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 text-red-600 dark:text-red-500 rounded-2xl border border-red-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Unlock Unlimited Access <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Choose a plan to watch all movies and TV shows instantly
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* ACTIVE VIP BANNER */}
        {isVipActive && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-500/30 px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                You currently have an active <strong>{subscription.plan?.toUpperCase()} VIP PASS</strong> valid until {formattedExpiry}.
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold uppercase">
              ACTIVE
            </span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-zinc-950">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => {
                  if (!isVipActive) setSelectedPlan(plan.id);
                }}
                className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isVipActive ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-white dark:bg-gradient-to-b dark:from-red-950/30 dark:to-zinc-900 border-red-600 shadow-xl shadow-red-600/10 dark:shadow-red-950/40 ring-2 ring-red-600/50"
                    : "bg-white dark:bg-zinc-900/60 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-100/50 dark:hover:bg-zinc-900"
                }`}
              >
                {plan.badge && (
                  <span
                    className={`absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                      plan.popular
                        ? "bg-gradient-to-r from-red-600 to-amber-500 text-white"
                        : "bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700"
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">{plan.duration} access</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">₹{plan.price}</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-500 font-medium">/ {plan.duration}</span>
                  </div>

                  <ul className="space-y-2.5 mb-6 text-xs text-gray-700 dark:text-zinc-300">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                    isSelected
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  }`}
                >
                  {isSelected ? "Selected" : "Select Plan"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-white dark:bg-zinc-900/80 border-t border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Secure 256-bit Encrypted Payment via Razorpay. Cancel anytime.</span>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading || isVipActive}
            className={`w-full sm:w-auto px-8 py-3 font-bold text-sm rounded-xl shadow-lg transition-all ${
              isVipActive
                ? "bg-zinc-800 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white shadow-red-900/30"
            }`}
          >
            {loading
              ? "Processing..."
              : isVipActive
              ? "✨ VIP Pass Active"
              : `Subscribe Now (₹${plans.find((p) => p.id === selectedPlan)?.price})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
