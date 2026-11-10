import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompetitionStore } from "../../stores/competitionStore";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { Trophy, Trash2, ArrowLeft, Save, X } from "lucide-react";
import type { ScheduleMatch } from "../../api/types";

interface ScoreFormState {
  status: string;
  scores: Record<number, string>;
}

export default function HasilPage() {
  const matches = useCompetitionStore((s) => s.matches);
  const loading = useCompetitionStore((s) => s.loading.matches);
  const fetchMatches = useCompetitionStore((s) => s.fetchMatches);

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMatch, setSelectedMatch] = useState<ScheduleMatch | null>(null);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [form, setForm] = useState<ScoreFormState>({
    status: "FINISHED",
    scores: {},
  });

  useEffect(() => {
    void fetchMatches();
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (filterStatus !== "all" && m.status !== filterStatus) return false;
    return true;
  });

  const openScoreForm = (match: ScheduleMatch) => {
    setSelectedMatch(match);
    setForm({
      status: "FINISHED",
      scores: match.participants.reduce((acc, p, i) => {
        acc[i] = p.score || "";
        return acc;
      }, {} as Record<number, string>),
    });
    setShowScoreForm(true);
  };

  const closeScoreForm = () => {
    setShowScoreForm(false);
    setSelectedMatch(null);
  };

  const handleSave = async () => {
    if (!selectedMatch) return;
    try {
      const scoresArray = Object.values(form.scores).map((s) => s.trim());
      const payload = {
        status: form.status,
        scores: scoresArray,
      };
      await fetch(`/api/v1/matches/${selectedMatch.id}/result`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      closeScoreForm();
      void fetchMatches();
    } catch (err) {
      alert("Gagal menyimpan hasil");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pertandingan ini?")) return;
    try {
      await fetch(`/api/v1/matches/${id}`, { method: "DELETE" });
      void fetchMatches();
    } catch (err) {
      alert("Gagal menghapus pertandingan");
    }
  };

  const statusLabels: Record<string, string> = {
    SCHEDULED: "Terjadwal",
    ONGOING: "Sedang Berlangsung",
    FINISHED: "Selesai",
    POSTPONED: "Ditunda",
    CANCELLED: "Dibatalkan",
  };

  return (
    <>
      <SiteHeader />
      <main className="admin-page p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hasil Pertandingan</h1>
          <p className="text-muted-foreground">Inputkan skor dan hasil pertandingan.</p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[180px]">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                  <SelectItem value="ONGOING">Berlangsung</SelectItem>
                  <SelectItem value="FINISHED">Selesai</SelectItem>
                  <SelectItem value="POSTPONED">Ditunda</SelectItem>
                  <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Matches list */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Daftar Pertandingan</h2>
            <span className="text-sm text-muted-foreground">{filteredMatches.length} pertandingan</span>
          </div>

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Memuat data...</p>
          ) : filteredMatches.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Belum ada pertandingan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium text-muted-foreground p-2">Tanggal</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Cabang</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Pertandingan</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Waktu</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Tempat</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Status</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match: ScheduleMatch) => (
                    <tr key={match.id} className="border-b hover:bg-muted/20">
                      <td className="p-2 font-medium">{match.date}</td>
                      <td className="p-2">{match.sport_name}</td>
                      <td className="p-2">{match.title}</td>
                      <td className="p-2 text-muted-foreground">{match.time}</td>
                      <td className="p-2 text-muted-foreground">{match.venue_name}</td>
                      <td className="p-2">
                        <Badge variant={match.status === "FINISHED" ? "default" : "secondary"}>
                          {statusLabels[match.status] || match.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openScoreForm(match)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Trophy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(match.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Score form */}
        {showScoreForm && selectedMatch && (
          <Card className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={closeScoreForm}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="text-lg font-semibold">Input Hasil</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedMatch.sport_name} - {selectedMatch.title}
                  </p>
                </div>
              </div>
              <Badge variant="outline">{statusLabels[selectedMatch.status] || selectedMatch.status}</Badge>
            </div>

            <div className="grid gap-4 mb-6 border-y py-4">
              <div className="flex items-center gap-2 mb-4">
                <Label className="text-lg">Skor</Label>
                <Badge variant="secondary">{selectedMatch.participants.length} partisipan</Badge>
              </div>

              {selectedMatch.participants.map((p: ScheduleMatch["participants"][number], i: number) => (
                <div key={p.id} className="flex items-center gap-4 py-3">
                  <span className="flex-1 font-medium text-sm">
                    {p.contingent_name} - {p.athlete_name}
                  </span>
                  <Input
                    type="text"
                    placeholder="Skor"
                    className="w-32 text-center"
                    value={form.scores[i] || ""}
                    onChange={(e) => {
                      const newScores = { ...form.scores };
                      newScores[i] = e.target.value;
                      setForm({ ...form, scores: newScores });
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[160px]">
                <Label>Status Akhir</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v ?? "FINISHED" })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                    <SelectItem value="ONGOING">Berlangsung</SelectItem>
                    <SelectItem value="FINISHED">Selesai</SelectItem>
                    <SelectItem value="POSTPONED">Ditunda</SelectItem>
                    <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" /> Simpan
                </Button>
                <Button variant="outline" onClick={closeScoreForm}>
                  <X className="h-4 w-4" /> Batal
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
