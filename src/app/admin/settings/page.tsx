"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { stadiumContacts, stadiumInfo } from "@/lib/data";

const DEFAULT_ADVANCE = 25;
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const [advance, setAdvance] = useState(DEFAULT_ADVANCE);

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
              <Input defaultValue={stadiumInfo.name} />
            </div>
            <div>
              <Label>Address</Label>
              <Input defaultValue={stadiumInfo.address} />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input defaultValue={stadiumInfo.email} />
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
        </Card>
        <Card>
          <h2 className="font-semibold text-white mb-4">Advance Payment</h2>
          <div>
            <Label htmlFor="advance">Advance Percentage (%)</Label>
            <Input
              id="advance"
              type="number"
              min={10}
              max={50}
              value={advance}
              onChange={(e) => setAdvance(Number(e.target.value))}
              className="max-w-xs mt-2"
            />
            <p className="mt-2 text-sm text-slate-500">
              Customers pay {advance}% advance during booking. Remaining collected at stadium.
            </p>
          </div>
          <Button className="mt-6">Save Settings</Button>
        </Card>
        <Card>
          <h2 className="font-semibold text-white mb-2">Email Notifications</h2>
          <p className="text-sm text-slate-400 mb-4">Automated emails (frontend demo — requires backend)</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2"><span className="text-[#39B54A]">✓</span> Booking request confirmation</li>
            <li className="flex items-center gap-2"><span className="text-[#39B54A]">✓</span> Booking approval confirmation</li>
            <li className="flex items-center gap-2"><span className="text-[#39B54A]">✓</span> Status update notifications</li>
          </ul>
        </Card>
      </div>
    </AdminShell>
  );
}
