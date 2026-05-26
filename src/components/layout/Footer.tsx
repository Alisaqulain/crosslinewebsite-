import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { navLinks, stadiumInfo } from "@/lib/data";
import { ContactListInline } from "@/components/contact/ContactList";

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#070d12]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              {stadiumInfo.tagline}. Premium cricket ground with online booking, live streaming, and world-class facilities.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-[#FBB03B] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2 text-slate-400">
                <MapPin className="h-4 w-4 shrink-0 text-[#39B54A] mt-0.5" />
                <span>{stadiumInfo.address}</span>
              </li>
              <li className="flex gap-2 text-slate-400">
                <Mail className="h-4 w-4 shrink-0 text-[#ED1C24] mt-0.5" />
                <a href={`mailto:${stadiumInfo.email}`} className="hover:text-[#FBB03B] transition-colors">
                  {stadiumInfo.email}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</p>
            <div className="mt-2">
              <ContactListInline />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Hours</h4>
            <p className="text-sm text-slate-400">{stadiumInfo.hours}</p>
            <p className="mt-4 text-sm text-slate-500">{stadiumInfo.capacity}</p>
            <Link
              href="/booking"
              className="mt-6 inline-block text-sm font-semibold text-[#FBB03B] hover:text-[#F7931E] transition-colors"
            >
              Book your slot →
            </Link>
          </div>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/8 pt-8 text-sm text-slate-500">
          <p suppressHydrationWarning>© {new Date().getFullYear()} {stadiumInfo.name}. All rights reserved.</p>
          <p className="text-xs">Frontend demo — no backend connected</p>
        </div>
      </div>
    </footer>
  );
}
