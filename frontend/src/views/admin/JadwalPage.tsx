import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCompetitionStore } from "../../stores/competitionStore";
import { isGroupPhaseNonHeadToHeadMatch } from "../../utils/sportScoringConfig";
import {
  formatParticipantName,
  hasDuplicateParticipantEntry,
} from "../../utils/participantDisplay";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import AdminNav from "../../components/AdminNav";
import {
  CalendarCheck,
  CheckCircle2,
  Edit3,
  LayoutGrid,
  Plus,
  Trash2,
  Trophy,
} from "lucide-react";
import {
  API_BASE_URL,
  getAPIData,
  getAPIErrorMessage,
  getAuthHeaders,
  readResponseError,
} from "../../api/client";
import type { ScheduleMatch } from "../../api/types";
import { getSportScoringRule } from "../../utils/sportScoringConfig";

interface MatchFormState {
  match_id: string | null;
  sport_id: number;
  event_id: number;
  custom_event_name: string;
  event_gender: string;
  venue_id: number;
  title: string;
  round_name: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  status: string;
  contingent_ids: number[];
  athlete_names: string[];
  scores: string[];
  winner_contingent_id: number;
  live_stream_url: string;
}

const ROUND_OPTIONS = [
  "Fase Grup - Grup A",
  "Fase Grup - Grup B",
  "Penyisihan",
  "Perempat Final 1",
  "Perempat Final 2",
  "Perempat Final 3",
  "Perempat Final 4",
  "Semifinal 1",
  "Semifinal 2",
  "Perebutan Juara 3",
  "Final",
];

function getTodayJakarta() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

function getJakartaDateTimeParts(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const today = getTodayJakarta();
    return { date: today, time: "" };
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  const time = `${values.hour}:${values.minute}`;
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: time === "00:00" ? "" : time,
  };
}

function toApiDateTime(date: string, time: string) {
  const safeTime = time.trim() || "00:00";
  return new Date(`${date}T${safeTime}:00+07:00`).toISOString();
}

function getScheduleValidationError(form: MatchFormState): string | null {
  if (!form.sport_id) return "Pilih cabang olahraga terlebih dahulu.";
  if (!form.venue_id) return "Pilih tempat / venue pertandingan terlebih dahulu.";
  const participantEntries = form.contingent_ids.map((cid, idx) => ({
    contingent_id: cid,
    athlete_name: form.athlete_names[idx] ?? "",
  }));
  if (hasDuplicateParticipantEntry(participantEntries)) {
    return "Peserta duplikat: jika memilih kontingen yang sama, isi nama atlet yang berbeda.";
  }
  if (!form.start_date.trim()) {
    return "Tanggal mulai wajib diisi.";
  }
  if (!form.end_date.trim()) {
    return "Tanggal selesai wajib diisi.";
  }
  const startComparable = `${form.start_date}T${form.start_time.trim() || "00:00"}`;
  const endComparable = `${form.end_date}T${form.end_time.trim() || "23:59"}`;
  if (endComparable < startComparable) {
    return "Waktu selesai tidak boleh lebih awal dari waktu mulai.";
  }
  if (!form.status.trim()) return "Pilih status pertandingan.";
  const streamUrl = form.live_stream_url.trim();
  if (streamUrl && !/^https?:\/\//i.test(streamUrl)) {
    return "Link live streaming harus diawali http:// atau https://.";
  }
  return null;
}

