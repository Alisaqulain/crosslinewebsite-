"use client";

import { Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminSidebar } from "./AdminSidebar";
import { getClientAdminSession } from "@/lib/admin-session-client";

export function AdminHeader({ title }: { title: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Admin");
  const [roleLabel, setRoleLabel] = useState("");

  useEffect(() => {
    const session = getClientAdminSession();
    if (session?.ownerName) {
      setDisplayName(session.ownerName);
      setRoleLabel(session.isMain ? "Main owner" : session.username);
    } else {
      setDisplayName(sessionStorage.getItem("crossline_admin_user") ?? "Admin");
      setRoleLabel("");
    }
  }, []);

  return (
    <>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-[var(--navy-deep)]/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full shadow-2xl">
            <AdminSidebar className="flex" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--admin-border)] bg-white/90 backdrop-blur-xl px-4 lg:px-8 shadow-sm">
        <button
          type="button"
          className="lg:hidden p-2.5 rounded-xl text-[var(--navy)] hover:bg-[var(--bg-alt)]"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--cricket-green)]">Admin Panel</p>
          <h1 className="font-[family-name:var(--font-sora)] text-lg font-bold text-[var(--navy)] leading-tight">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-red)] transition-colors"
          >
            View Site →
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-[var(--bg-alt)] pl-1 pr-3 py-1 border border-[var(--border)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--navy)] text-white">
              <User className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-[var(--navy)] capitalize">{displayName}</span>
            {roleLabel && (
              <span className="text-[10px] text-slate-500 block leading-tight">{roleLabel}</span>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="admin-theme min-h-screen">
      <AdminSidebar />
      <div className="lg:pl-72">
        <AdminHeader title={title} />
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px]">{children}</main>
      </div>
    </div>
  );
}
