import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import SportBracket from "../../components/SportBracket";
import {
  ArrowRight,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Plus,
  Save,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { API_BASE_URL, getAPIData } from "../../api/client";
import { getContingentLogoUrl } from "../../utils/contingentLogo";
import {
  calculateStandingPoints,
  decodeScoreFromStanding,
  decodeTimeSecondsFromStanding,
  encodeScoreToStanding,
  encodeTimeSecondsToStanding,
  formatGroupDisplayName,
  formatStandingPrimaryMetric,
  getSportScoringRule,
} from "../../utils/sportScoringConfig";
import type {
  BracketMatch,
  SportTournament,
  SportTournamentStanding,
} from "../../api/types";

interface BracketFormState {
  home_contingent_id: number;
  away_contingent_id: number;
  home_score: string;
  away_score: string;
  status: string;
}

interface StandingFormState {
  group_code: string;
  contingent_id: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
}

const ROUND_LABELS: Record<string, string> = {
  QUARTERFINAL: "Perempat Final",
  SEMIFINAL: "Semifinal",
  THIRD_PLACE: "Perebutan Juara 3",
  FINAL: "Final",
};

export default function BaganPage() {
  const sports = useCompetitionStore((s) => s.sports);
  const contingents = useCompetitionStore((s) => s.contingents);
  const fetchSports = useCompetitionStore((s) => s.fetchSports);
  const fetchContingents = useCompetitionStore((s) => s.fetchContingents);
  const fetchMatches = useCompetitionStore((s) => s.fetchMatches);
  const fetchMedalStandings = useCompetitionStore((s) => s.fetchMedalStandings);
  const fetchSportMedalStandings = useCompetitionStore(
    (s) => s.fetchSportMedalStandings,
  );

  const matches = useCompetitionStore((s) => s.matches);
  const [selectedSportId, setSelectedSportId] = useState<number>(0);
  const [bracketMatches, setBracketMatches] = useState<BracketMatch[]>([]);
  const [tournament, setTournament] = useState<SportTournament | null>(null);
  const [loadingBracket, setLoadingBracket] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [editingMatch, setEditingMatch] = useState<BracketMatch | null>(null);
  const [form, setForm] = useState<BracketFormState>({
    home_contingent_id: 0,
    away_contingent_id: 0,
    home_score: "",
    away_score: "",
    status: "FINISHED",
  });

  const [standingForm, setStandingForm] = useState<StandingFormState>({
    group_code: "A",
    contingent_id: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    points: 0,
  });
  const [volleyWon32, setVolleyWon32] = useState<number>(0);
  const [volleyLost23, setVolleyLost23] = useState<number>(0);
  const [timeInputSeconds, setTimeInputSeconds] = useState<string>("");
  const [scoreInputValue, setScoreInputValue] = useState<string>("");

  useEffect(() => {
    void fetchSports();
    void fetchContingents();
    void fetchMatches();
  }, [fetchContingents, fetchMatches, fetchSports]);

  useEffect(() => {
    if (selectedSportId > 0) return;
    const matchWithSport = matches.find((m) => m.sport_id && m.sport_id > 0);
    if (matchWithSport?.sport_id) {
      setSelectedSportId(matchWithSport.sport_id);
    } else if (sports.length > 0) {
      setSelectedSportId(sports[0].id);
    }
  }, [matches, sports, selectedSportId]);

  const loadSportTournamentData = useCallback(async (sportId: number) => {
    setLoadingBracket(true);
    try {
      const [bracketData, tourData] = await Promise.all([
        getAPIData<{ sport_id: number; matches: BracketMatch[] }>(
          `/brackets/${sportId}`,
        ),
        getAPIData<SportTournament>(`/sports/${sportId}/tournament`),
      ]);
      setBracketMatches(bracketData.matches || []);
      setTournament(tourData);
    } catch {
      setBracketMatches([]);
      setTournament(null);
    } finally {
      setLoadingBracket(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSportId > 0) {
      void loadSportTournamentData(selectedSportId);
    }
  }, [loadSportTournamentData, selectedSportId]);

  const openEditForm = (match: BracketMatch) => {
    setFeedbackMsg("");
    setEditingMatch(match);
    setForm({
      home_contingent_id: match.home_contingent_id ?? 0,
      away_contingent_id: match.away_contingent_id ?? 0,
      home_score: match.home_score !== null && match.home_score !== undefined ? String(match.home_score) : "",
      away_score: match.away_score !== null && match.away_score !== undefined ? String(match.away_score) : "",
      status: match.status === "SCHEDULED" ? "FINISHED" : match.status,
    });
  };

  const closeEditForm = () => {
    setEditingMatch(null);
    setForm({
      home_contingent_id: 0,
      away_contingent_id: 0,
      home_score: "",
      away_score: "",
      status: "SCHEDULED",
    });
  };

  const handleSaveBracketMatch = async () => {
    if (!editingMatch) return;
    try {
      const payload = {
        round_name: editingMatch.round_name,
        home_contingent_id:
          form.home_contingent_id > 0 ? form.home_contingent_id : null,
        away_contingent_id:
          form.away_contingent_id > 0 ? form.away_contingent_id : null,
        home_score: form.home_score !== "" ? Number(form.home_score) : null,
        away_score: form.away_score !== "" ? Number(form.away_score) : null,
        status: form.status,
      };
      const res = await fetch(`${API_BASE_URL}/brackets/${editingMatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to update bracket match");
      }
      closeEditForm();
      await Promise.all([
        loadSportTournamentData(selectedSportId),
        fetchMatches(),
        fetchMedalStandings(),
        fetchSportMedalStandings(),
      ]);
      setFeedbackMsg(
        `Bagan "${editingMatch.label}" berhasil diperbarui! Pemenang otomatis dimajukan ke babak selanjutnya dan disinkronkan ke web utama.`,
      );
    } catch {
      alert("Gagal menyimpan pertandingan bagan.");
    }
  };

  const handleSaveStanding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standingForm.contingent_id) {
      alert("Pilih kontingen terlebih dahulu.");
      return;
    }

    let payload = { ...standingForm };
    if (scoringRule.tableType === "TIME_LEADERBOARD") {
      const secs = Number(timeInputSeconds.replace(",", "."));
      if (!secs || secs <= 0) {
        alert("Masukkan catatan waktu yang valid dalam detik (mis. 10.45).");
        return;
      }
      const encoded = encodeTimeSecondsToStanding(secs);
      payload = {
        ...standingForm,
        ...encoded,
      };
    } else if (scoringRule.tableType === "SCORE_LEADERBOARD") {
      const scoreVal = Number(scoreInputValue.replace(",", "."));
      if (Number.isNaN(scoreVal) || scoreVal < 0) {
        alert("Masukkan nilai / skor yang valid (mis. 85.50).");
        return;
      }
      const encoded = encodeScoreToStanding(scoreVal);
      payload = {
        ...standingForm,
        ...encoded,
      };
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/sports/${selectedSportId}/standings`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        throw new Error("Failed to update standing");
      }
      await loadSportTournamentData(selectedSportId);
      setFeedbackMsg(
        `${scoringRule.sectionTitle} (${scoringRule.groupLabel} ${standingForm.group_code}) berhasil diperbarui dan diurutkan otomatis di web utama!`,
      );
    } catch {
      alert("Gagal menyimpan data klasemen.");
    }
  };

  const handleEditStandingRow = (
    groupCode: string,
    row: SportTournamentStanding,
  ) => {
    const foundCont = contingents.find(
      (c) => c.id === row.contingent_id || c.name === row.contingent,
    );
    if (scoringRule.tableType === "TIME_LEADERBOARD") {
      setTimeInputSeconds(decodeTimeSecondsFromStanding(row).toFixed(2));
    } else if (scoringRule.tableType === "SCORE_LEADERBOARD") {
      setScoreInputValue(String(decodeScoreFromStanding(row)));
    }
    setStandingForm({
      group_code: groupCode,
      contingent_id: foundCont?.id ?? row.contingent_id ?? 0,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      points: row.points,
    });
  };

  const handleDeleteStandingRow = async (
    groupCode: string,
    row: SportTournamentStanding,
  ) => {
    const foundCont = contingents.find(
      (c) => c.id === row.contingent_id || c.name === row.contingent,
    );
    const cid = foundCont?.id ?? row.contingent_id ?? 0;
    if (!cid || !confirm(`Hapus ${row.contingent} dari Grup ${groupCode}?`)) {
      return;
    }
    try {
      await fetch(
        `${API_BASE_URL}/sports/${selectedSportId}/standings?group_code=${groupCode}&contingent_id=${cid}`,
        { method: "DELETE" },
      );
      await loadSportTournamentData(selectedSportId);
    } catch {
      alert("Gagal menghapus kontingen dari grup.");
    }
  };

  const handlePromoteGroupWinners = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/sports/${selectedSportId}/promote-groups`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error("Failed to promote");
      await loadSportTournamentData(selectedSportId);
      setFeedbackMsg(
        "Juara & Runner-up Grup A dan Grup B berhasil dimasukkan otomatis ke Bagan Penyisihan!",
      );
    } catch {
      alert("Gagal mempromosikan juara grup ke bagan.");
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      SCHEDULED: "Terjadwal",
      ONGOING: "Berlangsung",
      FINISHED: "Selesai",
    };
    return labels[status] || status;
  };

  const selectedSportName =
    sports.find((s) => s.id === selectedSportId)?.name || "Cabang Olahraga";
  const scoringRule = getSportScoringRule(selectedSportId, selectedSportName);

  const quarterfinalMatches = bracketMatches.filter(
    (m) => m.round_name === "QUARTERFINAL",
  );
  const semifinalMatches = bracketMatches.filter(
    (m) => m.round_name === "SEMIFINAL",
  );
  const finalAndThirdMatches = bracketMatches.filter(
    (m) => m.round_name === "FINAL" || m.round_name === "THIRD_PLACE",
  );

  const renderBracketMatchCard = (match: BracketMatch) => {
    const isEditing = editingMatch?.id === match.id;
    const homeWon =
      match.status === "FINISHED" &&
      match.home_score !== null &&
      match.away_score !== null &&
      match.home_score > match.away_score;
    const awayWon =
      match.status === "FINISHED" &&
      match.home_score !== null &&
      match.away_score !== null &&
      match.away_score > match.home_score;

    return (
      <div
        key={match.id}
        className={`rounded-xl border p-4 transition-colors ${isEditing
          ? "border-2 border-primary bg-primary/5 shadow-md"
          : "bg-card hover:bg-muted/20"
          }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {ROUND_LABELS[match.round_name] || match.round_name}
            </Badge>
            <h4 className="text-sm font-bold">{match.label}</h4>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={match.status === "FINISHED" ? "default" : "secondary"}
            >
              {getStatusLabel(match.status)}
            </Badge>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditForm(match)}
                className="h-7 gap-1 text-xs"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Skor
              </Button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-lg border bg-background p-3">
                <Label className="text-xs font-semibold">
                  Kontingen 1 (Tim Rumah)
                </Label>
                <Select
                  value={
                    form.home_contingent_id
                      ? String(form.home_contingent_id)
                      : ""
                  }
                  onValueChange={(v) =>
                    setForm({ ...form, home_contingent_id: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kontingen 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {contingents.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs">Skor:</Label>
                  <Input
                    type="number"
                    min={0}
                    className="w-24 text-center font-bold"
                    value={form.home_score}
                    onChange={(e) =>
                      setForm({ ...form, home_score: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-lg border bg-background p-3">
                <Label className="text-xs font-semibold">
                  Kontingen 2 (Tim Lawan)
                </Label>
                <Select
                  value={
                    form.away_contingent_id
                      ? String(form.away_contingent_id)
                      : ""
                  }
                  onValueChange={(v) =>
                    setForm({ ...form, away_contingent_id: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kontingen 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {contingents.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs">Skor:</Label>
                  <Input
                    type="number"
                    min={0}
                    className="w-24 text-center font-bold"
                    value={form.away_score}
                    onChange={(e) =>
                      setForm({ ...form, away_score: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Status:</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v ?? "FINISHED" })
                  }
                >
                  <SelectTrigger className="w-44 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FINISHED">
                      Selesai (Majukan Pemenang)
                    </SelectItem>
                    <SelectItem value="ONGOING">Sedang Berlangsung</SelectItem>
                    <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => void handleSaveBracketMatch()}
                  className="gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" /> Simpan &amp; Update Bagan
                </Button>
                <Button size="sm" variant="outline" onClick={closeEditForm}>
                  <X className="h-3.5 w-3.5" /> Batal
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${homeWon
                ? "border-emerald-300 bg-emerald-50 font-bold text-emerald-900"
                : "bg-background"
                }`}
            >
              <span className="inline-flex items-center gap-2 text-sm truncate">
                {getContingentLogoUrl(match.home_name, match.home_contingent_id) && (
                  <img
                    src={getContingentLogoUrl(match.home_name, match.home_contingent_id)!}
                    alt={`Logo ${match.home_name}`}
                    className="h-5 w-5 shrink-0 object-contain"
                  />
                )}
                <span className="truncate">
                  {match.home_name || "TBA"}
                  {homeWon ? " 🏆" : ""}
                </span>
              </span>
              <span className="text-base font-extrabold tabular-nums">
                {match.home_score ?? "–"}
              </span>
            </div>
            <div
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${awayWon
                ? "border-emerald-300 bg-emerald-50 font-bold text-emerald-900"
                : "bg-background"
                }`}
            >
              <span className="inline-flex items-center gap-2 text-sm truncate">
                {getContingentLogoUrl(match.away_name, match.away_contingent_id) && (
                  <img
                    src={getContingentLogoUrl(match.away_name, match.away_contingent_id)!}
                    alt={`Logo ${match.away_name}`}
                    className="h-5 w-5 shrink-0 object-contain"
                  />
                )}
                <span className="truncate">
                  {match.away_name || "TBA"}
                  {awayWon ? " 🏆" : ""}
                </span>
              </span>
              <span className="text-base font-extrabold tabular-nums">
                {match.away_score ?? "–"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <SiteHeader />
      <main className="admin-page p-6 space-y-6 max-w-7xl mx-auto">
        <AdminNav />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kelola Klasemen Fase Grup &amp; Bagan Penyisihan (Perempat Final – Final)
            </h1>
            <p className="text-muted-foreground">
              Atur poin klasemen grup (Grup A &amp; Grup B) serta bagan gugur (Perempat Final, Semifinal, Perebutan Juara 3, dan Final) yang langsung terupdate di halaman Bagan &amp; Detail Cabor.
            </p>
          </div>
          <Link to={`/cabor/${selectedSportId}`}>
            <Button variant="outline" className="gap-2">
              Lihat Halaman Publik {selectedSportName}{" "}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
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

        {/* Sport selector */}
        <Card className="p-4 border-l-4 border-l-primary space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex-1 min-w-[260px] space-y-1.5">
              <Label className="text-base font-bold">
                Pilih Cabang Olahraga (32 Cabor Resmi PORPROV XIII)
              </Label>
              <Select
                value={String(selectedSportId)}
                onValueChange={(v) => {
                  const nextId = Number(v);
                  const nextSport = sports.find((s) => s.id === nextId);
                  const nextRule = getSportScoringRule(nextId, nextSport?.name);
                  setSelectedSportId(nextId);
                  setVolleyWon32(0);
                  setVolleyLost23(0);
                  setStandingForm((prev) => ({
                    ...prev,
                    drawn: nextRule.allowDraw ? prev.drawn : 0,
                    points: calculateStandingPoints(
                      nextRule,
                      prev.won,
                      nextRule.allowDraw ? prev.drawn : 0,
                      prev.lost,
                    ),
                  }));
                }}
              >
                <SelectTrigger className="w-full h-11 font-semibold">
                  <SelectValue placeholder="Pilih Cabang Olahraga" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((sp) => (
                    <SelectItem key={sp.id} value={String(sp.id)}>
                      {sp.id}. {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handlePromoteGroupWinners()}
              className="gap-2"
            >
              <Trophy className="h-4 w-4" /> Loloskan Juara &amp; Runner-Up Grup ke Bagan
            </Button>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {scoringRule.badgeLabel}
                </Badge>
                <span className="text-xs font-bold text-foreground">
                  {scoringRule.shortRule}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {scoringRule.description}
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              Satuan Skor: {scoringRule.scoreUnitLabel}
            </Badge>
          </div>
        </Card>

        {loadingBracket ? (
          <Card className="p-8 text-center text-muted-foreground">
            Memuat klasemen grup dan bagan pertandingan...
          </Card>
        ) : (
          <>
            {/* SECTION 1: FASE KLASEMEN / HEAT WAKTU / SKOR JURI (Disembunyikan jika KNOCKOUT_ONLY) */}
            {scoringRule.tableType !== "KNOCKOUT_ONLY" && (
              <Card className="p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="secondary">
                        {scoringRule.sectionTitle.toUpperCase()} ({scoringRule.badgeLabel})
                      </Badge>
                      {scoringRule.tableType === "TIME_LEADERBOARD" && (
                        <Badge className="bg-sky-600 text-white">
                          Mode Waktu Tercepat (Detik)
                        </Badge>
                      )}
                      {scoringRule.tableType === "SCORE_LEADERBOARD" && (
                        <Badge className="bg-amber-600 text-white">
                          Mode Skor Juri / Nilai Lomba
                        </Badge>
                      )}
                      {scoringRule.tableType === "STANDINGS_NO_DRAW" && (
                        <Badge
                          variant="outline"
                          className="text-amber-700 border-amber-300 bg-amber-50"
                        >
                          Tanpa Hasil Seri
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-xl font-bold">
                      {scoringRule.sectionTitle} – {selectedSportName}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {scoringRule.description}
                    </p>
                  </div>
                </div>

                {/* FORM A: Khusus Cabor Klasemen WAKTU TERCEPAT (Atletik, Akuatik, Dayung, Sepeda, Sepatu Roda, Panjat Tebing) */}
                {scoringRule.tableType === "TIME_LEADERBOARD" ? (
                  <form
                    onSubmit={handleSaveStanding}
                    className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end"
                  >
                    <div className="space-y-1.5">
                      <Label>Heat / Seri Lomba</Label>
                      <Select
                        value={standingForm.group_code}
                        onValueChange={(v) =>
                          setStandingForm({
                            ...standingForm,
                            group_code: v ?? "A",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Heat A (Seri 1)</SelectItem>
                          <SelectItem value="B">Heat B (Seri 2)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 lg:col-span-2">
                      <Label>Kontingen Peserta</Label>
                      <Select
                        value={
                          standingForm.contingent_id
                            ? String(standingForm.contingent_id)
                            : ""
                        }
                        onValueChange={(v) =>
                          setStandingForm({
                            ...standingForm,
                            contingent_id: Number(v),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kontingen" />
                        </SelectTrigger>
                        <SelectContent>
                          {contingents.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Catatan Waktu (Detik)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={0.01}
                        placeholder="Contoh: 10.45"
                        value={timeInputSeconds}
                        onChange={(e) => setTimeInputSeconds(e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="gap-1.5">
                      <Plus className="h-4 w-4" /> Simpan Waktu
                    </Button>
                  </form>
                ) : scoringRule.tableType === "SCORE_LEADERBOARD" ? (
                  /* FORM B: Khusus Cabor SKOR JURI / NILAI LOMBA (Senam, Drumband, Dancesport, Binaraga, Panahan, Bermotor, Aerosport) */
                  <form
                    onSubmit={handleSaveStanding}
                    className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end"
                  >
                    <div className="space-y-1.5">
                      <Label>Sesi / Babak Kualifikasi</Label>
                      <Select
                        value={standingForm.group_code}
                        onValueChange={(v) =>
                          setStandingForm({
                            ...standingForm,
                            group_code: v ?? "A",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Sesi A (Kualifikasi 1)</SelectItem>
                          <SelectItem value="B">Sesi B (Kualifikasi 2)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 lg:col-span-2">
                      <Label>Kontingen Peserta</Label>
                      <Select
                        value={
                          standingForm.contingent_id
                            ? String(standingForm.contingent_id)
                            : ""
                        }
                        onValueChange={(v) =>
                          setStandingForm({
                            ...standingForm,
                            contingent_id: Number(v),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kontingen" />
                        </SelectTrigger>
                        <SelectContent>
                          {contingents.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>{scoringRule.valueColumnLabel}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="Contoh: 85.50"
                        value={scoreInputValue}
                        onChange={(e) => setScoreInputValue(e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="gap-1.5">
                      <Plus className="h-4 w-4" /> Simpan Skor
                    </Button>
                  </form>
                ) : (
                  /* FORM C: Cabor Permainan Grup / Pool (Dengan Seri atau Tanpa Seri) */
                  <form
                    onSubmit={handleSaveStanding}
                    className="rounded-xl border bg-muted/20 p-4 space-y-4"
                  >
                    <div
                      className={`grid gap-4 sm:grid-cols-2 ${
                        scoringRule.allowDraw
                          ? "lg:grid-cols-7"
                          : scoringRule.mode === "GROUP_RACKET_2_0"
                            ? "lg:grid-cols-5"
                            : "lg:grid-cols-6"
                      } items-end`}
                    >
                      <div className="space-y-1.5">
                        <Label>{scoringRule.groupLabel}</Label>
                        <Select
                          value={standingForm.group_code}
                          onValueChange={(v) =>
                            setStandingForm({
                              ...standingForm,
                              group_code: v ?? "A",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">
                              {scoringRule.groupLabel} A
                            </SelectItem>
                            <SelectItem value="B">
                              {scoringRule.groupLabel} B
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 lg:col-span-2">
                        <Label>Kontingen</Label>
                        <Select
                          value={
                            standingForm.contingent_id
                              ? String(standingForm.contingent_id)
                              : ""
                          }
                          onValueChange={(v) =>
                            setStandingForm({
                              ...standingForm,
                              contingent_id: Number(v),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Kontingen" />
                          </SelectTrigger>
                          <SelectContent>
                            {contingents.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label>
                          Menang (M){" "}
                          {scoringRule.mode !== "GROUP_RACKET_2_0" && (
                            <span className="text-[11px] text-muted-foreground">
                              (+{scoringRule.winPoints})
                            </span>
                          )}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={standingForm.won}
                          onChange={(e) => {
                            const won = Math.max(0, Number(e.target.value) || 0);
                            const clampedWon32 = Math.min(volleyWon32, won);
                            if (clampedWon32 !== volleyWon32) {
                              setVolleyWon32(clampedWon32);
                            }
                            setStandingForm({
                              ...standingForm,
                              won,
                              points: calculateStandingPoints(
                                scoringRule,
                                won,
                                standingForm.drawn,
                                standingForm.lost,
                                clampedWon32,
                                volleyLost23,
                              ),
                            });
                          }}
                        />
                      </div>

                      {scoringRule.allowDraw && (
                        <div className="space-y-1.5">
                          <Label>
                            {scoringRule.mode === "SWISS_CHESS"
                              ? "Remis"
                              : "Seri (S)"}{" "}
                            <span className="text-[11px] text-muted-foreground">
                              (+{scoringRule.drawPoints})
                            </span>
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            value={standingForm.drawn}
                            onChange={(e) => {
                              const drawn = Math.max(
                                0,
                                Number(e.target.value) || 0,
                              );
                              setStandingForm({
                                ...standingForm,
                                drawn,
                                points: calculateStandingPoints(
                                  scoringRule,
                                  standingForm.won,
                                  drawn,
                                  standingForm.lost,
                                  volleyWon32,
                                  volleyLost23,
                                ),
                              });
                            }}
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label>
                          Kalah (K){" "}
                          {scoringRule.lossPoints > 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              (+{scoringRule.lossPoints})
                            </span>
                          )}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={standingForm.lost}
                          onChange={(e) => {
                            const lost = Math.max(
                              0,
                              Number(e.target.value) || 0,
                            );
                            const clampedLost23 = Math.min(volleyLost23, lost);
                            if (clampedLost23 !== volleyLost23) {
                              setVolleyLost23(clampedLost23);
                            }
                            setStandingForm({
                              ...standingForm,
                              lost,
                              points: calculateStandingPoints(
                                scoringRule,
                                standingForm.won,
                                standingForm.drawn,
                                lost,
                                volleyWon32,
                                clampedLost23,
                              ),
                            });
                          }}
                        />
                      </div>

                      {scoringRule.mode === "GROUP_RACKET_2_0" ? (
                        <Button type="submit" className="self-end gap-1">
                          <Plus className="h-4 w-4" /> Simpan Pool
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <div className="space-y-1.5 flex-1">
                            <Label>{scoringRule.valueColumnLabel}</Label>
                            <Input
                              type="number"
                              min={0}
                              value={standingForm.points}
                              onChange={(e) =>
                                setStandingForm({
                                  ...standingForm,
                                  points: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <Button type="submit" className="self-end gap-1">
                            <Plus className="h-4 w-4" /> Simpan
                          </Button>
                        </div>
                      )}
                    </div>

                    {scoringRule.mode === "GROUP_VOLLEY" && (
                      <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-dashed">
                        <div className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2 border">
                          <div>
                            <p className="text-xs font-semibold">
                              Dari {standingForm.won} Kemenangan, berapa yang skor setnya 3-2?
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Menang 3-0/3-1 = 3 Poin · Menang 3-2 = 2 Poin
                            </p>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            max={standingForm.won}
                            className="w-20 text-center font-bold h-8"
                            value={volleyWon32}
                            onChange={(e) => {
                              const w32 = Math.min(
                                standingForm.won,
                                Math.max(0, Number(e.target.value) || 0),
                              );
                              setVolleyWon32(w32);
                              setStandingForm((prev) => ({
                                ...prev,
                                points: calculateStandingPoints(
                                  scoringRule,
                                  prev.won,
                                  0,
                                  prev.lost,
                                  w32,
                                  volleyLost23,
                                ),
                              }));
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2 border">
                          <div>
                            <p className="text-xs font-semibold">
                              Dari {standingForm.lost} Kekalahan, berapa yang skor setnya 2-3?
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Kalah 2-3 tetap mendapat 1 Poin · Kalah 0-3/1-3 = 0 Poin
                            </p>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            max={standingForm.lost}
                            className="w-20 text-center font-bold h-8"
                            value={volleyLost23}
                            onChange={(e) => {
                              const l23 = Math.min(
                                standingForm.lost,
                                Math.max(0, Number(e.target.value) || 0),
                              );
                              setVolleyLost23(l23);
                              setStandingForm((prev) => ({
                                ...prev,
                                points: calculateStandingPoints(
                                  scoringRule,
                                  prev.won,
                                  0,
                                  prev.lost,
                                  volleyWon32,
                                  l23,
                                ),
                              }));
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* Tabel Klasemen / Tabel Waktu / Tabel Skor */}
                {tournament &&
                  Array.isArray(tournament.groups) &&
                  tournament.groups.length > 0 && (
                    <div className="grid gap-6 lg:grid-cols-2">
                      {tournament.groups.map((group) => (
                        <div
                          key={group.code}
                          className="rounded-xl border p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-base">
                              {formatGroupDisplayName(scoringRule, group.name)}
                            </h3>
                            <Badge variant="outline">
                              {group.standings.length} Kontingen
                            </Badge>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                {scoringRule.tableType === "TIME_LEADERBOARD" ||
                                scoringRule.tableType === "SCORE_LEADERBOARD" ? (
                                  <tr className="border-b text-xs text-muted-foreground">
                                    <th className="text-left p-2">#</th>
                                    <th className="text-left p-2">Kontingen</th>
                                    <th className="text-center p-2 font-bold">
                                      {scoringRule.valueColumnLabel}
                                    </th>
                                    <th className="text-right p-2">Aksi</th>
                                  </tr>
                                ) : scoringRule.mode === "GROUP_RACKET_2_0" ? (
                                  <tr className="border-b text-xs text-muted-foreground">
                                    <th className="text-left p-2">#</th>
                                    <th className="text-left p-2">Kontingen</th>
                                    <th className="text-center p-2">Main</th>
                                    <th className="text-center p-2 font-bold">
                                      Menang
                                    </th>
                                    <th className="text-center p-2">Kalah</th>
                                    <th className="text-right p-2">Aksi</th>
                                  </tr>
                                ) : scoringRule.tableType ===
                                  "STANDINGS_NO_DRAW" ? (
                                  <tr className="border-b text-xs text-muted-foreground">
                                    <th className="text-left p-2">#</th>
                                    <th className="text-left p-2">Kontingen</th>
                                    <th className="text-center p-2">Main</th>
                                    <th className="text-center p-2">Menang</th>
                                    <th className="text-center p-2">Kalah</th>
                                    <th className="text-center p-2 font-bold">
                                      {scoringRule.valueColumnLabel}
                                    </th>
                                    <th className="text-right p-2">Aksi</th>
                                  </tr>
                                ) : (
                                  <tr className="border-b text-xs text-muted-foreground">
                                    <th className="text-left p-2">#</th>
                                    <th className="text-left p-2">Kontingen</th>
                                    <th className="text-center p-2">Main</th>
                                    <th className="text-center p-2">M</th>
                                    <th className="text-center p-2">
                                      {scoringRule.mode === "SWISS_CHESS"
                                        ? "Remis"
                                        : "S"}
                                    </th>
                                    <th className="text-center p-2">K</th>
                                    <th className="text-center p-2 font-bold">
                                      {scoringRule.valueColumnLabel}
                                    </th>
                                    <th className="text-right p-2">Aksi</th>
                                  </tr>
                                )}
                              </thead>
                              <tbody>
                                {group.standings.map((row) => (
                                  <tr
                                    key={row.contingent}
                                    className="border-b last:border-b-0 hover:bg-muted/20"
                                  >
                                    <td className="p-2 font-bold">
                                      {String(row.rank).padStart(2, "0")}
                                    </td>
                                    <td className="p-2 font-medium">
                                      <span className="inline-flex items-center gap-2">
                                        {getContingentLogoUrl(
                                          row.contingent,
                                          row.contingent_id,
                                        ) && (
                                          <img
                                            src={
                                              getContingentLogoUrl(
                                                row.contingent,
                                                row.contingent_id,
                                              )!
                                            }
                                            alt={`Logo ${row.contingent}`}
                                            className="h-5 w-5 shrink-0 object-contain"
                                          />
                                        )}
                                        <span>{row.contingent}</span>
                                      </span>
                                    </td>

                                    {scoringRule.tableType ===
                                      "TIME_LEADERBOARD" ||
                                    scoringRule.tableType ===
                                      "SCORE_LEADERBOARD" ? (
                                      <td className="p-2 text-center font-extrabold text-primary">
                                        {formatStandingPrimaryMetric(
                                          scoringRule,
                                          row,
                                        )}
                                      </td>
                                    ) : scoringRule.mode ===
                                      "GROUP_RACKET_2_0" ? (
                                      <>
                                        <td className="p-2 text-center">
                                          {row.played}
                                        </td>
                                        <td className="p-2 text-center font-extrabold text-primary">
                                          {row.won}
                                        </td>
                                        <td className="p-2 text-center">
                                          {row.lost}
                                        </td>
                                      </>
                                    ) : scoringRule.tableType ===
                                      "STANDINGS_NO_DRAW" ? (
                                      <>
                                        <td className="p-2 text-center">
                                          {row.played}
                                        </td>
                                        <td className="p-2 text-center">
                                          {row.won}
                                        </td>
                                        <td className="p-2 text-center">
                                          {row.lost}
                                        </td>
                                        <td className="p-2 text-center font-extrabold text-primary">
                                          {row.points}
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="p-2 text-center">
                                          {row.played}
                                        </td>
                                        <td className="p-2 text-center">
                                          {row.won}
                                        </td>
                                        <td className="p-2 text-center">
                                          {row.drawn}
                                        </td>
                                        <td className="p-2 text-center">
                                          {row.lost}
                                        </td>
                                        <td className="p-2 text-center font-extrabold text-primary">
                                          {row.points}
                                        </td>
                                      </>
                                    )}

                                    <td className="p-2 text-right">
                                      <div className="inline-flex gap-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 px-2"
                                          onClick={() =>
                                            handleEditStandingRow(
                                              group.code,
                                              row,
                                            )
                                          }
                                        >
                                          <Edit3 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 px-2 text-destructive"
                                          onClick={() =>
                                            void handleDeleteStandingRow(
                                              group.code,
                                              row,
                                            )
                                          }
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </Card>
            )}

            {/* SECTION 2: BAGAN PENYISIHAN (PEREMPAT FINAL, SEMIFINAL, FINAL & PEREBUTAN JUARA 3) */}
            <Card className="p-6 space-y-6">
              <div className="border-b pb-4">
                <Badge variant="secondary" className="mb-1">
                  FASE GUGUR / PENYISIHAN
                </Badge>
                <h2 className="text-xl font-bold">
                  Kelola Bagan Penyisihan – {selectedSportName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pemenang Perempat Final 1 &amp; 2 otomatis masuk ke Semifinal 1; Perempat Final 3 &amp; 4 ke Semifinal 2. Pemenang Semifinal otomatis maju ke Final, dan yang kalah ke Perebutan Juara 3. Saat Final selesai, medali Emas &amp; Perak otomatis tercatat!
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Column 1: Perempat Final */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      1. Babak Perempat Final
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </h3>
                    <Badge variant="outline">
                      {quarterfinalMatches.length} Laga
                    </Badge>
                  </div>
                  {quarterfinalMatches.map(renderBracketMatchCard)}
                </div>

                {/* Column 2: Semifinal */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      2. Babak Semifinal
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </h3>
                    <Badge variant="outline">{semifinalMatches.length} Laga</Badge>
                  </div>
                  {semifinalMatches.map(renderBracketMatchCard)}
                </div>

                {/* Column 3: Final & Perebutan Juara 3 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base">
                      3. Babak Final &amp; Juara 3
                    </h3>
                    <Badge variant="outline">Penentuan Medali</Badge>
                  </div>
                  {finalAndThirdMatches.map(renderBracketMatchCard)}
                </div>
              </div>
            </Card>

            {/* SECTION 3: LIVE PREVIEW BAGAN WEB UTAMA */}
            {tournament && (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-1">
                      PRATINJAU LANGSUNG WEB UTAMA
                    </Badge>
                    <h2 className="text-lg font-bold">
                      Tampilan Bagan {tournament.sport_name} di Halaman Publik
                    </h2>
                  </div>
                  <Link
                    to="/bagan"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Buka Halaman Bagan Utama →
                  </Link>
                </div>
                <SportBracket tournament={tournament} />
              </Card>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