export default function JadwalPage() {
  const matches = useCompetitionStore((s) => s.matches);
  const sports = useCompetitionStore((s) => s.sports);
  const venues = useCompetitionStore((s) => s.venues);
  const events = useCompetitionStore((s) => s.events);
  const contingents = useCompetitionStore((s) => s.contingents);
  const loading = useCompetitionStore((s) => s.loading.matches);
  const contingentsError = useCompetitionStore((s) => s.errors.contingents);
  const fetchMatches = useCompetitionStore((s) => s.fetchMatches);
  const fetchSports = useCompetitionStore((s) => s.fetchSports);
  const fetchVenues = useCompetitionStore((s) => s.fetchVenues);
  const fetchEvents = useCompetitionStore((s) => s.fetchEvents);
  const fetchContingents = useCompetitionStore((s) => s.fetchContingents);
  const fetchMedalStandings = useCompetitionStore((s) => s.fetchMedalStandings);
  const fetchSportMedalStandings = useCompetitionStore((s) => s.fetchSportMedalStandings);
  const createEvent = useCompetitionStore((s) => s.createEvent);
  const deleteMatches = useCompetitionStore((s) => s.deleteMatches);

  const [searchParams, setSearchParams] = useSearchParams();
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSport, setFilterSport] = useState("all");
  const [filterRecentOnly, setFilterRecentOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "schedule">("newest");
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<string[]>(() => {
    try {
      const raw = sessionStorage.getItem("porprov_recently_added_match_ids");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
      return [];
    }
  });
  const [showForm, setShowForm] = useState(true);
  const [useCustomEvent, setUseCustomEvent] = useState(false);
  const [editing, setEditing] = useState<MatchFormState | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = getTodayJakarta();

  const createEmptyMatchForm = (): MatchFormState => {
    const currentToday = getTodayJakarta();
    return {
      match_id: null,
      sport_id: 0,
      event_id: 0,
      custom_event_name: "",
      event_gender: "Mixed",
      venue_id: 0,
      title: "",
      round_name: "",
      start_date: currentToday,
      start_time: "",
      end_date: currentToday,
      end_time: "",
      status: "SCHEDULED",
      contingent_ids: [0, 0],
      athlete_names: ["", ""],
      scores: ["0", "0"],
      winner_contingent_id: 0,
      live_stream_url: "",
    };
  };

  const [form, setForm] = useState<MatchFormState>(createEmptyMatchForm);

  useEffect(() => {
    void fetchMatches();
    void fetchSports();
    void fetchVenues();
    void fetchEvents();
    void fetchContingents();
  }, [fetchContingents, fetchEvents, fetchMatches, fetchSports, fetchVenues]);

  const editIdParam = searchParams.get("edit");
  useEffect(() => {
    if (!editIdParam || matches.length === 0) return;
    const target = matches.find((m) => m.id === editIdParam);
    if (target) {
      openEditForm(target);
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editIdParam, matches]);

  const recentIndexMap = new Map(recentlyAddedIds.map((id, idx) => [id, idx]));

  const filteredMatches = matches
    .filter((m) => {
      if (filterRecentOnly && !recentIndexMap.has(m.id)) return false;
      if (filterDate && m.date !== filterDate) return false;
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (filterSport !== "all" && m.sport_name !== filterSport) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "schedule") return 0;
      const aRecent = recentIndexMap.get(a.id);
      const bRecent = recentIndexMap.get(b.id);
      if (aRecent !== undefined && bRecent !== undefined) return aRecent - bRecent;
      if (aRecent !== undefined) return -1;
      if (bRecent !== undefined) return 1;
      return 0;
    });

  const openAddForm = () => {
    setEditing(null);
    setUseCustomEvent(false);
    setForm(createEmptyMatchForm());
    setShowForm(true);
  };

  function openEditForm(match: ScheduleMatch) {
    const startDateTime = getJakartaDateTimeParts(match.start_time);
    const matchSport = sports.find(
      (sport) => sport.id === match.sport_id || sport.name === match.sport_name,
    );
    const matchEvent = events.find(
      (event) =>
        event.id === match.event_id ||
        (event.name === match.event_name && event.sport_id === matchSport?.id),
    );
    const matchVenue = venues.find(
      (v) => v.id === match.venue_id || v.name === match.venue_name,
    );
    const winnerPart = match.participants.find((p) => p.is_winner);

    const editForm: MatchFormState = {
      match_id: match.id,
      sport_id: matchSport?.id ?? match.sport_id ?? 0,
      event_id: matchEvent?.id ?? match.event_id ?? 0,
      custom_event_name: "",
      event_gender: "Mixed",
      venue_id: matchVenue?.id ?? match.venue_id ?? (venues[0]?.id ?? 0),
      title: match.title,
      round_name: match.round_name || "",
      start_date: startDateTime.date,
      start_time: startDateTime.time,
      end_date: startDateTime.date,
      end_time: startDateTime.time,
      status: match.status,
      contingent_ids:
        match.participants.length >= 2
          ? match.participants.map((p) => p.contingent_id)
          : [
            match.participants[0]?.contingent_id ?? 0,
            match.participants[1]?.contingent_id ?? 0,
          ],
      athlete_names:
        match.participants.length >= 2
          ? match.participants.map((p) => p.athlete_name || "")
          : [
            match.participants[0]?.athlete_name ?? "",
            match.participants[1]?.athlete_name ?? "",
          ],
      scores:
        match.participants.length >= 2
          ? match.participants.map(
            (p) => p.score || (match.status === "SCHEDULED" ? "0" : ""),
          )
          : [
            match.participants[0]?.score || (match.status === "SCHEDULED" ? "0" : ""),
            match.participants[1]?.score || (match.status === "SCHEDULED" ? "0" : ""),
          ],
      winner_contingent_id: winnerPart?.contingent_id ?? 0,
      live_stream_url: match.live_stream_url || "",
    };
    setUseCustomEvent(false);
    setEditing(editForm);
    setForm(editForm);
    setShowForm(true);
  }

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleCreateCustomEvent = async () => {
    if (!form.sport_id || !form.custom_event_name.trim()) {
      alert("Pilih cabang olahraga dan ketik nama nomor pertandingan.");
      return;
    }
    try {
      const created = await createEvent({
        sport_id: form.sport_id,
        name: form.custom_event_name.trim(),
        gender: form.event_gender,
      });
      setForm({
        ...form,
        event_id: created.id,
        custom_event_name: "",
      });
      setUseCustomEvent(false);
    } catch {
      alert("Gagal menambahkan nomor pertandingan baru.");
    }
  };

  const buildParticipantSignature = (
    items: Array<{ contingent_id: number; athlete_name?: string }>,
  ) =>
    items
      .filter((item) => item.contingent_id > 0)
      .map(
        (item) =>
          `${item.contingent_id}:${(item.athlete_name ?? "").trim().toLowerCase()}`,
      )
      .sort()
      .join("|");

  const findDuplicateSchedule = (
    computedTitle: string,
    selectedParticipantsList: Array<{ contingent_id: number; athlete_name: string }>,
  ) => {
    const targetSport = sports.find((s) => s.id === form.sport_id);
    const targetSportName = (targetSport?.name || "").trim().toLowerCase();
    const targetRound = form.round_name.trim().toLowerCase();
    const targetDate = form.start_date.trim();
    const targetTime = form.start_time.trim() || "00:00";
    const targetEvent = (
      events.find((ev) => ev.id === form.event_id)?.name ||
      form.custom_event_name.trim() ||
      ""
    )
      .trim()
      .toLowerCase();
    const targetTitle = computedTitle.trim().toLowerCase();
    const targetPartSig = buildParticipantSignature(selectedParticipantsList);

    return matches.find((existing) => {
      if (editing?.match_id && existing.id === editing.match_id) return false;

      const sameSport =
        existing.sport_id && form.sport_id
          ? existing.sport_id === form.sport_id
          : existing.sport_name.trim().toLowerCase() === targetSportName;
      if (!sameSport) return false;
      if ((existing.date || "").trim() !== targetDate) return false;
      if ((existing.round_name || "").trim().toLowerCase() !== targetRound) {
        return false;
      }

      const existingEvent = (existing.event_name || "").trim().toLowerCase();
      if (targetEvent && existingEvent && targetEvent !== existingEvent) {
        return false;
      }

      const existingPartSig = buildParticipantSignature(existing.participants || []);
      if (targetPartSig || existingPartSig) {
        return targetPartSig === existingPartSig;
      }

      const existingTime =
        !existing.time || existing.time === "00:00" ? "00:00" : existing.time;
      return (
        (existing.title || "").trim().toLowerCase() === targetTitle &&
        (existing.venue_id ? existing.venue_id === form.venue_id : true) &&
        existingTime === targetTime
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFeedbackMsg("");

    const validationError = getScheduleValidationError(form);
    if (validationError) {
      alert(validationError);
      return;
    }

    const selectedParticipants = form.contingent_ids
      .map((cid, idx) => ({
        cid,
        athleteName: (form.athlete_names[idx] ?? "").trim(),
        score: form.status === "SCHEDULED" ? "" : (form.scores[idx] ?? ""),
      }))
      .filter((item) => item.cid > 0);
    const selectedContingentIds = selectedParticipants.map((item) => item.cid);
    const selectedAthleteNames = selectedParticipants.map((item) => item.athleteName);
    const selectedScores = selectedParticipants.map((item) => item.score);
    const selectedNames = selectedParticipants.map((item, idx) => {
      const contingentName =
        contingents.find((c) => c.id === item.cid)?.name || `Kontingen ${idx + 1}`;
      return item.athleteName
        ? `${item.athleteName} (${contingentName})`
        : contingentName;
    });
    const selectedSportName =
      sports.find((s) => s.id === form.sport_id)?.name || "Pertandingan";
    const selectedEventName =
      events.find((ev) => ev.id === form.event_id)?.name ||
      form.custom_event_name.trim() ||
      selectedSportName;
    const roundSuffix = form.round_name.trim()
      ? ` (${form.round_name.trim()})`
      : "";
    const nonHeadToHead = isGroupPhaseNonHeadToHeadMatch(
      form.sport_id,
      selectedSportName,
      form.round_name,
      form.title,
    );
    const defaultTitle =
      selectedNames.length === 0
        ? `${selectedEventName}${roundSuffix}`
        : nonHeadToHead
          ? selectedNames.length <= 2
            ? `${selectedNames.join(", ")}${roundSuffix}`
            : `${selectedNames.slice(0, 2).join(", ")} +${selectedNames.length - 2} Kontingen${roundSuffix}`
          : selectedNames.length === 1
            ? `${selectedNames[0]} vs TBA${roundSuffix}`
            : selectedNames.length === 2
              ? `${selectedNames[0]} vs ${selectedNames[1]}${roundSuffix}`
              : `${selectedNames.slice(0, 2).join(", ")} +${selectedNames.length - 2} Kontingen${roundSuffix}`;
    const computedTitle = form.title.trim() || defaultTitle;

    const duplicateMatch = findDuplicateSchedule(
      computedTitle,
      selectedParticipants.map((p) => ({
        contingent_id: p.cid,
        athlete_name: p.athleteName,
      })),
    );
    if (duplicateMatch) {
      alert(
        `Jadwal ganda terdeteksi: "${duplicateMatch.sport_name} - ${duplicateMatch.title}" pada ${duplicateMatch.date} sudah ada di daftar. Gunakan tombol Edit jika ingin memperbarui.`,
      );
      return;
    }

    setIsSubmitting(true);
    const previousIds = new Set(matches.map((m) => m.id));
    try {
      const payload = {
        sport_id: form.sport_id,
        event_id: form.event_id,
        event_name: form.custom_event_name.trim(),
        event_gender: form.event_gender,
        venue_id: form.venue_id,
        title: computedTitle,
        round_name: form.round_name,
        start_time: toApiDateTime(form.start_date, form.start_time),
        end_time: toApiDateTime(form.end_date, form.end_time),
        status: form.status,
        contingent_ids: selectedContingentIds,
        athlete_names: selectedAthleteNames,
        scores: selectedScores,
        winner_contingent_id: form.winner_contingent_id,
        live_stream_url: form.live_stream_url.trim(),
      };
      const url = editing?.match_id
        ? `${API_BASE_URL}/matches/${editing.match_id}`
        : `${API_BASE_URL}/matches`;
      const method = editing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(
          await readResponseError(response, "Gagal menyimpan jadwal"),
        );
      }

      if (editing?.match_id) {
        const hasScores =
          selectedScores.some((s) => s.trim() !== "") ||
          form.status === "FINISHED";
        if (hasScores) {
          const resultRes = await fetch(
            `${API_BASE_URL}/matches/${editing.match_id}/result`,
            {
              method: "PUT",
              headers: getAuthHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify({
                status: form.status,
                scores: selectedScores,
                winner_contingent_id: form.winner_contingent_id,
                live_stream_url: form.live_stream_url.trim(),
              }),
            },
          );
          if (!resultRes.ok) {
            throw new Error(
              await readResponseError(resultRes, "Gagal menyimpan hasil"),
            );
          }
        }
      }

      await Promise.all([
        fetchMatches(),
        fetchEvents(),
        fetchMedalStandings(),
        fetchSportMedalStandings(),
        form.sport_id > 0
          ? getAPIData(`/sports/${form.sport_id}/tournament`).catch(() => null)
          : Promise.resolve(null),
      ]);

      const refreshedMatches = useCompetitionStore.getState().matches;
      if (!editing?.match_id) {
        const newlyAdded = refreshedMatches
          .filter((m) => !previousIds.has(m.id))
          .map((m) => m.id);
        if (newlyAdded.length > 0) {
          setRecentlyAddedIds((prev) => {
            const next = [...newlyAdded, ...prev.filter((id) => !newlyAdded.includes(id))].slice(0, 50);
            try {
              sessionStorage.setItem("porprov_recently_added_match_ids", JSON.stringify(next));
            } catch {
              // Ignore storage errors
            }
            return next;
          });
        }
      }

      setFeedbackMsg(
        editing
          ? "Jadwal, kontingen, skor, klasemen & bagan berhasil diperbarui!"
          : "Jadwal pertandingan baru berhasil ditambahkan dan disinkronkan ke web utama!",
      );
      setEditing(null);
      setUseCustomEvent(false);
      setForm(createEmptyMatchForm());
    } catch (err) {
      console.error("Failed to save match:", err);
      alert(getAPIErrorMessage(err));
    } finally {
      setIsSubmitting(false);
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
    } catch (err) {
      console.error("Failed to delete match:", err);
      alert("Gagal menghapus pertandingan");
    }
  };

  const handleDeleteAll = async () => {
    if (filteredMatches.length === 0 || deletingAll) return;
    const confirmed = confirm(
      `Hapus SEMUA ${filteredMatches.length} pertandingan yang ditampilkan? Tindakan ini tidak dapat dibatalkan dan akan memperbarui klasemen, bagan, serta medali.`,
    );
    if (!confirmed) return;

    setDeletingAll(true);
    try {
      const targetIds = filteredMatches.map((m) => m.id);
      const { deleted, failed } = await deleteMatches(targetIds);
      if (editing?.match_id && targetIds.includes(editing.match_id)) {
        setEditing(null);
        setUseCustomEvent(false);
        setForm(createEmptyMatchForm());
      }
      if (failed > 0) {
        alert(`${deleted} pertandingan dihapus, ${failed} gagal dihapus.`);
      } else {
        setFeedbackMsg(`${deleted} pertandingan berhasil dihapus.`);
      }
    } catch {
      alert("Gagal menghapus semua pertandingan.");
    } finally {
      setDeletingAll(false);
    }
  };

  const compareAlpha = (a: string, b: string) =>
    a.localeCompare(b, "id", { sensitivity: "base" });
  const sortedSports = [...sports].sort((a, b) => compareAlpha(a.name, b.name));
  const sortedVenues = [...venues].sort((a, b) => compareAlpha(a.name, b.name));
  const sortedContingents = [...contingents].sort((a, b) =>
    compareAlpha(a.name, b.name),
  );
  const sortedRoundOptions = [...ROUND_OPTIONS].sort(compareAlpha);
  const formEvents = events
    .filter((event) => event.sport_id === form.sport_id)
    .sort((a, b) => compareAlpha(a.name, b.name));
  const selectedSportObj = sports.find((s) => s.id === form.sport_id);
  const scoringRule = getSportScoringRule(form.sport_id, selectedSportObj?.name);
  const scheduleValidationError = getScheduleValidationError(form);
  const hasAnyFormInput =
    Boolean(editing) ||
    form.sport_id > 0 ||
    form.event_id > 0 ||
    form.venue_id > 0 ||
    form.custom_event_name.trim() !== "" ||
    form.title.trim() !== "" ||
    form.contingent_ids.some((cid) => cid > 0);

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
      <main className="admin-page p-6 space-y-6 max-w-7xl mx-auto">
        <AdminNav />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Input Jadwal Pertandingan, Cabor, Nomor &amp; Kontingen
            </h1>
            <p className="text-muted-foreground">
              Jadwal dan hasil yang diinput di sini otomatis tampil di halaman Jadwal, Bagan, dan Hasil Pertandingan web utama.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setFilterDate(today)}
              className="gap-2"
            >
              <CalendarCheck className="h-4 w-4" /> Filter Jadwal Hari Ini ({today})
            </Button>
            {filterDate && (
              <Button variant="ghost" onClick={() => setFilterDate("")}>
                Tampilkan Semua Tanggal
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDeleteAll()}
              disabled={filteredMatches.length === 0 || deletingAll}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deletingAll
                ? "Menghapus..."
                : `Hapus Semua (${filteredMatches.length})`}
            </Button>
          </div>
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

        {/* Form Input / Edit Jadwal & Kontingen */}
        <Card className="p-6 border-l-4 border-l-primary shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {editing ? "Edit Jadwal, Kontingen & Hasil Pertandingan" : "Tambah Jadwal Pertandingan (Hari Ini / Baru)"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pilih cabang olahraga, nomor pertandingan, babak (Fase Grup / Perempat Final / Semifinal / Final), dan 2 kontingen yang bertanding.
                </p>
              </div>
            </div>
            <Button
              variant={showForm ? "outline" : "default"}
              onClick={() => {
                if (!showForm) openAddForm();
                else closeForm();
              }}
              className="gap-2"
            >
              {showForm ? "Sembunyikan Form" : "Tampilkan Form Input"}
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="grid gap-6">
              {/* Row 1: Cabor, Nomor Pertandingan, Babak/Fase, Tempat */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                  <Label>1. Cabang Olahraga (32 Cabor)</Label>
                  <Select
                    value={form.sport_id ? String(form.sport_id) : ""}
                    onValueChange={(value) => {
                      const nextSportId = Number(value);
                      const firstEv = events.find((ev) => ev.sport_id === nextSportId);
                      setForm({
                        ...form,
                        sport_id: nextSportId,
                        event_id: firstEv?.id ?? 0,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih cabang olahraga" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedSports.map((sport) => (
                        <SelectItem key={sport.id} value={String(sport.id)}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      2. Nomor Pertandingan (Opsional)
                    </Label>
                    <button
                      type="button"
                      onClick={() => setUseCustomEvent((v) => !v)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {useCustomEvent ? "Pilih dari daftar" : "+ Nomor baru"}
                    </button>
                  </div>
                  {useCustomEvent ? (
                    <div className="flex gap-1.5">
                      <Input
                        placeholder="Ketik nomor (mis. Beregu Putra)"
                        value={form.custom_event_name}
                        onChange={(e) =>
                          setForm({ ...form, custom_event_name: e.target.value })
                        }
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void handleCreateCustomEvent()}
                      >
                        Tambah
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={form.event_id ? String(form.event_id) : "0"}
                      disabled={!form.sport_id}
                      onValueChange={(value) =>
                        setForm({ ...form, event_id: Number(value || 0) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Belum ditentukan (Opsional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">
                          Belum ditentukan (Opsional)
                        </SelectItem>
                        {formEvents.map((event) => (
                          <SelectItem key={event.id} value={String(event.id)}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>
                    3. Fase / Babak Pertandingan (Opsional)
                  </Label>
                  <Select
                    value={form.round_name || "__EMPTY__"}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        round_name: !v || v === "__EMPTY__" ? "" : v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Belum ditentukan (Opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__EMPTY__">
                        Belum ditentukan (Opsional)
                      </SelectItem>
                      {sortedRoundOptions.map((round) => (
                        <SelectItem key={round} value={round}>
                          {round}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>4. Tempat / Venue</Label>
                  <Select
                    value={form.venue_id ? String(form.venue_id) : ""}
                    onValueChange={(v) => setForm({ ...form, venue_id: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedVenues.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Kontingen yang Bertanding */}
              <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-base font-bold">
                    5. Kontingen yang Bertanding &amp; Skor ({scoringRule.scoreUnitLabel})
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {scoringRule.badgeLabel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {scoringRule.shortRule}
                    </span>
                  </div>
                </div>
                {contingentsError && (
                  <p className="text-sm text-destructive" role="alert">
                    Gagal memuat daftar kontingen: {contingentsError}
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {form.contingent_ids.map((cid, idx) => (
                    <div key={idx} className="grid gap-2 rounded-lg border bg-background p-3">
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor={`match-contingent-${idx}`} className="font-semibold">
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
                                athlete_names: form.athlete_names.filter((_, i) => i !== idx),
                                scores: form.scores.filter((_, i) => i !== idx),
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Select
                            value={cid ? String(cid) : "0"}
                            onValueChange={(value) => {
                              const nextIds = [...form.contingent_ids];
                              nextIds[idx] = Number(value);
                              setForm({ ...form, contingent_ids: nextIds });
                            }}
                          >
                            <SelectTrigger id={`match-contingent-${idx}`}>
                              <SelectValue placeholder={`Pilih kontingen ${idx + 1} (opsional)`} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Belum dipilih (TBA)</SelectItem>
                              {sortedContingents.map((contingent) => (
                                <SelectItem
                                  key={contingent.id}
                                  value={String(contingent.id)}
                                >
                                  {contingent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {form.status !== "SCHEDULED" && (
                          <Input
                            type="text"
                            placeholder={
                              idx === 0
                                ? scoringRule.scorePlaceholderHome
                                : scoringRule.scorePlaceholderAway
                            }
                            className="w-36 text-center font-bold"
                            value={form.scores[idx] ?? ""}
                            onChange={(e) => {
                              const nextScores = [...form.scores];
                              nextScores[idx] = e.target.value;
                              setForm({ ...form, scores: nextScores });
                            }}
                          />
                        )}
                      </div>
                      <Input
                        type="text"
                        placeholder="Nama atlet (opsional, untuk nomor perorangan)"
                        value={form.athlete_names[idx] ?? ""}
                        onChange={(e) => {
                          const nextAthletes = [...form.athlete_names];
                          nextAthletes[idx] = e.target.value;
                          setForm({ ...form, athlete_names: nextAthletes });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-muted-foreground">
                    Kontingen boleh dikosongkan dulu saat membuat jadwal dan diisi nanti saat data kontingen tersedia. Untuk status Terjadwal, skor tidak perlu diisi.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() =>
                      setForm({
                        ...form,
                        contingent_ids: [...form.contingent_ids, 0],
                        athlete_names: [...form.athlete_names, ""],
                        scores: [...form.scores, ""],
                      })
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Kontingen
                  </Button>
                </div>
              </div>

              {/* Row 3: Tanggal Hari Ini, Waktu, Status, Judul, Pemenang */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-match-start-date">Tanggal &amp; Jam Mulai</Label>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          start_date: today,
                          end_date: today,
                        })
                      }
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Set Hari Ini
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="new-match-start-date"
                      type="date"
                      required
                      value={form.start_date}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          start_date: e.target.value,
                          end_date: e.target.value,
                        })
                      }
                    />
                    <Input
                      id="new-match-start-time"
                      type="time"
                      className="w-28"
                      value={form.start_time}
                      onChange={(e) =>
                        setForm({ ...form, start_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-match-end-date">Tanggal &amp; Jam Selesai</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-match-end-date"
                      type="date"
                      required
                      value={form.end_date}
                      onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                      }
                    />
                    <Input
                      id="new-match-end-time"
                      type="time"
                      className="w-28"
                      value={form.end_time}
                      onChange={(e) =>
                        setForm({ ...form, end_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Status Pertandingan</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => {
                      const nextStatus = v ?? "SCHEDULED";
                      setForm({
                        ...form,
                        status: nextStatus,
                        scores:
                          nextStatus === "SCHEDULED"
                            ? form.contingent_ids.map(() => "0")
                            : form.scores,
                        winner_contingent_id:
                          nextStatus === "SCHEDULED" ? 0 : form.winner_contingent_id,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                      <SelectItem value="ONGOING">Sedang Berlangsung (Live)</SelectItem>
                      <SelectItem value="FINISHED">Selesai (Update Klasemen/Bagan)</SelectItem>
                      <SelectItem value="POSTPONED">Ditunda</SelectItem>
                      <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Judul Pertandingan (Opsional)</Label>
                  <Input
                    placeholder="Otomatis dari nama kontingen jika kosong"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="match-live-stream-url">
                  Link Live Streaming YouTube / URL (Opsional)
                </Label>
                <Input
                  id="match-live-stream-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... (tampil saat status Sedang Berlangsung)"
                  value={form.live_stream_url}
                  onChange={(e) =>
                    setForm({ ...form, live_stream_url: e.target.value })
                  }
                />
              </div>

              {hasAnyFormInput && scheduleValidationError && (
                <p className="text-xs text-amber-600 font-medium" role="status">
                  * Lengkapi semua kolom wajib sebelum menyimpan (kecuali Judul Pertandingan): {scheduleValidationError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={Boolean(scheduleValidationError) || isSubmitting}
                  title={scheduleValidationError || "Simpan jadwal pertandingan"}
                >
                  <LayoutGrid className="h-4 w-4" />
                  {isSubmitting
                    ? "Menyimpan..."
                    : editing
                      ? "Update Jadwal & Sinkronkan Web Utama"
                      : "Simpan Jadwal & Sinkronkan Web Utama"}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={openAddForm}>
                    Batal Edit (Mode Tambah Baru)
                  </Button>
                )}
              </div>
            </form>
          )}
        </Card>

        {/* Filters Section */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-md font-semibold">Filter Daftar Pertandingan</h3>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
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
                  {sortedSports.map((sp) => (
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
            <div className="flex-1 min-w-[180px]">
              <Label>Urutkan</Label>
              <Select
                value={sortOrder}
                onValueChange={(v) =>
                  setSortOrder((v as "newest" | "schedule") ?? "newest")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Baru Saja Dimasukkan</SelectItem>
                  <SelectItem value="schedule">Urutan Jadwal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant={filterRecentOnly ? "default" : "outline"}
              onClick={() => setFilterRecentOnly((v) => !v)}
              disabled={recentlyAddedIds.length === 0 && !filterRecentOnly}
            >
              Baru Dimasukkan ({recentlyAddedIds.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFilterDate("");
                setFilterStatus("all");
                setFilterSport("all");
                setFilterRecentOnly(false);
                setSortOrder("newest");
              }}
            >
              Reset Filter
            </Button>
          </div>
        </Card>

        {/* Matches list */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Daftar Jadwal Pertandingan</h2>
            <span className="text-sm text-muted-foreground">
              {filteredMatches.length} pertandingan
            </span>
          </div>

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Memuat data...</p>
          ) : filteredMatches.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Belum ada pertandingan untuk filter ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium text-muted-foreground p-2">Tanggal &amp; Jam</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Cabang &amp; Nomor</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Babak / Fase</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Kontingen Bertanding</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Tempat</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Status</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match) => {
                    const parts = match.participants || [];
                    return (
                      <tr key={match.id} className="border-b hover:bg-muted/20">
                        <td className="p-2 font-medium whitespace-nowrap">
                          <div>{match.date}</div>
                          <div className="text-xs text-muted-foreground">
                            {!match.time || match.time === "00:00"
                              ? "Jam menyusul"
                              : `${match.time} WIB`}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <span>{match.sport_name}</span>
                            {recentIndexMap.has(match.id) && (
                              <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">
                                Baru
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {match.event_name || "-"}
                            {match.title ? ` · ${match.title}` : ""}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">
                            {match.round_name || "Belum diatur"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {parts.length > 0 ? (
                            <div className="text-xs space-y-0.5">
                              {parts.map((p, idx) => (
                                <div
                                  key={`${p.contingent_id}-${idx}`}
                                  className={p.is_winner ? "font-bold text-emerald-700" : ""}
                                >
                                  {parts.length === 2 &&
                                  idx === 1 &&
                                  !isGroupPhaseNonHeadToHeadMatch(
                                    match.sport_id,
                                    match.sport_name,
                                    match.round_name,
                                    match.title,
                                  )
                                    ? "vs "
                                    : ""}
                                  {formatParticipantName(p)}{" "}
                                  {p.score
                                    ? `(${p.score})`
                                    : match.status === "SCHEDULED"
                                      ? "(0)"
                                      : ""}
                                  {p.is_winner ? " 🏆" : ""}
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
                            <Link to={`/admin/update/${match.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Input Skor & Pemenang"
                                className="text-emerald-700 hover:bg-emerald-50"
                              >
                                <Trophy className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit Jadwal & Kontingen"
                              onClick={() => openEditForm(match)}
                              className="text-primary hover:bg-primary/10"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Hapus"
                              onClick={() => handleDelete(match.id)}
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
