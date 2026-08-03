"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminMatchesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/bookings?tab=old-sessions");
  }, [router]);

  return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
    </div>
  );
}
