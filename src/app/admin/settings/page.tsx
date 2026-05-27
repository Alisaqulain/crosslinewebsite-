"use client";

import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { stadiumContacts, stadiumInfo } from "@/lib/data";
import { Settings, Mail } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Settings">
      <div className="max-w-2xl space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-6 w-6 text-[#F7931E]" />
            <h2 className="font-semibold text-white">Stadium Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Stadium Name</Label>
              <Input defaultValue={stadiumInfo.name} readOnly className="text-slate-400" />
            </div>
            <div>
              <Label>Address</Label>
              <Input defaultValue={stadiumInfo.address} readOnly className="text-slate-400" />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input defaultValue={stadiumInfo.email} readOnly className="text-slate-400" />
            </div>
            <div>
              <Label>Contact Numbers</Label>
              <div className="mt-2 space-y-2">
                {stadiumContacts.map((c) => (
                  <Input key={c.phone} defaultValue={`${c.name} — ${c.phone}`} readOnly className="text-slate-400" />
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Edit contact details on the Website Content page. Stadium info is configured in site data.
          </p>
        </Card>
        <Card>
          <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#39B54A]" />
            Email Notifications
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Configure in your <code className="text-slate-300">.env</code> file:
          </p>
          <ul className="space-y-2 text-sm text-slate-300 font-mono">
            <li>EMAIL_USER=</li>
            <li>EMAIL_PASS=</li>
            <li>ADMIN_EMAIL=</li>
            <li>MONGODB_URI=</li>
          </ul>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2"><span className="text-[#39B54A]">✓</span> Booking request received</li>
            <li className="flex items-center gap-2"><span className="text-[#39B54A]">✓</span> Booking approved confirmation</li>
            <li className="flex items-center gap-2"><span className="text-[#39B54A]">✓</span> Booking rejection notice</li>
          </ul>
        </Card>
      </div>
    </AdminShell>
  );
}
