"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getClientAdminSession } from "@/lib/admin-session-client";

const MAIN_ONLY_PATHS = ["/admin/owners"];

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    const authed = sessionStorage.getItem("crossline_admin");
    if (!authed) {
      router.replace("/admin/login");
      return;
    }
    const session = getClientAdminSession();
    if (session && !session.isMain && MAIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
      router.replace("/admin");
    }
  }, [isLogin, pathname, router]);

  return <>{children}</>;
}
