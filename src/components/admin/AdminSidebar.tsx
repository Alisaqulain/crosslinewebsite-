"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Package,
  BarChart3,
  FileText,
  Image,
  Fuel,
  Receipt,
  IndianRupee,
  Users,
  TrendingUp,
  LogOut,
  Medal,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";
import { clearClientAdminSession, getClientAdminSession } from "@/lib/admin-session-client";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings & Sessions", icon: Calendar },
  { href: "/admin/udhari", label: "Udhari", icon: IndianRupee },
  { href: "/admin/slots", label: "Slot Pricing", icon: Clock },
  { href: "/admin/inventory", label: "Ball Stock", icon: Package },
  { href: "/admin/finance", label: "Profit & Loss", icon: BarChart3 },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/other-income", label: "Other Income", icon: TrendingUp },
  { href: "/admin/diesel", label: "Diesel", icon: Fuel },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/content", label: "Website Content", icon: FileText },
  { href: "/admin/tournaments", label: "Tournaments", icon: Medal },
  { href: "/admin/owners", label: "Owners & Logins", icon: Users, mainOnly: true },
];

export function AdminSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [ownerName, setOwnerName] = useState("");
  const [roleLabel, setRoleLabel] = useState("Admin");
  const [isMain, setIsMain] = useState(true);

  useEffect(() => {
    const session = getClientAdminSession();
    setOwnerName(session?.ownerName ?? "");
    setRoleLabel(session?.isMain ? "Main Owner" : "Co-owner");
    setIsMain(session?.isMain ?? true);
  }, [pathname]);

  const visibleLinks = links.filter((link) => isMain || !("mainOnly" in link && link.mainOnly));

  return (
    <aside
      className={cn(
        "admin-sidebar fixed left-0 top-0 z-40 h-full w-72 flex flex-col",
        "bg-[var(--navy-deep)] border-r border-white/5",
        className ?? "hidden lg:flex"
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand-red)] via-[var(--cricket-green-light)] to-[var(--navy-light)]" />

      <div className="p-5 border-b border-white/8">
        <Logo light />
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cricket-green-light)]">
          {roleLabel}
        </p>
        {ownerName && (
          <p className="text-xs text-slate-400 mt-1 truncate" title={ownerName}>
            {ownerName}
          </p>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleLinks.map((link) => {
          const active =
            pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white/10 text-white shadow-lg shadow-black/20 border-l-[3px] border-[var(--brand-red)] pl-[9px]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent pl-[9px]"
              )}
            >
              <link.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-[var(--cricket-green-light)]" : "group-hover:text-[var(--cricket-green-light)]"
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/8">
        <Link
          href="/admin/login"
          onClick={() => {
            clearClientAdminSession();
            onNavigate?.();
          }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
