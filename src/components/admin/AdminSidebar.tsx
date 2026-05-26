"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Package,
  CreditCard,
  Radio,
  Trophy,
  BarChart3,
  FileText,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/slots", label: "Slots & Pricing", icon: Clock },
  { href: "/admin/inventory", label: "Ball Stock", icon: Package },
  { href: "/admin/scoring", label: "Live Scoring", icon: Trophy },
  { href: "/admin/stream", label: "Live Video", icon: Radio },
  { href: "/admin/payments", label: "Reports", icon: BarChart3 },
  { href: "/admin/content", label: "Website Content", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-full w-64 border-r border-white/8 bg-[#070d12] hidden lg:flex flex-col">
      <div className="p-5 border-b border-white/8">
        <Logo />
        <p className="mt-2 text-xs text-slate-500">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-to-r from-[#ED1C24]/20 to-[#F7931E]/10 text-[#FBB03B]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/8">
        <Link
          href="/admin/login"
          onClick={() => sessionStorage.removeItem("crossline_admin")}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
