"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHero } from "@/components/media/PageHero";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { LiveScoreboard } from "@/components/score/LiveScoreboard";
import { usePublicData } from "@/hooks/usePublicData";
import { liveMatchVideos } from "@/lib/media";
import { images } from "@/lib/media";
import { Loader2, Radio } from "lucide-react";

export default function LivePage() {
  const { data, loading } = usePublicData(true);
  const stream = data?.liveStream;
  const score = data?.liveScore;
  const showLive = stream?.enabled && stream?.isLive;

  return (
    <div>
      <PageHero
        badge="Live Streaming"
        title="Live Match"
        description="Watch Crossline matches via YouTube unlisted live stream with real-time scoring."
        image={images.live.hero}
      >
        {showLive && (
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-xs font-bold text-red-400 uppercase">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Live Now
          </span>
        )}
      </PageHero>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#F7931E]" />
            </div>
          ) : (
            <>
              <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    <Radio className="h-5 w-5 text-[#ED1C24]" />
                    {stream?.title ?? "Live Stream"}
                  </h2>
                  {showLive ? (
                    <Badge className="!bg-red-500/20 !text-red-400 animate-pulse">LIVE NOW</Badge>
                  ) : (
                    <Badge>Offline</Badge>
                  )}
                </div>
                {showLive && stream?.youtubeUrl ? (
                  <VideoEmbed src={stream.youtubeUrl} title={stream.title} className="rounded-none" />
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center bg-black/50 text-slate-500 gap-2">
                    <Radio className="h-10 w-10 opacity-30" />
                    <p>No live stream at the moment. Check back during match days.</p>
                  </div>
                )}
              </Card>

              {score && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 font-[family-name:var(--font-sora)]">
                    Live Scoreboard
                  </h3>
                  <LiveScoreboard score={score} />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Past Matches & Highlights</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {liveMatchVideos.filter((v) => !v.isLive).map((video) => (
                    <Card key={video.id} className="p-0 overflow-hidden">
                      <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{video.title}</p>
                      </div>
                      <VideoEmbed src={video.embed} title={video.title} className="rounded-none" />
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
