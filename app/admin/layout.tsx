"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Mic2,
  Users,
  ShieldCheck,
  ChevronRight,
  Lock,
} from "lucide-react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

const NAV_ITEMS = [
  {
    href: "/admin/contacts",
    label: "Contacts",
    icon: Users,
  },
  {
    href: "/admin/contact-messages",
    label: "Contact Messages",
    icon: MessageSquare,
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-[#6b952a]/20 border border-[#6b952a]/30">
              <ShieldCheck className="w-7 h-7 text-[#6b952a]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-sm text-slate-400 text-center">
              Enter your admin password to continue
            </p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Enter password"
                autoFocus
                className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6b952a] transition-colors"
              />
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm text-center">Incorrect password. Try again.</p>
            )}
            <Button type="submit" className="bg-[#6b952a] hover:bg-[#7aaa30] text-white py-3">
              Continue
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex text-white">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        {/* Logo / brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-[#6b952a]/20 border border-[#6b952a]/30">
            <ShieldCheck className="w-5 h-5 text-[#6b952a]" />
          </div>
          <span className="font-semibold text-white tracking-tight">TalkTune Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  active
                    ? "bg-[#6b952a]/20 text-[#6b952a] border border-[#6b952a]/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-600">Logged in as Admin</p>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
