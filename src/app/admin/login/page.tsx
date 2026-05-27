"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import Link from "next/link";
import { Lock, Loader2, Shield, ArrowLeft } from "lucide-react";
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
    <div className="relative min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <MediaImage src={images.adminLogin} alt="" fill className="object-cover" priority sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--navy-deep)]/95 via-[var(--navy)]/90 to-[var(--cricket-green)]/30" />
        <div className="absolute inset-0 hero-pattern opacity-60" />
        <div className="relative z-10 max-w-md px-10 text-white">
          <div className="relative h-24 w-24 rounded-full bg-white p-2 shadow-2xl ring-4 ring-white/20 mb-8">
            <Image src="/crossline-logo.png" alt="Crossline" fill className="object-contain rounded-full" />
          </div>
          <h2 className="font-[family-name:var(--font-sora)] text-3xl font-extrabold leading-tight">
            Crossline Stadium
            <span className="block text-[var(--cricket-green-light)] text-xl mt-1">Admin Control Panel</span>
          </h2>
          <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
            Manage bookings, slots, matches, inventory, and finances from one secure dashboard.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
            <Shield className="h-4 w-4 text-[var(--cricket-green-light)]" />
            Authorized staff only
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 bg-[var(--bg-alt)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <div className="relative h-16 w-16 rounded-full bg-white p-1.5 shadow-lg ring-2 ring-[var(--navy)]/10">
              <Image src="/crossline-logo.png" alt="Crossline" fill className="object-contain rounded-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-lg)]">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-[var(--brand-red)] to-[var(--cricket-green)] mb-6" />
            <h1 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-[var(--navy)]">Sign In</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Enter your admin credentials</p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="admincrossline"
                  className="mt-1.5"
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
                  className="mt-1.5"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-[var(--brand-red)] bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full min-h-[48px] btn-glow" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Sign In to Dashboard
              </Button>
            </form>
          </div>

          <Link
            href="/"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--brand-red)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
