import Link from "next/link";
import {
  Calendar,
  Package,
  Receipt,
  BarChart3,
  IndianRupee,
  Fuel,
} from "lucide-react";

const links = [
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/udhari", label: "Udhari", icon: IndianRupee },
  { href: "/admin/inventory", label: "Ball stock", icon: Package },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/diesel", label: "Diesel", icon: Fuel },
  { href: "/admin/finance", label: "Profit & loss", icon: BarChart3 },
];

export function AdminQuickLinks() {
  return (
    <div className="admin-quick-links mb-6">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="admin-quick-link">
          <link.icon className="h-4 w-4 shrink-0" />
          <span>{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
