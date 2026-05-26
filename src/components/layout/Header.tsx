"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Calendar } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isAdmin && pathname !== "/admin/login") return null;

  const isHome = pathname === "/";
  const onHero = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        onHero
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-xl shadow-[var(--shadow)] border-b border-[var(--border)]"
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo light={onHero} />
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center max-w-3xl">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap",
                  onHero
                    ? active
                      ? "text-white bg-white/15"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                    : active
                      ? "text-[var(--brand-red)] bg-[var(--brand-red)]/8"
                      : "text-[var(--text-muted)] hover:text-[var(--navy)] hover:bg-[var(--bg-alt)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <Link href="/booking">
            <Button size="sm" className="btn-glow">
              <Calendar className="h-4 w-4" />
              Book Ground
            </Button>
          </Link>
        </div>
        <button
          type="button"
          className={cn("lg:hidden p-2 rounded-lg", onHero ? "text-white" : "text-[var(--navy)]")}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[var(--border)] bg-white shadow-2xl max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-semibold",
                  pathname === link.href ? "bg-[var(--navy)] text-white" : "text-[var(--navy)] hover:bg-[var(--bg-alt)]"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/booking" onClick={() => setOpen(false)} className="mt-2">
              <Button className="w-full">Book Ground</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
