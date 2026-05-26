import { Card } from "@/components/ui/Card";
import { stadiumInfo } from "@/lib/data";
import { images, videos } from "@/lib/media";
import { PageHero } from "@/components/media/PageHero";
import { InlineVideo } from "@/components/media/InlineVideo";
import { MediaImage } from "@/components/media/MediaImage";
import { Target, Users, Trophy, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Stadium",
};

const highlights = [
  {
    icon: Trophy,
    title: "Tournament Ready",
    desc: "Host leagues, corporate matches, and academy tournaments.",
    image: images.about.tournament,
  },
  {
    icon: Zap,
    title: "Floodlit Nights",
    desc: "Evening and night sessions with professional floodlighting.",
    image: images.about.floodlit,
  },
  {
    icon: Users,
    title: "Team Friendly",
    desc: "Changing rooms, seating, and parking for full squads.",
    image: images.about.facilities,
  },
  {
    icon: Target,
    title: "Quality Pitch",
    desc: "Maintained turf with regular rolling and professional care.",
    image: images.about.qualityPitch,
  },
];

export default function AboutPage() {
  return (
    <div>
      <PageHero
        badge="About Us"
        title={stadiumInfo.name}
        description={stadiumInfo.tagline}
        image={images.about.hero}
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
              <MediaImage src={images.about.story} alt="Stadium facilities" fill className="object-cover" sizes="600px" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-white">Our Story</h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Crossline Cricket Stadium was built with a vision to provide accessible, premium cricket infrastructure for players of all levels. From weekend warriors to competitive leagues, our ground has hosted hundreds of memorable matches.
              </p>
              <p className="mt-4 text-slate-400 leading-relaxed">
                With our new digital platform, booking your slot is easier than ever. Pay advance online, get admin approval, and focus on what matters — playing great cricket.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0b1219]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-[family-name:var(--font-sora)] text-2xl font-bold text-white mb-8">
            Virtual Stadium Tour
          </h2>
          <InlineVideo
            mp4={videos.stadiumTour}
            poster={images.about.hero}
            title="Crossline Cricket Stadium tour"
            className="max-w-4xl mx-auto"
          />
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-[family-name:var(--font-sora)] text-3xl font-bold text-white mb-12">
            Why Choose Crossline?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item) => (
              <Card key={item.title} hover className="overflow-hidden p-0">
                <div className="relative h-36">
                  <MediaImage src={item.image} alt={item.title} fill className="object-cover" sizes="300px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a2736] to-transparent" />
                </div>
                <div className="p-5 text-center">
                  <item.icon className="h-8 w-8 mx-auto text-[#F7931E]" />
                  <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden ring-1 ring-white/10">
              <MediaImage src={images.about.practiceNets} alt="Practice nets" fill className="object-cover" sizes="500px" />
            </div>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden ring-1 ring-white/10">
              <MediaImage src={images.about.pitch} alt="Cricket pitch" fill className="object-cover" sizes="500px" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
