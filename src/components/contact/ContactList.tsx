import { stadiumContacts } from "@/lib/data";
import { Phone, User } from "lucide-react";

export function ContactList({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {stadiumContacts.map((contact) => (
        <li key={contact.phone}>
          <a
            href={`tel:${contact.tel}`}
            className="flex items-center gap-3 rounded-xl p-3 bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F7931E]/20">
              <Phone className="h-4 w-4 text-[#F7931E]" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-[#FBB03B] transition-colors">
                {contact.name}
              </p>
              <p className="text-sm text-slate-400">{contact.phone}</p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ContactListInline() {
  return (
    <ul className="space-y-2 text-sm text-slate-400">
      {stadiumContacts.map((contact) => (
        <li key={contact.phone} className="flex gap-2 items-start">
          <User className="h-4 w-4 shrink-0 text-[#F7931E] mt-0.5" />
          <span>
            <a href={`tel:${contact.tel}`} className="text-white hover:text-[#FBB03B] transition-colors">
              {contact.phone}
            </a>
            <span className="text-slate-500"> — {contact.name}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
