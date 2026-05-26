import { Card } from "@/components/ui/Card";
import { images } from "@/lib/media";
import { PageHero } from "@/components/media/PageHero";
import { MediaImage } from "@/components/media/MediaImage";
import { Shield, Clock, CreditCard, Users, Ban, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rules & Policies",
};

const policies = [
  {
    icon: Clock,
    title: "Booking & Slots",
    image: images.rules.booking,
    items: [
      "All bookings require admin approval after online submission.",
      "Advance payment (25%) is non-refundable if cancelled within 24 hours of slot.",
      "Arrive 15 minutes before your session start time.",
      "Late arrivals may forfeit unused time without refund.",
    ],
  },
  {
    icon: CreditCard,
    title: "Payment Policy",
    image: images.rules.payment,
    items: [
      "Advance percentage is set by stadium administration (typically 20–30%).",
      "Remaining balance must be paid at the stadium before play begins.",
      "Accepted methods at stadium: cash, UPI, and card.",
    ],
  },
  {
    icon: Users,
    title: "Ground Usage",
    image: images.rules.groundUsage,
    items: [
      "Maximum 22 players per full ground booking unless otherwise agreed.",
      "Proper cricket footwear required. Metal spikes only on designated areas.",
      "Teams are responsible for cleaning their dugout area after use.",
    ],
  },
  {
    icon: Ban,
    title: "Prohibited",
    image: images.rules.prohibited,
    items: [
      "Smoking and alcohol on premises.",
      "Non-cricket activities without prior written approval.",
      "Pets on the playing field.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Liability",
    image: images.rules.liability,
    items: [
      "Players participate at their own risk. Stadium is not liable for personal injury.",
      "Damage to property caused by teams will be charged accordingly.",
    ],
  },
  {
    icon: Shield,
    title: "Cancellation",
    image: images.rules.cancellation,
    items: [
      "Free rescheduling if cancelled 48+ hours before slot.",
      "50% advance forfeited for cancellations within 24–48 hours.",
      "No refund for same-day cancellations.",
    ],
  },
];

export default function RulesPage() {
  return (
    <div>
      <PageHero
        badge="Policies"
        title="Rules & Policies"
        description="Please read before booking. By booking, you agree to these terms."
        image={images.rules.hero}
      />
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          {policies.map((policy) => (
            <Card key={policy.title} className="overflow-hidden p-0">
              <div className="grid sm:grid-cols-[140px_1fr] gap-0">
                <div className="relative min-h-[120px] sm:min-h-0 sm:h-full">
                  <MediaImage src={policy.image} alt={policy.title} fill className="object-cover" sizes="140px" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <policy.icon className="h-6 w-6 text-[#F7931E]" />
                    <h2 className="text-lg font-semibold text-white">{policy.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {policy.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-slate-400">
                        <span className="text-[#39B54A] shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
