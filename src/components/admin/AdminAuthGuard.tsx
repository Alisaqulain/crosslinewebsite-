"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    const authed = sessionStorage.getItem("crossline_admin");
    if (!authed) router.replace("/admin/login");
  }, [isLogin, router]);

  return <>{children}</>;
}
