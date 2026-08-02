import type { Metadata } from "next";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { pageMetadata } from "@/lib/seo";
import "./admin.css";

export const metadata: Metadata = pageMetadata({
  title: "Admin",
  description: "Crossline Cricket Stadium admin panel.",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
