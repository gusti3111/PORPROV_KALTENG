import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCompetitionStore } from "../../stores/competitionStore";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import {
  Plus, Edit3, Trash2, X, LayoutGrid,
} from "lucide-react";
import type { ScheduleMatch } from "../../api/types";

interface MatchFormState {
  match_id: string | null;
  sport_id: number;
  event_id: number;
  venue_id: number;
  title: string;
  round_name: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  status: string;
  contingent_ids: [number, number];
}

function getJakartaDateTimeParts(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "00:00" };
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

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

function toApiDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+07:00`).toISOString();
}

export default function JadwalPage() {
  const matches = useCompetitionStore((s) => s.matches);
  const sports = useCompetitionStore((s) => s.sports);
  const venues = useCompetitionStore((s) => s.venues);
  const events = useCompetitionStore((s) => s.events);
  const loading = useCompetitionStore((s) => s.loading.matches);
  const fetchMatches = useCompetitionStore((s) => s.fetchMatches);
  const fetchSports = useCompetitionStore((s) => s.fetchSports);
  const fetchVenues = useCompetitionStore((s) => s.fetchVenues);
  const fetchEvents = useCompetitionStore((s) => s.fetchEvents);
  const contingents = useCompetitionStore((s) => s.contingents);
  const contingentsError = useCompetitionStore((s) => s.errors.contingents);
  const fetchContingents = useCompetitionStore((s) => s.fetchContingents);
  const updateMatchContingents = useCompetitionStore((s) => s.updateMatchContingents);

  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSport, setFilterSport] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MatchFormState | null>(null);

  const [form, setForm] = useState<MatchFormState>({
    match_id: null,
    sport_id: 0,
    event_id: 0,
    venue_id: 0,
    title: "",
    round_name: "Kelompok",
    start_date: "",
    start_time: "00:00",
    end_date: "",
    end_time: "00:00",
    status: "SCHEDULED",
    contingent_ids: [0, 0],
  });

  useEffect(() => {
    void fetchMatches();
    void fetchSports();
    void fetchVenues();
    void fetchEvents();
    void fetchContingents();
  }, [fetchContingents, fetchEvents, fetchMatches, fetchSports, fetchVenues]);

  const filteredMatches = matches.filter((m) => {
    if (filterDate && m.date !== filterDate) return false;
    if (filterStatus !== "all" && m.status !== filterStatus) return false;
    if (filterSport !== "all" && m.sport_name !== filterSport) return false;
    return true;
  });

  const openAddForm = () => {
    setEditing(null);
    setForm({
      match_id: null,
      sport_id: 0,
      event_id: 0,
      venue_id: 0,
      title: "",
      round_name: "Kelompok",
      start_date: "",
      start_time: "00:00",
      end_date: "",
      end_time: "00:00",
      status: "SCHEDULED",
      contingent_ids: [0, 0],
    });
    setShowForm(true);
  };

  const openEditForm = (match: ScheduleMatch) => {
    const startDateTime = getJakartaDateTimeParts(match.start_time);
    const matchEvent = events.find(
      (event) =>
        event.name === match.event_name &&
        sports.find((sport) => sport.id === event.sport_id)?.name === match.sport_name,
    );
    const matchSport = sports.find((sport) => sport.name === match.sport_name);
    const editForm: MatchFormState = {
      match_id: match.id,
      sport_id: matchEvent?.sport_id ?? matchSport?.id ?? 0,
      event_id: matchEvent?.id ?? 0,
      venue_id: 0,
      title: match.title,
      round_name: match.round_name,
      start_date: startDateTime.date,
      start_time: startDateTime.time,
      end_date: startDateTime.date,
      end_time: "00:00",
      status: match.status,
      contingent_ids: [
        match.participants[0]?.contingent_id ?? 0,
        match.participants[1]?.contingent_id ?? 0,
      ],
    };
    setEditing(editForm);
    setForm(editForm);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sport_id || !form.event_id) {
      alert("Silakan pilih cabang olahraga dan nomor pertandingan.");
      return;
    }
    if (!form.start_date || !form.end_date) {
      alert("Silakan pilih tanggal mulai dan tanggal selesai.");
      return;
    }
    if (
      editing &&
      (!form.contingent_ids[0] ||
        !form.contingent_ids[1] ||
        form.contingent_ids[0] === form.contingent_ids[1])
    ) {
      alert("Pilih dua kontingen berbeda untuk pertandingan.");
      return;
    }

    try {
      const payload = {
        event_id: form.event_id,
        venue_id: form.venue_id,
        title: form.title,
        round_name: form.round_name,
        start_time: toApiDateTime(form.start_date, form.start_time),
        end_time: toApiDateTime(form.end_date, form.end_time),
        status: form.status,
      };
      const url = editing?.match_id
        ? `/api/v1/matches/${editing.match_id}`
        : "/api/v1/matches";
      const method = editing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Gagal menyimpan jadwal (${response.status})`);
      }
      if (editing?.match_id) {
        await updateMatchContingents(editing.match_id, form.contingent_ids);
      }
      closeForm();
      void fetchMatches();
    } catch (err) {
      console.error("Failed to save match:", err);
      alert("Gagal menyimpan pertandingan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pertandingan ini?")) return;
    try {
      await fetch(`/api/v1/matches/${id}`, { method: "DELETE" });
      void fetchMatches();
    } catch (err) {
      console.error("Failed to delete match:", err);
      alert("Gagal menghapus pertandingan");
    }
  };

  const formEvents = events.filter((event) => event.sport_id === form.sport_id);

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
          <h1 className="text-2xl font-bold tracking-tight">Jadwal Pertandingan</h1>
          <p className="text-muted-foreground">Kelola jadwal pertandingan di cabor.</p>
        </div>

        {/* Tambah Jadwal Section */}
        <Card className="p-6 border-l-4 border-l-primary shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Tambah Jadwal Baru</h2>
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
            <form onSubmit={handleSubmit} className="grid gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Cabang Olahraga</Label>
                  <Select
                    value={form.sport_id ? String(form.sport_id) : ""}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        sport_id: Number(value),
                        event_id: 0,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih cabang olahraga" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={String(sport.id)}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Nomor Pertandingan</Label>
                  <Select
                    value={form.event_id ? String(form.event_id) : ""}
                    disabled={!form.sport_id}
                    onValueChange={(value) =>
                      setForm({ ...form, event_id: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih nomor pertandingan" />
                    </SelectTrigger>
                    <SelectContent>
                      {formEvents.map((event) => (
                        <SelectItem key={event.id} value={String(event.id)}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Tempat</Label>
                  <Select
                    value={String(form.venue_id)}
                    onValueChange={(v) => setForm({ ...form, venue_id: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tempat" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Judul Pertandingan</Label>
                  <Input
                    placeholder="Contoh: Final Sepakbola"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Bulatan</Label>
                  <Select
                    value={form.round_name}
                    onValueChange={(v) => setForm({ ...form, round_name: v ?? "Kelompok" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kelompok">Kelompok</SelectItem>
                      <SelectItem value="Perempat Final">Perempat Final</SelectItem>
                      <SelectItem value="Semifinal">Semifinal</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                      <SelectItem value="Peringkat">Peringkat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="new-match-start-date">Tanggal Mulai</Label>
                    <Input
                      id="new-match-start-date"
                      type="date"
                      required
                      value={form.start_date}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    />
                    <Label htmlFor="new-match-start-time">Jam Mulai</Label>
                    <Input
                      id="new-match-start-time"
                      type="time"
                      required
                      value={form.start_time}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-match-end-date">Tanggal Selesai</Label>
                    <Input
                      id="new-match-end-date"
                      type="date"
                      required
                      value={form.end_date}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    />
                    <Label htmlFor="new-match-end-time">Jam Selesai</Label>
                    <Input
                      id="new-match-end-time"
                      type="time"
                      required
                      value={form.end_time}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v ?? "SCHEDULED" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                      <SelectItem value="ONGOING">Sedang Berlangsung</SelectItem>
                      <SelectItem value="FINISHED">Selesai</SelectItem>
                      <SelectItem value="POSTPONED">Ditunda</SelectItem>
                      <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Simpan Jadwal Baru
                </Button>
                <Button variant="outline" onClick={closeForm}>
                  Batal
                </Button>
              </div>
            </form>
          )}
          </Card>

        {/* Filters Section */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
             <h3 className="text-md font-semibold">Filter Pertandingan</h3>
             <div className="h-px flex-1 bg-border"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[180px]">
              <Label>Tanggal</Label>
              <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[180px]">
              <Label>Cabang</Label>
              <Select value={filterSport} onValueChange={(v) => setFilterSport(v ?? "all")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  {sports.map((sp) => (
                    <SelectItem key={sp.id} value={String(sp.id)}>{sp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <Button variant="outline" onClick={() => { setFilterDate(""); setFilterStatus("all"); setFilterSport("all"); }}>
              Reset Filter
            </Button>
          </div>
        </Card>

        {/* Matches list */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Kelola Pertandingan</h2>
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
                    <th className="text-left font-medium text-muted-foreground p-2">Cabang Olahraga</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Nomor Pertandingan</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Pertandingan</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Bulatan</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Waktu</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Tempat</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Status</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match) => (
                    <tr key={match.id} className="border-b hover:bg-muted/20">
                      <td className="p-2 font-medium">{match.date}</td>
                      <td className="p-2">{match.sport_name}</td>
                      <td className="p-2">{match.event_name}</td>
                      <td className="p-2">{match.title}</td>
                      <td className="p-2 text-muted-foreground">{match.round_name}</td>
                      <td className="p-2 text-muted-foreground">{match.time}</td>
                      <td className="p-2 text-muted-foreground">{match.venue_name}</td>
                      <td className="p-2">
                        <Badge variant={match.status === "FINISHED" ? "default" : "secondary"}>
                          {statusLabels[match.status] || match.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditForm(match)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(match.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Add/Edit form */}
        {showForm && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editing ? "Edit Pertandingan" : "Tambah Pertandingan"}
              </h2>
              <Button variant="ghost" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="match-contingent-one">Kontingen 1</Label>
                  <Select
                    value={form.contingent_ids[0] ? String(form.contingent_ids[0]) : ""}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        contingent_ids: [Number(value), form.contingent_ids[1]],
                      })
                    }
                  >
                    <SelectTrigger id="match-contingent-one">
                      <SelectValue placeholder="Pilih kontingen pertama" />
                    </SelectTrigger>
                    <SelectContent>
                      {contingents.map((contingent) => (
                        <SelectItem key={contingent.id} value={String(contingent.id)}>
                          {contingent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="match-contingent-two">Kontingen 2</Label>
                  <Select
                    value={form.contingent_ids[1] ? String(form.contingent_ids[1]) : ""}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        contingent_ids: [form.contingent_ids[0], Number(value)],
                      })
                    }
                  >
                    <SelectTrigger id="match-contingent-two">
                      <SelectValue placeholder="Pilih kontingen kedua" />
                    </SelectTrigger>
                    <SelectContent>
                      {contingents.map((contingent) => (
                        <SelectItem key={contingent.id} value={String(contingent.id)}>
                          {contingent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {contingentsError && (
                <p className="text-sm text-destructive" role="alert">
                  Gagal memuat daftar kontingen: {contingentsError}
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Cabang Olahraga</Label>
                  <Select
                    value={form.sport_id ? String(form.sport_id) : ""}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        sport_id: Number(value),
                        event_id: 0,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih cabang olahraga" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={String(sport.id)}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Nomor Pertandingan</Label>
                  <Select
                    value={form.event_id ? String(form.event_id) : ""}
                    disabled={!form.sport_id}
                    onValueChange={(value) =>
                      setForm({ ...form, event_id: Number(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih nomor pertandingan" />
                    </SelectTrigger>
                    <SelectContent>
                      {formEvents.map((event) => (
                        <SelectItem key={event.id} value={String(event.id)}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Tempat</Label>
                  <Select
                    value={String(form.venue_id)}
                    onValueChange={(v) => setForm({ ...form, venue_id: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tempat" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Judul Pertandingan</Label>
                  <Input
                    placeholder="Contoh: Final Sepakbola"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Bulatan</Label>
                  <Select
                    value={form.round_name}
                    onValueChange={(v) => setForm({ ...form, round_name: v ?? "Kelompok" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kelompok">Kelompok</SelectItem>
                      <SelectItem value="Perempat Final">Perempat Final</SelectItem>
                      <SelectItem value="Semifinal">Semifinal</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                      <SelectItem value="Peringkat">Peringkat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="match-start-date">Tanggal Mulai</Label>
                    <Input
                      id="match-start-date"
                      type="date"
                      required
                      value={form.start_date}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    />
                    <Label htmlFor="match-start-time">Jam Mulai</Label>
                    <Input
                      id="match-start-time"
                      type="time"
                      required
                      value={form.start_time}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="match-end-date">Tanggal Selesai</Label>
                    <Input
                      id="match-end-date"
                      type="date"
                      required
                      value={form.end_date}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    />
                    <Label htmlFor="match-end-time">Jam Selesai</Label>
                    <Input
                      id="match-end-time"
                      type="time"
                      required
                      value={form.end_time}
                      onClick={(event) => event.currentTarget.showPicker?.()}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v ?? "SCHEDULED" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Terjadwal</SelectItem>
                      <SelectItem value="ONGOING">Sedang Berlangsung</SelectItem>
                      <SelectItem value="FINISHED">Selesai</SelectItem>
                      <SelectItem value="POSTPONED">Ditunda</SelectItem>
                      <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  {editing ? "Update" : "Simpan"}
                </Button>
                <Button variant="outline" onClick={closeForm}>
                  Batal
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
