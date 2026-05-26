"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { AdminSidebar } from "./AdminSidebar";

export function AdminHeader({ title }: { title: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full">
            <AdminSidebar />
          </div>
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/8 bg-[#0b1219]/90 backdrop-blur px-4 lg:px-6">
        <button className="lg:hidden p-2 text-white" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-[family-name:var(--font-sora)] text-lg font-semibold text-white">{title}</h1>
        <div className="ml-auto">
          <Link href="/" className="text-sm text-slate-400 hover:text-[#FBB03B]">
            View Site →
          </Link>
        </div>
      </header>
    </>
  );
}

export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="admin-theme min-h-screen bg-[#0b1219]">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader title={title} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
