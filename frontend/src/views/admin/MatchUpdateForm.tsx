import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { useCompetitionStore } from "../../stores/competitionStore";
import type { MatchStatus } from "../../api/types";
import { ArrowLeft, Save, CheckCircle2, Zap } from "lucide-react";

export default function MatchUpdateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const matches = useCompetitionStore((state) => state.matches);
  const updateMatch = useCompetitionStore((state) => state.updateMatch);

  const match = matches.find((m) => m.id === id);
  const [status, setStatus] = useState<MatchStatus>(match?.status || "SCHEDULED");
  const [scores, setScores] = useState(
    match?.participants.map((p) => p.score || "") || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = (value: MatchStatus | null) => {
    setStatus(value === null ? "SCHEDULED" : value);
  };

  if (!match) return <div className="p-10 text-center">Pertandingan tidak ditemukan.</div>;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMatch(id!, { status, scores });
      alert("✅ Sukses! Skor disimpan, bagan dan klasemen otomatis diperbarui.");
      navigate("/admin");
    } catch (error) {
      console.error("Failed to save:", error);
      alert("❌ Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="admin-page p-6 max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Button>

        <Card className="p-6 gap-6 flex flex-col shadow-lg border-t-4 border-t-primary">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">Update Pertandingan</h1>
              <p className="text-muted-foreground">{match.sport_name} - {match.title}</p>
            </div>
            <Badge variant={status === "FINISHED" ? "default" : "secondary"}>
              {status}
            </Badge>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="font-semibold">Status Pertandingan</Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">📅 Terjadwal</SelectItem>
                  <SelectItem value="ONGOING">⚽ Sedang Berlangsung</SelectItem>
                  <SelectItem value="FINISHED">🏆 Selesai</SelectItem>
                  <SelectItem value="POSTPONED">⏳ Ditunda</SelectItem>
                  <SelectItem value="CANCELLED">❌ Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 py-6 border-y border-dashed">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <Label className="text-lg font-bold">Input Skor Akhir</Label>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {match.participants.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <span className="flex-1 font-medium text-sm sm:text-base">{p.contingent_name}</span>
                    <Input
                      type="text"
                      placeholder="0"
                      className="w-20 text-center font-bold text-lg h-11"
                      value={scores[idx]}
                      onChange={(e) => {
                        const newScores = [...scores];
                        newScores[idx] = e.target.value;
                        setScores(newScores);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-700 flex gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>
                Jika status diubah menjadi <strong>"Selesai"</strong>, sistem akan otomatis:
                <ul className="list-disc ml-4 mt-1">
                  <li>Menentukan pemenang pertandingan.</li>
                  <li>Memindahkan pemenang ke babak selanjutnya di bagan.</li>
                  <li>Menambahkan poin ke klasemen grup.</li>
                </ul>
              </p>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="gap-2 py-6 text-lg font-bold transition-all hover:scale-[1.02] active:scale-95"
            >
              {isSaving ? (
                "Menyimpan..."
              ) : (
                <>
                  <Save className="h-5 w-5" /> Simpan & Update Otomatis
                </>
              )}
            </Button>
          </div>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
