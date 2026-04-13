"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  User,
  Crown,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Mail,
  Calendar,
  FileText,
  RefreshCw,
} from "lucide-react";

interface Contact {
  id: number;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  subscriptionPlan: string | null;
  subscriptionCycle: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  isVerified: boolean;
  createdAt: string;
  image: string | null;
  _count: { scripts: number };
}

interface PlanCount {
  subscriptionPlan: string | null;
  _count: { _all: number };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

const PLAN_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  free: { bg: "bg-slate-500/20", text: "text-slate-300", label: "Free" },
  starter: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Starter" },
  pro: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Pro" },
  enterprise: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Enterprise" },
};

const getPlanStyle = (plan: string | null) =>
  PLAN_COLORS[plan?.toLowerCase() ?? ""] ?? {
    bg: "bg-slate-500/20",
    text: "text-slate-300",
    label: plan ?? "Free",
  };

function Avatar({ contact }: { contact: Contact }) {
  const initials = (contact.name ?? contact.email)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (contact.image) {
    return (
      <img
        src={contact.image}
        alt={contact.name ?? contact.email}
        className="w-9 h-9 rounded-full object-cover border border-slate-600"
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-[#6b952a]/20 border border-[#6b952a]/40 flex items-center justify-center text-[#6b952a] text-sm font-semibold">
      {initials}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  onClick,
  active,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Card
      className={`bg-slate-800/60 border-slate-700 transition-all ${
        onClick ? "cursor-pointer hover:border-slate-500" : ""
      } ${active ? "border-[#6b952a] ring-1 ring-[#6b952a]/30" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminContactsPage() {
  /* Data */
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [planCounts, setPlanCounts] = useState<PlanCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* Filters */
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterRole, setFilterRole] = useState("");

  /* Detail panel */
  const [selected, setSelected] = useState<Contact | null>(null);

  /* Debounce search */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchContacts = useCallback(
    async (page: number, sq: string, plan: string, role: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
          ...(sq && { search: sq }),
          ...(plan && { plan }),
          ...(role && { role }),
        });
        const res = await fetch(`/api/admin/contacts?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch contacts");
        setContacts(data.users);
        setPagination(data.pagination);
        setPlanCounts(data.planCounts ?? []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load contacts");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchContacts(currentPage, debouncedSearch, filterPlan, filterRole);
  }, [currentPage, debouncedSearch, filterPlan, filterRole, fetchContacts]);

  const formatDate = (ds: string | null) => {
    if (!ds) return "—";
    return new Date(ds).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalUsers = pagination?.totalUsers ?? 0;

  const freeCount = planCounts
    .filter((p) => !p.subscriptionPlan || p.subscriptionPlan === "free")
    .reduce((sum, p) => sum + p._count._all, 0);

  const paidCount = planCounts
    .filter((p) => p.subscriptionPlan && p.subscriptionPlan !== "free")
    .reduce((sum, p) => sum + p._count._all, 0);


  return (
    <div className="min-h-screen bg-background p-6 text-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-[#6b952a]" />
              Contacts
            </h1>
            <p className="text-slate-400 text-sm mt-1">All registered users on TalkTune</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchContacts(currentPage, debouncedSearch, filterPlan, filterRole)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={totalUsers}
            color="bg-[#6b952a]/20 text-[#6b952a]"
            active={!filterPlan}
            onClick={() => { setFilterPlan(""); setCurrentPage(1); }}
          />
          <StatCard
            icon={Crown}
            label="Paid Users"
            value={paidCount}
            color="bg-purple-500/20 text-purple-400"
            active={filterPlan === "__paid__"}
            onClick={() => {
              setFilterPlan(filterPlan === "__paid__" ? "" : "__paid__");
              setCurrentPage(1);
            }}
          />
          <StatCard
            icon={User}
            label="Free Users"
            value={freeCount}
            color="bg-slate-500/20 text-slate-400"
            active={filterPlan === "free"}
            onClick={() => { setFilterPlan(filterPlan === "free" ? "" : "free"); setCurrentPage(1); }}
          />
          <StatCard
            icon={Shield}
            label="Admins"
            value={planCounts.length > 0 ? "—" : "—"}
            color="bg-amber-500/20 text-amber-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6b952a] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Plan filter */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filterPlan}
              onChange={(e) => { setFilterPlan(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-[#6b952a] appearance-none cursor-pointer"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Role filter */}
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-[#6b952a] appearance-none cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Table */}
          <div className={`flex-1 min-w-0 flex flex-col gap-3 ${selected ? "hidden lg:flex" : ""}`}>
            {isLoading ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[#6b952a]" />
              </div>
            ) : contacts.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-16 text-center">
                  <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No contacts found</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-2 text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Plan</span>
                  <span>Role</span>
                  <span>Scripts</span>
                  <span>Joined</span>
                </div>

                {contacts.map((contact) => {
                  const plan = getPlanStyle(contact.subscriptionPlan);
                  return (
                    <Card
                      key={contact.id}
                      onClick={() => setSelected(contact)}
                      className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:border-slate-500 hover:bg-slate-800/80 ${
                        selected?.id === contact.id ? "border-[#6b952a]" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-3 items-center">
                          {/* Name */}
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar contact={contact} />
                            <div className="min-w-0">
                              <p className="font-medium text-white truncate">
                                {contact.name ?? <span className="text-slate-500 italic">No name</span>}
                              </p>
                              <p className="text-xs text-slate-500 md:hidden">{contact.email}</p>
                            </div>
                          </div>

                          {/* Email */}
                          <p className="text-sm text-slate-300 truncate hidden md:block">{contact.email}</p>

                          {/* Plan */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit ${plan.bg} ${plan.text}`}>
                            {plan.label}
                          </span>

                          {/* Role */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                              contact.role === "ADMIN"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-slate-600/40 text-slate-400"
                            }`}
                          >
                            {contact.role === "ADMIN" ? (
                              <Shield className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            {contact.role}
                          </span>

                          {/* Scripts */}
                          <span className="text-sm text-slate-400 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            {contact._count.scripts}
                          </span>

                          {/* Joined */}
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(contact.createdAt)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-1">
                <span className="text-xs text-slate-500">
                  {(pagination.currentPage - 1) * 20 + 1}–
                  {Math.min(pagination.currentPage * 20, pagination.totalUsers)} of{" "}
                  {pagination.totalUsers} users
                </span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-400">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <CardTitle className="text-base text-white">User Details</CardTitle>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  {/* Avatar + name */}
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="relative">
                      {selected.image ? (
                        <img
                          src={selected.image}
                          alt={selected.name ?? selected.email}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#6b952a]/50"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#6b952a]/20 border-2 border-[#6b952a]/40 flex items-center justify-center text-[#6b952a] text-xl font-bold">
                          {(selected.name ?? selected.email)
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                      {selected.role === "ADMIN" && (
                        <Shield className="absolute -bottom-1 -right-1 w-5 h-5 text-amber-400 bg-slate-800 rounded-full p-0.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">
                        {selected.name ?? <span className="text-slate-500 italic text-base">No name set</span>}
                      </p>
                      <p className="text-sm text-slate-400">{selected.email}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getPlanStyle(selected.subscriptionPlan).bg} ${getPlanStyle(selected.subscriptionPlan).text}`}>
                      <Crown className="w-3 h-3" />
                      {getPlanStyle(selected.subscriptionPlan).label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        selected.role === "ADMIN"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-slate-600/40 text-slate-400"
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {selected.role}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        selected.isVerified
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {selected.isVerified ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {selected.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>

                  {/* Info rows */}
                  <div className="flex flex-col gap-3 border-t border-slate-700 pt-4">
                    <DetailRow icon={Mail} label="Email" value={selected.email} />
                    <DetailRow icon={Calendar} label="Joined" value={formatDate(selected.createdAt)} />
                    <DetailRow icon={FileText} label="Scripts" value={String(selected._count.scripts)} />
                    {selected.subscriptionPlan && selected.subscriptionPlan !== "free" && (
                      <>
                        <DetailRow
                          icon={Crown}
                          label="Cycle"
                          value={selected.subscriptionCycle ?? "—"}
                        />
                        <DetailRow
                          icon={Calendar}
                          label="Sub Start"
                          value={formatDate(selected.subscriptionStartDate)}
                        />
                        <DetailRow
                          icon={Calendar}
                          label="Sub End"
                          value={formatDate(selected.subscriptionEndDate)}
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}
