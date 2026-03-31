"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, Loader2, Receipt, CheckCircle2, XCircle } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  txRef: string;
  planId: string;
  billingCycle: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface SubscriptionData {
  plan: {
    id: string;
    name: string;
    amountPaid: number;
  };
  billingCycle: "monthly" | "yearly";
  endDate: string | null;
  isCancelled: boolean;
  payments: Payment[];
}

const BillingDetails: React.FC = () => {
  const { onClose } = useStore();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await fetch("/api/user/subscription");
        if (!res.ok) throw new Error("Failed to fetch billing details");
        const json = await res.json();
        setData(json);
      } catch {
        toast.error("Failed to load billing details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBilling();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) =>
    `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const planLabel = (planId: string) =>
    planId.charAt(0).toUpperCase() + planId.slice(1) + " Plan";

  return (
    <div className="w-full h-full p-4">
      <button
        onClick={onClose}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <h2 className="text-2xl font-medium my-4">Billing Details</h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-[55vh]">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center h-[55vh]">
          <p className="text-slate-400">Failed to load billing details.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Current plan summary */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border-l-2 border-[#8CBE41] p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Current plan</p>
                <h3 className="text-white text-xl font-bold">{data.plan.name}</h3>
                <p className="text-slate-400 text-sm capitalize mt-1">
                  {data.billingCycle} billing
                  {data.isCancelled && (
                    <span className="ml-2 text-amber-400">(Cancelled)</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-1">Amount</p>
                <p className="text-white text-2xl font-bold">
                  ${data.plan.amountPaid}
                  <span className="text-slate-400 text-sm font-normal ml-1">
                    /{data.billingCycle === "yearly" ? "yr" : "mo"}
                  </span>
                </p>
              </div>
            </div>

            <div className="h-px bg-slate-600 mb-4" />

            <div className="flex justify-between items-center">
              <p className="text-slate-400 text-sm">
                {data.isCancelled ? "Access until" : "Next billing date"}
              </p>
              <p className="text-white font-semibold text-sm">
                {data.plan.id === "free" ? "No billing" : formatDate(data.endDate)}
              </p>
            </div>
          </div>

          {/* Payment history */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Receipt className="w-5 h-5 text-[#8CBE41]" />
              <h3 className="text-white font-semibold text-lg">Payment History</h3>
            </div>

            {data.payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No payment history yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                {data.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between bg-slate-700/50 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {payment.status === "successful" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">
                          {planLabel(payment.planId)}
                        </p>
                        <p className="text-slate-400 text-xs capitalize">
                          {payment.billingCycle} · {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-semibold",
                        payment.status === "successful" ? "text-white" : "text-red-400"
                      )}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className={cn(
                        "text-xs capitalize",
                        payment.status === "successful" ? "text-green-400" : "text-red-400"
                      )}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingDetails;
