import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { footerLinks, stadiumInfo, primaryPhone } from "@/lib/data";
import { ContactListInline } from "@/components/contact/ContactList";

const whatsapp = `https://wa.me/${primaryPhone.tel.replace(/\D/g, "")}`;

export function Footer() {
  return (
    <footer className="relative bg-[var(--navy-deep)] text-white overflow-hidden">
      <div className="absolute inset-0 circle-logo-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cricket-green-light)]/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo light showText />
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              Premium cricket ground, sports academy, and tournament venue in Muzaffarnagar.
            </p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#20bd5a] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Us
            </a>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cricket-green-light)] mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cricket-green-light)] mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--cricket-green-light)] mt-0.5" />
                <span>{stadiumInfo.address}</span>
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[var(--brand-red)] mt-0.5" />
                <a href={`mailto:${stadiumInfo.email}`} className="hover:text-white">{stadiumInfo.email}</a>
              </li>
            </ul>
            <div className="mt-4">
              <ContactListInline light />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--cricket-green-light)] mb-4">Visit Us</h4>
            <p className="text-sm text-slate-400">{stadiumInfo.hours}</p>
            <p className="mt-2 text-sm text-slate-500">{stadiumInfo.capacity}</p>
            <Link href="/booking" className="mt-6 inline-block text-sm font-bold text-[var(--brand-red)] hover:text-white transition-colors">
              Book your slot →
            </Link>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 space-y-3">
          <p className="text-center text-sm text-slate-500" suppressHydrationWarning>
            © {new Date().getFullYear()} {stadiumInfo.name}. All rights reserved.
          </p>
          <p className="text-center text-xs text-slate-600 leading-relaxed">
            Designed &amp; developed by{" "}
            <a href="https://devspheresolutions.in/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[var(--cricket-green-light)] font-semibold">
              DevsSphere Solutions
            </a>
            <span className="mx-2">•</span>
            Developer Syed Ali Zaidi
          </p>
        </div>
      </div>
    </footer>
  );
}
