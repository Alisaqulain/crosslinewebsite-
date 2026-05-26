"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import Link from "next/link";
import { Lock } from "lucide-react";
import { MediaImage } from "@/components/media/MediaImage";
import { images } from "@/lib/media";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    if (email === "admin@crossline.com" && password === "admin123") {
      sessionStorage.setItem("crossline_admin", "true");
      sessionStorage.setItem("crossline_admin_token", "crossline-admin-secret");
      router.push("/admin");
    } else {
      setError("Invalid credentials. Use admin@crossline.com / admin123");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <MediaImage src={images.adminLogin} alt="" fill className="object-cover" priority sizes="100vw" />
      <div className="absolute inset-0 bg-[#070d12]/90" />
      <Card className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative h-20 w-20 mx-auto mb-4 rounded-full bg-white p-1 shadow-lg">
            <Image src="/crossline-logo.png" alt="Crossline" fill className="object-contain rounded-full" />
          </div>
          <h1 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-white">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-400">Crossline Cricket Stadium</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue="admin@crossline.com" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" defaultValue="admin123" required />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full">
            <Lock className="h-4 w-4" />
            Sign In
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          Demo: admin@crossline.com / admin123
        </p>
        <Link href="/" className="mt-4 block text-center text-sm text-[#FBB03B] hover:underline">
          ← Back to website
        </Link>
      </Card>
    </div>
  );
}
