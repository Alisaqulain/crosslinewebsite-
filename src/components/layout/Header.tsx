"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Calendar, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

function NavLinkItem({
  href,
  label,
  active,
  transparent,
}: {
  href: string;
  label: string;
  active: boolean;
  transparent: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-3 py-2 text-[13px] font-semibold whitespace-nowrap rounded-lg transition-colors duration-300",
        transparent
          ? active
            ? "text-white"
            : "text-white/80 hover:text-white"
          : active
            ? "text-[var(--brand-red)]"
            : "text-[var(--text-muted)] hover:text-[var(--navy)]"
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          className={cn(
            "absolute inset-0 rounded-lg -z-10",
            transparent ? "bg-white/15 ring-1 ring-white/20" : "bg-[var(--brand-red)]/10"
          )}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative z-10">{label}</span>
      <motion.span
        className={cn(
          "absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full origin-left",
          transparent
            ? "bg-gradient-to-r from-[var(--cricket-green-light)] to-[var(--brand-red)]"
            : "bg-gradient-to-r from-[var(--brand-red)] to-[var(--cricket-green)]"
        )}
        initial={false}
        animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </Link>
  );
}

function MenuToggle({ open, transparent }: { open: boolean; transparent: boolean }) {
  return (
    <div className="relative h-6 w-6" aria-hidden>
      <motion.span
        className={cn(
          "absolute left-0 top-1 block h-0.5 w-6 rounded-full",
          transparent ? "bg-white" : "bg-[var(--navy)]"
        )}
        animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span
        className={cn(
          "absolute left-0 top-[11px] block h-0.5 w-6 rounded-full",
          transparent ? "bg-white" : "bg-[var(--navy)]"
        )}
        animate={open ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className={cn(
          "absolute left-0 bottom-1 block h-0.5 w-6 rounded-full",
          transparent ? "bg-white" : "bg-[var(--navy)]"
        )}
        animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();
  const isAdmin = pathname.startsWith("/admin");

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = lastScrollY.current;
    lastScrollY.current = latest;
    setScrolled(latest > 20);
    if (latest > 120 && latest > prev + 8) setHidden(true);
    else if (latest < prev - 8 || latest < 80) setHidden(false);
  });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (isAdmin && pathname !== "/admin/login") return null;

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: hidden && !open ? -100 : 0,
          opacity: hidden && !open ? 0 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          transparent ? "pointer-events-auto" : ""
        )}
      >
        <motion.div
          className="relative"
          animate={{
            backgroundColor: transparent
              ? "rgba(6, 15, 34, 0.35)"
              : "rgba(255, 255, 255, 0.92)",
            backdropFilter: transparent ? "blur(12px)" : "blur(20px)",
            boxShadow: transparent
              ? "0 0 0 0 transparent"
              : "0 8px 32px rgba(10, 26, 58, 0.12)",
            borderBottomWidth: transparent ? 0 : 1,
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ borderBottomColor: "var(--border)" }}
        >
          {/* Animated cricket accent line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[3px] origin-left"
            style={{
              background:
                "linear-gradient(90deg, var(--brand-red), var(--cricket-green-light), var(--navy-light))",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: scrolled || open ? 1 : 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.div
            className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
            animate={{ height: scrolled ? 68 : 76 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ scale: scrolled ? 0.95 : 1 }}
              transition={{ duration: 0.35 }}
            >
              <Logo light={transparent} showText={!scrolled} size={scrolled ? "sm" : "md"} />
            </motion.div>

            {/* Desktop / tablet nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center min-w-0 overflow-x-auto scrollbar-none px-2">
              {navLinks.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <NavLinkItem
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    active={active}
                    transparent={transparent}
                  />
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Link href="/contact">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                    transparent
                      ? "text-white/90 hover:bg-white/10"
                      : "text-[var(--navy)] hover:bg-[var(--bg-alt)]"
                  )}
                >
                  <Phone className="h-3.5 w-3.5" />
                  Contact
                </motion.span>
              </Link>
              <Link href="/booking">
                <motion.div
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative"
                >
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[var(--brand-red)] opacity-40 blur-md"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <Button size="sm" className="btn-glow relative">
                    <Calendar className="h-4 w-4" />
                    Book Ground
                  </Button>
                </motion.div>
              </Link>
            </div>

            <motion.button
              type="button"
              className={cn(
                "md:hidden p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center",
                transparent ? "hover:bg-white/10" : "hover:bg-[var(--bg-alt)]"
              )}
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              whileTap={{ scale: 0.92 }}
            >
              <MenuToggle open={open} transparent={transparent && !open} />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-[var(--navy-deep)]/70 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed top-[76px] left-0 right-0 z-40 md:hidden max-h-[calc(100vh-76px)] overflow-y-auto"
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mx-3 mt-2 rounded-2xl border border-white/10 bg-white shadow-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[var(--brand-red)] via-[var(--cricket-green-light)] to-[var(--navy-light)]" />
                <nav className="flex flex-col p-3 gap-1">
                  {navLinks.map((link, i) => {
                    const active =
                      pathname === link.href ||
                      (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{
                          delay: i * 0.05,
                          duration: 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold min-h-[48px] transition-colors",
                            active
                              ? "bg-[var(--navy)] text-white shadow-md"
                              : "text-[var(--navy)] hover:bg-[var(--bg-alt)]"
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="mobile-nav-dot"
                              className="h-2 w-2 rounded-full bg-[var(--cricket-green-light)] shrink-0"
                            />
                          )}
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: navLinks.length * 0.05 + 0.1, duration: 0.35 }}
                    className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-[var(--border)]"
                  >
                    <Link href="/contact" onClick={() => setOpen(false)}>
                      <Button variant="outline" className="w-full min-h-[48px]">
                        <Phone className="h-4 w-4" />
                        Contact
                      </Button>
                    </Link>
                    <Link href="/booking" onClick={() => setOpen(false)}>
                      <Button className="w-full min-h-[48px] btn-glow">
                        <Calendar className="h-4 w-4" />
                        Book
                      </Button>
                    </Link>
                  </motion.div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
