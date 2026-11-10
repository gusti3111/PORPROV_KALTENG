import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompetitionStore } from "../../stores/competitionStore";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { ArrowLeft, Save, X, Edit3, Trash2 } from "lucide-react";
import type { BracketMatch } from "../../api/types";

interface BracketFormState {
  home_score: string;
  away_score: string;
  status: string;
}

export default function BaganPage() {
  const sports = useCompetitionStore((s) => s.sports);
  const fetchSports = useCompetitionStore((s) => s.fetchSports);
  const fetchMatches = useCompetitionStore((s) => s.fetchMatches);

  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [bracketMatches, setBracketMatches] = useState<BracketMatch[]>([]);
  const [loadingBracket, setLoadingBracket] = useState(false);

  const [editingMatch, setEditingMatch] = useState<BracketMatch | null>(null);
  const [form, setForm] = useState<BracketFormState>({
    home_score: "",
    away_score: "",
    status: "SCHEDULED",
  });

  useEffect(() => {
    void fetchSports();
    void fetchMatches();
  }, [fetchSports, fetchMatches]);

  useEffect(() => {
    if (selectedSportId === null) {
      setBracketMatches([]);
      return;
    }
    const load = async () => {
      setLoadingBracket(true);
      try {
        const res = await fetch(`/api/v1/brackets/${selectedSportId}`);
        if (res.ok) {
          const data = await res.json();
          setBracketMatches(data.matches || []);
        }
      } catch {
        alert("Gagal memuat bagan");
      } finally {
        setLoadingBracket(false);
      }
    };
    load();
  }, [selectedSportId]);

  const openEditForm = (match: BracketMatch) => {
    setEditingMatch(match);
    setForm({
      home_score: match.home_score ? String(match.home_score) : "",
      away_score: match.away_score ? String(match.away_score) : "",
      status: match.status,
    });
  };

  const closeEditForm = () => {
    setEditingMatch(null);
    setForm({ home_score: "", away_score: "", status: "SCHEDULED" });
  };

  const handleSave = async () => {
    if (!editingMatch) return;
    try {
      const payload = {
        home_score: form.home_score ? Number(form.home_score) : null,
        away_score: form.away_score ? Number(form.away_score) : null,
        status: form.status,
      };
      await fetch(`/api/v1/brackets/${editingMatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      closeEditForm();
      void fetchMatches();
    } catch {
      alert("Gagal menyimpan bagan");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus pertandingan bagan ini?")) return;
    try {
      await fetch(`/api/v1/brackets/${id}`, { method: "DELETE" });
      void fetchMatches();
    } catch {
      alert("Gagal menghapus");
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      SCHEDULED: "Terjadwal",
      ONGOING: "Berlangsung",
      FINISHED: "Selesai",
      POSTPONED: "Ditunda",
      CANCELLED: "Dibatalkan",
    };
    return labels[status] || status;
  };

  return (
    <>
      <SiteHeader />
      <main className="admin-page p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bagan Pertandingan</h1>
          <p className="text-muted-foreground">Kelola bagan pertandingan per cabang.</p>
        </div>

        {/* Sport selector */}
        <Card className="p-4">
          <Label>Pilih Cabang</Label>
          <Select
            value={selectedSportId ? String(selectedSportId) : "none"}
            onValueChange={(v) => setSelectedSportId(v === "none" ? null : Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Cabang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Semua Cabang</SelectItem>
              {sports.map((sp) => (
                <SelectItem key={sp.id} value={String(sp.id)}>{sp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Bracket list */}
        {loadingBracket ? (
          <Card className="p-4">
            <p className="text-center py-8 text-muted-foreground">Memuat bagan...</p>
          </Card>
        ) : bracketMatches.length === 0 ? (
          <Card className="p-4">
            <p className="text-center py-8 text-muted-foreground">
              {selectedSportId === null ? "Pilih cabang untuk melihat bagan." : "Tidak ada data bagan."}
            </p>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Bagan {sports.find((s) => s.id === selectedSportId)?.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSportId(null)}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {bracketMatches.map((match: BracketMatch) => (
                <div key={match.id} className="border rounded-lg p-4 hover:bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditForm(match)}
                      className="text-primary"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(match.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <h3 className="text-sm font-semibold">{match.round_name} #{match.match_order}</h3>
                    <span className="text-xs text-muted-foreground ml-auto">{getStatusLabel(match.status)}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Tim Rumah</Label>
                      <p className="font-medium">{match.home_name}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Skor</Label>
                      <Input
                        type="text"
                        className="text-center w-20"
                        value={editingMatch?.id === match.id ? (form.home_score || "") : match.home_score?.toString() || ""}
                        onChange={(e) => {
                          if (editingMatch?.id === match.id) {
                            const newScores = { ...form, home_score: e.target.value };
                            setForm(newScores);
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Skor</Label>
                      <Input
                        type="text"
                        className="text-center w-20"
                        value={editingMatch?.id === match.id ? (form.away_score || "") : match.away_score?.toString() || ""}
                        onChange={(e) => {
                          if (editingMatch?.id === match.id) {
                            const newScores = { ...form, away_score: e.target.value };
                            setForm(newScores);
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Tim Lawan</Label>
                      <p className="font-medium">{match.away_name}</p>
                    </div>
                  </div>

                  {editingMatch?.id === match.id && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="gap-1"
                      >
                        <Save className="h-3 w-3" /> Simpan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={closeEditForm}
                      >
                        <X className="h-3 w-3" /> Batal
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
