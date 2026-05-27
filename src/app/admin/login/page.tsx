"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import Link from "next/link";
import { Lock, Loader2 } from "lucide-react";
import { MediaImage } from "@/components/media/MediaImage";
import { images } from "@/lib/media";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const username = fd.get("username") as string;
    const password = fd.get("password") as string;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid credentials");
        return;
      }
      sessionStorage.setItem("crossline_admin", "true");
      sessionStorage.setItem("crossline_admin_token", data.token);
      sessionStorage.setItem("crossline_admin_user", data.username);
      router.push("/admin");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
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
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="admincrossline"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full min-h-[48px]" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Sign In
          </Button>
        </form>
        <Link href="/" className="mt-6 block text-center text-sm text-[#FBB03B] hover:underline">
          ← Back to website
        </Link>
      </Card>
    </div>
  );
}
