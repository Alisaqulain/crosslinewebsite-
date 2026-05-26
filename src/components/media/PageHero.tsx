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
    <section className="relative py-20 sm:py-24 overflow-hidden border-b border-[var(--border)]">
      <MediaImage src={image} alt="" fill className="object-cover" priority sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy)]/95 via-[var(--navy-mid)]/90 to-[var(--navy)]/75" />
      <div className="absolute inset-0 hero-pattern opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {badge && (
          <span className="text-sm font-bold text-[var(--cricket-green-light)] uppercase tracking-widest">{badge}</span>
        )}
        <h1 className="mt-3 font-[family-name:var(--font-sora)] text-4xl sm:text-5xl font-bold text-white max-w-3xl">
          {title}
        </h1>
        {description && <p className="mt-4 text-lg text-slate-200 max-w-2xl">{description}</p>}
        {children}
      </div>
    </section>
  );
}
