import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompetitionStore } from "../../stores/competitionStore";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import AdminNav from "../../components/AdminNav";
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { API_BASE_URL, getAuthHeaders } from "../../api/client";
import type { ScheduleMatch } from "../../api/types";

interface ScoreFormState {
  status: string;
  scores: string[];
  contingent_ids: number[];
  winner_contingent_id: number;
}

export default function HasilPage() {
  const matches = useCompetitionStore((s) => s.matches);
  const sports = useCompetitionStore((s) => s.sports);
  const contingents = useCompetitionStore((s) => s.contingents);
  const loading = useCompetitionStore((s) => s.loading.matches);
  const fetchMatches = useCompetitionStore((s) => s.fetchMatches);
  const fetchSports = useCompetitionStore((s) => s.fetchSports);
  const fetchContingents = useCompetitionStore((s) => s.fetchContingents);
  const updateMatch = useCompetitionStore((s) => s.updateMatch);
  const updateMatchContingents = useCompetitionStore((s) => s.updateMatchContingents);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSport, setFilterSport] = useState("all");
  const [selectedMatch, setSelectedMatch] = useState<ScheduleMatch | null>(null);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [form, setForm] = useState<ScoreFormState>({
    status: "FINISHED",
    scores: ["", ""],
    contingent_ids: [0, 0],
    winner_contingent_id: 0,
  });

  useEffect(() => {
    void fetchMatches();
    void fetchSports();
    void fetchContingents();
  }, [fetchContingents, fetchMatches, fetchSports]);

  const filteredMatches = matches.filter((m) => {
    if (filterStatus !== "all" && m.status !== filterStatus) return false;
    if (filterSport !== "all" && m.sport_name !== filterSport) return false;
    return true;
  });

  const openScoreForm = (match: ScheduleMatch) => {
    setFeedbackMsg("");
    setSelectedMatch(match);
    const parts = match.participants || [];
    const winner = parts.find((p) => p.is_winner);
    setForm({
      status: "FINISHED",
      scores:
        parts.length >= 2
          ? parts.map((p) => p.score || "")
          : [parts[0]?.score || "", parts[1]?.score || ""],
      contingent_ids:
        parts.length >= 2
          ? parts.map((p) => p.contingent_id || 0)
          : [parts[0]?.contingent_id || 0, parts[1]?.contingent_id || 0],
      winner_contingent_id: winner?.contingent_id || 0,
    });
    setShowScoreForm(true);
  };

  const closeScoreForm = () => {
    setShowScoreForm(false);
    setSelectedMatch(null);
  };

  const handleSave = async () => {
    if (!selectedMatch) return;
    const filledPairs = form.contingent_ids
      .map((cid, idx) => ({ cid, score: (form.scores[idx] ?? "").trim() }))
      .filter((item) => item.cid > 0);
    const uniqueIds = new Set(filledPairs.map((item) => item.cid));
    if (filledPairs.length < 2 || uniqueIds.size !== filledPairs.length) {
      alert("Pilih minimal 2 kontingen yang berbeda (tidak boleh ada kontingen ganda).");
      return;
    }

    const nextContingentIds = filledPairs.map((item) => item.cid);
    const nextScores = filledPairs.map((item) => item.score);
    const origContingentIds = (selectedMatch.participants || []).map((p) => p.contingent_id);
    const contingentsChanged =
      origContingentIds.length !== nextContingentIds.length ||
      origContingentIds.some((cid, idx) => cid !== nextContingentIds[idx]);

    try {
      if (contingentsChanged) {
        await updateMatchContingents(selectedMatch.id, nextContingentIds);
      }

      await updateMatch(selectedMatch.id, {
        status: form.status,
        scores: nextScores,
        winner_contingent_id: form.winner_contingent_id,
      });

      setFeedbackMsg(
        `Hasil pertandingan "${selectedMatch.sport_name} - ${selectedMatch.title}" berhasil disimpan! Klasemen grup, bagan penyisihan, dan perolehan medali di web utama telah diperbarui otomatis.`,
      );
      closeScoreForm();
    } catch {
      alert("Gagal menyimpan hasil pertandingan.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pertandingan ini?")) return;
    try {
      await fetch(`${API_BASE_URL}/matches/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      void fetchMatches();
    } catch {
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

  const getContingentName = (cid: number, idx: number) =>
    contingents.find((c) => c.id === cid)?.name ||
    selectedMatch?.participants[idx]?.contingent_name ||
    `Kontingen ${idx + 1}`;

  return (
    <>
      <SiteHeader />
      <main className="admin-page p-6 space-y-6 max-w-7xl mx-auto">
        <AdminNav />

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Input Hasil Pertandingan, Skor &amp; Pemenang
          </h1>
          <p className="text-muted-foreground">
            Setiap hasil pertandingan yang diselesaikan otomatis memperbarui Klasemen Grup, Bagan Penyisihan (Perempat Final, Semifinal, Final), serta Klasemen Perolehan Medali di web utama.
          </p>
        </div>

        {feedbackMsg && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Score form modal / card */}
        {showScoreForm && selectedMatch && (
          <Card className="p-6 border-2 border-primary shadow-lg">
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
                  <h2 className="text-lg font-bold">
                    Input Skor &amp; Pemenang: {selectedMatch.sport_name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedMatch.event_name} · {selectedMatch.title} (Babak:{" "}
                    <strong>{selectedMatch.round_name || "Penyisihan"}</strong>)
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {statusLabels[selectedMatch.status] || selectedMatch.status}
              </Badge>
            </div>

            <div className="grid gap-4 mb-6 border-y py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {form.contingent_ids.map((cid, idx) => (
                  <div key={idx} className="rounded-lg border p-4 space-y-3 bg-muted/10">
                    <div className="flex items-center justify-between gap-2">
                      <Label className="font-semibold">
                        Kontingen {idx + 1}
                        {form.contingent_ids.length === 2
                          ? idx === 0
                            ? " (Tim Rumah)"
                            : " (Tim Lawan)"
                          : ""}
                      </Label>
                      {form.contingent_ids.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-destructive hover:text-destructive"
                          onClick={() =>
                            setForm({
                              ...form,
                              contingent_ids: form.contingent_ids.filter((_, i) => i !== idx),
                              scores: form.scores.filter((_, i) => i !== idx),
                              winner_contingent_id:
                                form.winner_contingent_id === cid ? 0 : form.winner_contingent_id,
                            })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <Select
                      value={cid ? String(cid) : ""}
                      onValueChange={(v) => {
                        const nextIds = [...form.contingent_ids];
                        nextIds[idx] = Number(v);
                        setForm({ ...form, contingent_ids: nextIds });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Pilih Kontingen ${idx + 1}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {contingents.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center justify-between gap-3">
                      <Label>Skor / Catatan Waktu:</Label>
                      <Input
                        type="text"
                        placeholder={idx === 0 ? "Contoh: 2 atau 21-18" : "Contoh: 1 atau 18-21"}
                        className="w-40 text-center font-bold text-base"
                        value={form.scores[idx] ?? ""}
                        onChange={(e) => {
                          const nextScores = [...form.scores];
                          nextScores[idx] = e.target.value;
                          setForm({ ...form, scores: nextScores });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    setForm({
                      ...form,
                      contingent_ids: [...form.contingent_ids, 0],
                      scores: [...form.scores, ""],
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Kontingen
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="grid gap-2">
                  <Label>Penentuan Pemenang Pertandingan</Label>
                  <Select
                    value={String(form.winner_contingent_id)}
                    onValueChange={(v) =>
                      setForm({ ...form, winner_contingent_id: Number(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">
                        Otomatis dari Skor (atau Seri jika skor sama)
                      </SelectItem>
                      {form.contingent_ids.map(
                        (cid, idx) =>
                          cid > 0 && (
                            <SelectItem key={`${cid}-${idx}`} value={String(cid)}>
                              🏆 Pemenang: {getContingentName(cid, idx)}
                            </SelectItem>
                          ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Status Akhir Pertandingan</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm({ ...form, status: v ?? "FINISHED" })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FINISHED">
                        Selesai (Update Klasemen, Bagan &amp; Medali)
                      </SelectItem>
                      <SelectItem value="ONGOING">
                        Sedang Berlangsung (Update Skor Live)
                      </SelectItem>
                      <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                      <SelectItem value="POSTPONED">Ditunda</SelectItem>
                      <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                * Jika babak adalah <strong>Fase Grup</strong>, poin (+3 menang, +1 seri) otomatis masuk klasemen grup. Jika <strong>Perempat Final / Semifinal</strong>, pemenang otomatis maju ke babak berikutnya. Jika <strong>Final / Perebutan Juara 3</strong>, medali Emas/Perak/Perunggu otomatis tercatat.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => void handleSave()} className="gap-2">
                  <Save className="h-4 w-4" /> Simpan Hasil &amp; Pemenang
                </Button>
                <Button variant="outline" onClick={closeScoreForm}>
                  <X className="h-4 w-4" /> Batal
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[180px]">
              <Label>Cabang Olahraga</Label>
              <Select
                value={filterSport}
                onValueChange={(v) => setFilterSport(v ?? "all")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  {sports.map((sp) => (
                    <SelectItem key={sp.id} value={sp.name}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <Label>Status</Label>
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v ?? "all")}
              >
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
            <span className="text-sm text-muted-foreground">
              {filteredMatches.length} pertandingan
            </span>
          </div>

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Memuat data...</p>
          ) : filteredMatches.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Belum ada pertandingan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium text-muted-foreground p-2">Tanggal &amp; Jam</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Cabang &amp; Nomor</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Babak / Fase</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Hasil &amp; Pemenang</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Tempat</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Status</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match: ScheduleMatch) => {
                    const parts = match.participants || [];
                    return (
                      <tr key={match.id} className="border-b hover:bg-muted/20">
                        <td className="p-2 font-medium whitespace-nowrap">
                          <div>{match.date}</div>
                          <div className="text-xs text-muted-foreground">{match.time} WIB</div>
                        </td>
                        <td className="p-2">
                          <div className="font-semibold">{match.sport_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {match.event_name} · {match.title}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{match.round_name || "Penyisihan"}</Badge>
                        </td>
                        <td className="p-2">
                          {parts.length > 0 ? (
                            <div className="space-y-1">
                              {parts.map((p, idx) => (
                                <div key={`${p.contingent_id}-${idx}`} className="flex items-center gap-2">
                                  <span className={p.is_winner ? "font-bold text-emerald-700" : ""}>
                                    {p.contingent_name || "TBA"}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    {p.score || "–"}
                                  </Badge>
                                  {p.is_winner && (
                                    <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">
                                      Pemenang
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Belum diatur</span>
                          )}
                        </td>
                        <td className="p-2 text-muted-foreground text-xs">{match.venue_name}</td>
                        <td className="p-2">
                          <Badge variant={match.status === "FINISHED" ? "default" : "secondary"}>
                            {statusLabels[match.status] || match.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1.5">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openScoreForm(match)}
                              className="gap-1.5 text-xs"
                            >
                              <Trophy className="h-3.5 w-3.5" /> Input Hasil
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleDelete(match.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
