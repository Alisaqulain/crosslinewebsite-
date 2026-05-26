"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    const authed = sessionStorage.getItem("crossline_admin");
    if (!authed) router.replace("/admin/login");
  }, [isLogin, router]);

  if (isLogin) return <>{children}</>;
  return <>{children}</>;
}
