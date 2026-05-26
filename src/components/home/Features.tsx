import { MediaImage } from "@/components/media/MediaImage";
import {
  Calendar,
  CreditCard,
  Mail,
  Package,
  Radio,
  Shield,
  Smartphone,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { images } from "@/lib/media";

const features = [
  {
    icon: Calendar,
    title: "Online Ground Booking",
    description: "View available slots and book online. Requests go to admin for approval with email notifications.",
    color: "#ED1C24",
    image: images.features.booking,
  },
  {
    icon: CreditCard,
    title: "Advance Payment",
    description: "Pay configurable advance (20–30%) online. Remaining balance collected at the stadium.",
    color: "#F7931E",
    image: images.features.payment,
  },
  {
    icon: Clock,
    title: "Slot Management",
    description: "Different slots with flexible pricing. Block unavailable dates and timings easily.",
    color: "#FBB03B",
    image: images.features.slots,
  },
  {
    icon: Mail,
    title: "Email Notifications",
    description: "Automated booking request, approval, and status update emails to customers.",
    color: "#39B54A",
    image: images.features.email,
  },
  {
    icon: Radio,
    title: "Live Match Streaming",
    description: "YouTube unlisted live streams embedded — watch matches directly on the website.",
    color: "#8CC63F",
    image: images.features.live,
  },
  {
    icon: Package,
    title: "Ball Stock Management",
    description: "Track purchased and used balls with full inventory history and reports.",
    color: "#ED1C24",
    image: images.features.inventory,
  },
  {
    icon: Shield,
    title: "Admin Dashboard",
    description: "Manage bookings, customers, slots, payments, inventory, and streams from one place.",
    color: "#F7931E",
    image: images.features.admin,
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Fully responsive design optimized for mobile, tablet, and desktop devices.",
    color: "#39B54A",
    image: images.features.mobile,
  },
];

export function Features() {
  return (
    <section className="py-24 bg-[#0b1219]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-[#F7931E] uppercase tracking-widest">Features</span>
          <h2 className="mt-3 font-[family-name:var(--font-sora)] text-3xl sm:text-4xl font-bold text-white">
            Complete Digital Solution
          </h2>
          <p className="mt-4 text-slate-400">
            Everything you need to run stadium operations — from bookings to live streams.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} hover className="group overflow-hidden p-0">
              <div className="relative h-32 w-full">
                <MediaImage src={feature.image} alt={feature.title} fill className="object-cover" sizes="400px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2736] to-transparent" />
              </div>
              <div className="p-5">
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                </div>
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
