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
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";
import { clearClientAdminSession, getClientAdminSession } from "@/lib/admin-session-client";

type NavLink = { href: string; label: string; icon: LucideIcon; mainOnly?: boolean };

const navGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Daily work",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/bookings", label: "Bookings", icon: Calendar },
      { href: "/admin/udhari", label: "Udhari", icon: IndianRupee },
    ],
  },
  {
    title: "Money",
    links: [
      { href: "/admin/finance", label: "Profit & loss", icon: BarChart3 },
      { href: "/admin/expenses", label: "Expenses", icon: Receipt },
      { href: "/admin/other-income", label: "Other income", icon: TrendingUp },
      { href: "/admin/diesel", label: "Diesel", icon: Fuel },
    ],
  },
  {
    title: "Stock & pricing",
    links: [
      { href: "/admin/inventory", label: "Ball stock", icon: Package },
      { href: "/admin/slots", label: "Slot pricing", icon: Clock },
    ],
  },
  {
    title: "Website",
    links: [
      { href: "/admin/gallery", label: "Gallery", icon: Image },
      { href: "/admin/content", label: "Website content", icon: FileText },
      { href: "/admin/tournaments", label: "Tournaments", icon: Medal },
    ],
  },
  {
    title: "Settings",
    links: [{ href: "/admin/owners", label: "Owners & logins", icon: Users, mainOnly: true }],
  },
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
  const [isMain, setIsMain] = useState(true);

  useEffect(() => {
    const session = getClientAdminSession();
    setOwnerName(session?.ownerName ?? "");
    setIsMain(session?.isMain ?? true);
  }, [pathname]);

  return (
    <aside
      className={cn(
        "admin-sidebar fixed left-0 top-0 z-40 h-full w-64 flex flex-col",
        "bg-[var(--navy-deep)] border-r border-white/5",
        className ?? "hidden lg:flex"
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand-red)] via-[var(--cricket-green-light)] to-[var(--navy-light)]" />

      <div className="p-4 border-b border-white/8">
        <Logo light />
        {ownerName && (
          <p className="text-sm text-white/90 mt-3 font-medium truncate" title={ownerName}>
            {ownerName}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-0.5">{isMain ? "Main owner" : "Co-owner"}</p>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navGroups.map((group) => {
          const links = group.links.filter((link) => isMain || !link.mainOnly);
          if (links.length === 0) return null;
          return (
            <div key={group.title}>
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {links.map((link) => {
                  const active =
                    pathname === link.href ||
                    (link.href !== "/admin" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/12 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <link.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-[var(--cricket-green-light)]" : ""
                        )}
                      />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
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
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
