"use client";

import { Menu, User } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminSidebar } from "./AdminSidebar";
import { getClientAdminSession } from "@/lib/admin-session-client";

export function AdminHeader({ title }: { title: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Admin");

  useEffect(() => {
    const session = getClientAdminSession();
    setDisplayName(session?.ownerName ?? sessionStorage.getItem("crossline_admin_user") ?? "Admin");
  }, []);

  return (
    <>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-[var(--navy-deep)]/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 h-full shadow-2xl">
            <AdminSidebar className="flex" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--admin-border)] bg-white px-4 lg:px-6 shadow-sm">
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg text-[var(--navy)] hover:bg-[var(--bg-alt)]"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-[family-name:var(--font-sora)] text-xl font-bold text-[var(--navy)] truncate">
          {title}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            className="hidden sm:inline text-sm text-[var(--text-muted)] hover:text-[var(--brand-red)]"
          >
            View site
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-[var(--bg-alt)] pl-1 pr-3 py-1 border border-[var(--border)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--navy)] text-white">
              <User className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-[var(--navy)] max-w-[120px] truncate">
              {displayName}
            </span>
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
      <div className="lg:pl-64">
        <AdminHeader title={title} />
        <main className="p-4 sm:p-5 lg:p-6 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
