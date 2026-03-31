"use client";

import React, { useEffect, useState } from "react";
import { Check, ChevronLeft, AlertTriangle, Loader2 } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubscriptionData {
  plan: {
    id: string;
    name: string;
    description: string;
    features: string[];
    monthlyPrice: number;
    amountPaid: number;
  };
  billingCycle: "monthly" | "yearly";
  startDate: string | null;
  endDate: string | null;
  cancelledAt: string | null;
  isCancelled: boolean;
  usage: {
    charactersUsed: number;
    monthlyLimit: number | null;
    isUnlimited: boolean;
  };
}

const ActivePlan: React.FC = () => {
  const { onClose } = useStore();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/user/subscription");
        if (!res.ok) throw new Error("Failed to fetch subscription");
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error("Failed to load subscription details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleCancelPlan = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/user/subscription", { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Failed to cancel subscription.");
        return;
      }

      toast.success(json.message);
      setData((prev) =>
        prev ? { ...prev, isCancelled: true, cancelledAt: new Date().toISOString() } : prev
      );
      setShowCancelConfirm(false);
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const usagePercent =
    data?.usage.monthlyLimit
      ? Math.min(100, (data.usage.charactersUsed / data.usage.monthlyLimit) * 100)
      : 0;

  return (
    <div className="w-full h-full p-4">
      <button
        onClick={onClose}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <h2 className="text-2xl font-medium my-4">Active Plan</h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-[55vh]">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center h-[55vh]">
          <p className="text-slate-400">Failed to load subscription details.</p>
        </div>
      ) : (
        <div className="bg-slate-800/80 backdrop-blur-sm h-[55vh] overflow-auto rounded-2xl border border-green-400/50 shadow-xl shadow-green-500/10 p-8 custom-scrollbar">

          {/* Plan header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">{data.plan.name}</h2>
              <p className="text-slate-400 mt-1 capitalize">{data.billingCycle} billing</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-white">
                ${data.plan.amountPaid}
              </span>
              <p className="text-slate-400 text-sm">
                /{data.billingCycle === "yearly" ? "yr" : "mo"}
              </p>
            </div>
          </div>

          {/* Cancelled banner */}
          {data.isCancelled && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-sm">
                Your subscription is cancelled. You have access until{" "}
                <span className="font-semibold">{formatDate(data.endDate)}</span>.
              </p>
            </div>
          )}

          <div className="h-px bg-slate-600 mb-6" />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Start date</p>
              <p className="text-white font-semibold">{formatDate(data.startDate)}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">
                {data.isCancelled ? "Access until" : "Renewal date"}
              </p>
              <p className="text-white font-semibold">{formatDate(data.endDate)}</p>
            </div>
          </div>

          <div className="h-px bg-slate-600 mb-6" />

          {/* Usage */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-400 text-sm">Characters used this period</p>
              <p className="text-white text-sm font-semibold">
                {data.usage.isUnlimited
                  ? `${data.usage.charactersUsed.toLocaleString()} / Unlimited`
                  : `${data.usage.charactersUsed.toLocaleString()} / ${data.usage.monthlyLimit?.toLocaleString()}`}
              </p>
            </div>
            {!data.usage.isUnlimited && (
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    usagePercent >= 90 ? "bg-red-500" : "bg-[#8CBE41]"
                  )}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
          </div>

          <div className="h-px bg-slate-600 mb-6" />

          {/* Features */}
          <div className="space-y-4 mb-8">
            {data.plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          {!data.isCancelled && data.plan.id !== "free" && (
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-6 py-3 bg-transparent border-2 border-slate-600 text-white font-semibold rounded-lg hover:border-red-500/60 hover:bg-red-500/10 transition-all text-sm"
              >
                Cancel Plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cancellation confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <h3 className="text-xl font-bold text-white">Cancel subscription?</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-2">
              Your plan will remain active until the end of your current billing period on{" "}
              <span className="text-white font-semibold">{formatDate(data?.endDate ?? null)}</span>.
            </p>
            <p className="text-slate-400 text-sm mb-8">
              After that, your account will revert to the Free plan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Keep my plan
              </button>
              <button
                onClick={handleCancelPlan}
                disabled={isCancelling}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivePlan;
