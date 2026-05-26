"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { LiveScoreboard } from "@/components/score/LiveScoreboard";
import { fetchAdminStore, patchAdmin } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import type { LiveScore, MatchStatus } from "@/lib/types";
import { Loader2, Save, Plus } from "lucide-react";

const ballOptions = ["0", "1", "2", "3", "4", "6", "W", "Wd", "Nb"];

export default function AdminScoringPage() {
  const { toast } = useToast();
  const [score, setScore] = useState<LiveScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBall, setNewBall] = useState("1");

  useEffect(() => {
    fetchAdminStore().then(({ store }) => {
      setScore(store.liveScore);
      setLoading(false);
    });
  }, []);

  const update = (patch: Partial<LiveScore>) => {
    setScore((s) => (s ? { ...s, ...patch } : s));
  };

  const addBall = () => {
    if (!score) return;
    update({ recentBalls: [...score.recentBalls, newBall].slice(-20) });
  };

  const save = async () => {
    if (!score) return;
    setSaving(true);
    try {
      await patchAdmin("liveScore", score);
      toast("Score updated — website will refresh", "success");
    } catch {
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !score) {
    return (
      <AdminShell title="Live Scoring">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#F7931E]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Live Scoring Management">
      <div className="grid xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="font-semibold text-white">Match Setup</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Team A</Label>
                <Input value={score.teamA} onChange={(e) => update({ teamA: e.target.value })} />
              </div>
              <div>
                <Label>Team B</Label>
                <Input value={score.teamB} onChange={(e) => update({ teamB: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Batting Team</Label>
              <Select value={score.battingTeam} onChange={(e) => update({ battingTeam: e.target.value as "A" | "B" })}>
                <option value="A">{score.teamA}</option>
                <option value="B">{score.teamB}</option>
              </Select>
            </div>
            <div>
              <Label>Match Status</Label>
              <Select value={score.matchStatus} onChange={(e) => update({ matchStatus: e.target.value as MatchStatus })}>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="innings_break">Innings Break</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <div>
              <Label>Target Score</Label>
              <Input type="number" value={score.target ?? ""} onChange={(e) => update({ target: Number(e.target.value) || undefined })} />
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-semibold text-white">Score</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label>Runs</Label>
                <Input type="number" value={score.runs} onChange={(e) => update({ runs: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Wickets</Label>
                <Input type="number" value={score.wickets} onChange={(e) => update({ wickets: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Overs</Label>
                <Input type="number" value={score.overs} onChange={(e) => update({ overs: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Balls</Label>
                <Input type="number" min={0} max={5} value={score.balls} onChange={(e) => update({ balls: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label>Batsman 1</Label>
                <Input value={score.batsman1} onChange={(e) => update({ batsman1: e.target.value })} />
              </div>
              <div>
                <Label>Batsman 2</Label>
                <Input value={score.batsman2} onChange={(e) => update({ batsman2: e.target.value })} />
              </div>
              <div>
                <Label>Bowler</Label>
                <Input value={score.bowler} onChange={(e) => update({ bowler: e.target.value })} />
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-semibold text-white">Recent Balls</h2>
            <div className="flex gap-2">
              <Select value={newBall} onChange={(e) => setNewBall(e.target.value)} className="w-24">
                {ballOptions.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
              <Button type="button" variant="outline" onClick={addBall}>
                <Plus className="h-4 w-4" /> Add Ball
              </Button>
            </div>
            <Input
              value={score.recentBalls.join(", ")}
              onChange={(e) =>
                update({
                  recentBalls: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="1, 4, 6, W, 0"
            />
          </Card>

          <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Publish Score Update
          </Button>
        </div>

        <div>
          <p className="text-sm text-slate-500 mb-3">Live Preview</p>
          <LiveScoreboard score={score} />
        </div>
      </div>
    </AdminShell>
  );
}
