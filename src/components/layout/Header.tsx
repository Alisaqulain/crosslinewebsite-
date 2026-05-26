"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Calendar } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin && pathname !== "/admin/login") return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-[#FBB03B] bg-white/5"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/admin/login" className="text-sm text-slate-400 hover:text-white transition-colors">
            Admin
          </Link>
          <Link href="/booking">
            <Button size="sm">
              <Calendar className="h-4 w-4" />
              Book Now
            </Button>
          </Link>
        </div>
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-[#0b1219]/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium",
                  pathname === link.href ? "bg-white/10 text-[#FBB03B]" : "text-slate-300"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin/login" onClick={() => setOpen(false)} className="px-4 py-3 text-sm text-slate-400">
              Admin Login
            </Link>
            <Link href="/booking" onClick={() => setOpen(false)} className="mt-2">
              <Button className="w-full">Book Ground</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
