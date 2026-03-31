"use client";

import React, { useEffect, useState } from "react";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useStore } from "@/hooks/useStore";
import ActivePlan from "@/components/ActivePlan";
import BillingDetails from "@/components/BillingDetails";
import Payment from "@/components/flutterwave/Payment";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PLANS,
  BillingCycle,
  getPlanPrice,
  getAlternativeText,
} from "@/constants/Plans";
import type { Plan } from "@/constants/Plans";

interface ActiveSubscription {
  planId: string;
  isCancelled: boolean;
  endDate: string | null;
}

const Page = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const { onOpen, onClose } = useStore();
  const searchParams = useSearchParams();

  // Fetch current subscription status on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/user/subscription");
        if (!res.ok) throw new Error();
        const json = await res.json();
        setActiveSubscription({
          planId: json.plan.id,
          isCancelled: json.isCancelled,
          endDate: json.endDate,
        });
      } catch {
        // Non-blocking — fail silently, don't block the UI
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  // Handle redirect back from Flutterwave callback
  useEffect(() => {
    const payment = searchParams.get("payment");
    const plan = searchParams.get("plan");
    const reason = searchParams.get("reason");

    if (payment === "success" && plan) {
      const planName = PLANS.find((p) => p.id === plan)?.name ?? plan;
      toast.success(`You're now on the ${planName}! Welcome aboard.`);
      // Refresh subscription state
      setActiveSubscription({ planId: plan, isCancelled: false, endDate: null });
    } else if (payment === "failed") {
      const messages: Record<string, string> = {
        cancelled: "Payment was cancelled.",
        verification_failed: "We couldn't verify your payment. Please contact support.",
        charge_failed: "Your payment didn't go through. Please try again.",
        missing_metadata: "Something went wrong with your payment. Please contact support.",
        server_error: "A server error occurred. Please contact support.",
        invalid_callback: "Invalid payment response. Please contact support.",
      };
      toast.error(messages[reason ?? ""] ?? "Payment failed. Please try again.");
    }
  }, [searchParams]);

  const hasActivePaidSubscription =
    activeSubscription &&
    activeSubscription.planId !== "free" &&
    !activeSubscription.isCancelled;

  const handlePlanAction = (plan: Plan) => {
    if (plan.id === "free") {
      toast.info("You're on the Free plan by default.");
      return;
    }

    if (hasActivePaidSubscription) {
      toast.info(
        `You already have an active ${activeSubscription!.planId} plan. Please cancel your current plan before switching.`
      );
      return;
    }

    onOpen(
      "payment",
      <Payment
        planId={plan.id}
        billingCycle={billingCycle}
        onSuccess={async () => {
          // Primary update handled by /api/flutterwave/callback redirect
        }}
        onClose={onClose}
      />
    );
  };

  const getDisplayPrice = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return "$0";
    return `$${getPlanPrice(plan.monthlyPrice, billingCycle)}`;
  };

  const isCurrentPlan = (planId: string) =>
    activeSubscription?.planId === planId && !activeSubscription?.isCancelled;

  const getButtonLabel = (plan: Plan) => {
    if (plan.id === "free") return "Free Plan";
    if (isCurrentPlan(plan.id)) return "Current Plan";
    if (hasActivePaidSubscription) return "Manage Active Plan";
    return "Choose Plan";
  };

  return (
    <div className="p-4 pb-24 md:p-6 md:pb-6 overflow-y-auto min-h-[90vh] md:min-h-screen">
      <div className="w-full mx-auto">
        <div className="flex justify-between md:items-center items-start flex-col md:flex-row mb-12">
          <div className="flex items-center md:space-x-4 md:flex-row flex-col">
            <h1 className="text-4xl font-bold text-white mb-4">Subscription</h1>

            <div className="flex bg-slate-700/50 rounded-sm w-auto">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-8 py-2 rounded-sm text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-gray-900 shadow-lg"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-8 py-2 rounded-sm text-sm font-medium transition-all ${
                  billingCycle === "yearly"
                    ? "bg-white text-gray-900 shadow-lg"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="flex gap-4 md:flex-row mt-6">
            <button
              onClick={() => onOpen("modal", <ActivePlan />)}
              className="border border-white whitespace-nowrap rounded-sm py-2 px-4 md:px-6 font-medium cursor-pointer hover:bg-gray-50/10"
            >
              View Active Plan
            </button>
            <PrimaryBtn
              onClick={() => onOpen("modal", <BillingDetails />)}
              label="View Billing Details"
            />
          </div>
        </div>

        {/* Active subscription banner */}
        {hasActivePaidSubscription && (
          <div className="flex items-center gap-3 bg-[#8CBE41]/10 border border-[#8CBE41]/30 rounded-lg px-5 py-4 mb-8">
            <CheckCircle2 className="w-5 h-5 text-[#8CBE41] flex-shrink-0" />
            <p className="text-white text-sm">
              You have an active{" "}
              <span className="font-semibold capitalize">
                {activeSubscription!.planId}
              </span>{" "}
              plan. To switch plans, cancel your current plan first from{" "}
              <button
                onClick={() => onOpen("modal", <ActivePlan />)}
                className="text-[#8CBE41] underline underline-offset-2 hover:text-[#a8ef43] transition-colors"
              >
                View Active Plan
              </button>
              .
            </p>
          </div>
        )}

        <div className="flex items-start flex-wrap gap-8">
          {isLoadingSubscription ? (
            <div className="flex items-center justify-center w-full py-20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative bg-[#1E2E40] rounded-md w-full md:min-w-[380px] md:max-w-[500px] p-8",
                  "border-l-2 transition-all duration-300",
                  isCurrentPlan(plan.id)
                    ? "border-[#8CBE41]"
                    : "border-[#8CBE4160] hover:border-[#8CBE41]"
                )}
              >
                {/* Current plan badge */}
                {isCurrentPlan(plan.id) && (
                  <div className="absolute top-4 right-4 bg-[#8CBE41] text-black text-xs font-bold px-3 py-1 rounded-full">
                    Active
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline mb-1">
                    <span className="text-4xl font-bold text-white">
                      {getDisplayPrice(plan)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-slate-400 ml-1">
                        /{billingCycle === "yearly" ? "yr" : "mo"}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm mb-4">
                    {getAlternativeText(plan, billingCycle)}
                  </p>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 text-sm leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <PrimaryBtn
                    onClick={() => handlePlanAction(plan)}
                    label={getButtonLabel(plan)}
                    disabled={
                      plan.id === "free" ||
                      isCurrentPlan(plan.id) ||
                      (!!hasActivePaidSubscription && !isCurrentPlan(plan.id))
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
