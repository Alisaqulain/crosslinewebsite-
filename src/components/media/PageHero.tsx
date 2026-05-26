import { MediaImage } from "@/components/media/MediaImage";
import { ReactNode } from "react";

interface PageHeroProps {
  badge?: string;
  title: string;
  description?: string;
  image: string;
  children?: ReactNode;
}

export function PageHero({ badge, title, description, image, children }: PageHeroProps) {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden border-b border-white/5">
      <MediaImage src={image} alt="" fill className="object-cover" priority sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070d12]/95 via-[#070d12]/88 to-[#070d12]/70" />
      <div className="absolute inset-0 hero-pattern opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {badge && (
          <span className="text-sm font-semibold text-[#FBB03B] uppercase tracking-widest">{badge}</span>
        )}
        <h1 className="mt-3 font-[family-name:var(--font-sora)] text-4xl sm:text-5xl font-bold text-white max-w-3xl">
          {title}
        </h1>
        {description && <p className="mt-4 text-lg text-slate-300 max-w-2xl">{description}</p>}
        {children}
      </div>
    </section>
  );
}
