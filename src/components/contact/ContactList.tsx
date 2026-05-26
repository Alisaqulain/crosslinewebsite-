import { stadiumContacts } from "@/lib/data";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContactList({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {stadiumContacts.map((contact) => (
        <li key={contact.phone}>
          <a
            href={`tel:${contact.tel}`}
            className={cn(
              "flex items-center gap-3 rounded-xl p-3 transition-colors group",
              light ? "hover:bg-white/10" : "bg-[var(--bg-alt)] hover:bg-[var(--bg-muted)]"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--navy)]/10">
              <Phone className="h-4 w-4 text-[var(--navy)]" />
            </span>
            <div className="min-w-0">
              <p className={cn("text-sm font-semibold", light ? "text-white" : "text-[var(--navy)]")}>
                {contact.name}
              </p>
              <p className={cn("text-sm", light ? "text-slate-300" : "text-[var(--text-muted)]")}>{contact.phone}</p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ContactListInline({ light = false }: { light?: boolean }) {
  return (
    <ul className="space-y-2 text-sm">
      {stadiumContacts.map((contact) => (
        <li key={contact.phone} className="flex gap-2">
          <Phone className={cn("h-4 w-4 shrink-0 mt-0.5", light ? "text-[var(--cricket-green-light)]" : "text-[var(--brand-red)]")} />
          <span className={light ? "text-slate-300" : "text-[var(--text-muted)]"}>
            <a
              href={`tel:${contact.tel}`}
              className={cn("font-medium hover:underline", light ? "text-white" : "text-[var(--navy)]")}
            >
              {contact.phone}
            </a>
            <span className="opacity-70"> — {contact.name}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
