import { cn } from "@/lib/utils";

interface VideoEmbedProps {
  src: string;
  title: string;
  className?: string;
}

export function VideoEmbed({ src, title, className }: VideoEmbedProps) {
  return (
    <div className={cn("aspect-video bg-black rounded-xl overflow-hidden", className)}>
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
