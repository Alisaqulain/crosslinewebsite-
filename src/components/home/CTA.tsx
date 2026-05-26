import Link from "next/link";
import { MediaImage } from "@/components/media/MediaImage";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/media";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <MediaImage src={images.cta} alt="Team celebration at Crossline" fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070d12]/95 via-[#070d12]/85 to-[#070d12]/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#ED1C24]/10 via-transparent to-[#39B54A]/10" />
      <ScrollReveal className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="font-[family-name:var(--font-sora)] text-3xl sm:text-4xl font-bold text-white">
          Ready to Play at Crossline?
        </h2>
        <p className="mt-4 text-lg text-slate-300">
          Reserve your slot today. Pay advance online and get confirmation after admin approval.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/booking">
            <Button size="lg">
              Book Your Slot
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline">
              Contact Us
            </Button>
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
