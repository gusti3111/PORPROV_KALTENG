import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarRange,
  Edit3,
  GitBranch,
  Medal,
  Plus,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useCompetitionStore } from "../../stores/competitionStore";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import AdminNav from "../../components/AdminNav";

function getTodayJakarta() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

export default function AdminDashboard() {
  const matches = useCompetitionStore((state) => state.matches) || [];
  const medalStandings = useCompetitionStore((state) => state.medalStandings) || [];
  const loading = useCompetitionStore((state) => state.loading.matches);

  useEffect(() => {
    void useCompetitionStore.getState().fetchMatches();
    void useCompetitionStore.getState().fetchMedalStandings();
    void useCompetitionStore.getState().fetchSports();
  }, []);

  const today = getTodayJakarta();
  const todayMatches = matches.filter((m) => m.date === today);
  const finishedMatches = matches.filter((m) => m.status === "FINISHED");
  const totalMedals = medalStandings.reduce((acc, s) => acc + s.total, 0);

  const statusLabels: Record<string, string> = {
    SCHEDULED: "Terjadwal",
    ONGOING: "Berlangsung",
    FINISHED: "Selesai",
    POSTPONED: "Ditunda",
    CANCELLED: "Dibatalkan",
  };

  return (
    <>
      <SiteHeader />
      <main className="admin-page p-6 space-y-6 max-w-7xl mx-auto">
        <AdminNav />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Panel Admin Pertandingan PORPROV XIII Kalteng 2026
            </h1>
            <p className="text-muted-foreground">
              Input jadwal hari ini, cabang olahraga, nomor pertandingan, kontingen, skor, klasemen grup, hingga bagan perempat final &amp; final yang otomatis tampil di web utama.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/jadwal">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Input Jadwal Hari Ini
              </Button>
            </Link>
            <Link to="/admin/hasil">
              <Button variant="outline" className="gap-2">
                <Trophy className="h-4 w-4" /> Input Hasil &amp; Pemenang
              </Button>
            </Link>
            <Link to="/admin/bagan">
              <Button variant="outline" className="gap-2">
                <GitBranch className="h-4 w-4" /> Kelola Klasemen &amp; Bagan
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayMatches.length}</p>
                <p className="text-xs text-muted-foreground">
                  Pertandingan Hari Ini ({today})
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{matches.length}</p>
                <p className="text-xs text-muted-foreground">Total Jadwal Terdaftar</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{finishedMatches.length}</p>
                <p className="text-xs text-muted-foreground">
                  Pertandingan Selesai &amp; Pemenang
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Medal className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMedals}</p>
                <p className="text-xs text-muted-foreground">
                  Medali Tercatat di Klasemen Utama
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent matches */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Daftar Jadwal &amp; Hasil Pertandingan</h2>
              <p className="text-xs text-muted-foreground">
                Klik &quot;Input Skor / Pemenang&quot; untuk memperbarui hasil yang otomatis mengupdate Klasemen Grup, Bagan Penyisihan, dan Perolehan Medali.
              </p>
            </div>
            <Link to="/admin/jadwal" className="text-sm text-primary font-semibold hover:underline">
              Kelola Semua Jadwal →
            </Link>
          </div>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Memuat data...</p>
          ) : matches.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Belum ada pertandingan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium text-muted-foreground p-2">Tanggal &amp; Jam</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Cabang &amp; Nomor</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Babak / Fase</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Kontingen Bertanding &amp; Skor</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Venue</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Status</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 15).map((match) => {
                    const home = match.participants?.[0];
                    const away = match.participants?.[1];
                    return (
                      <tr key={match.id} className="border-b hover:bg-muted/20">
                        <td className="p-2 whitespace-nowrap">
                          <div className="font-medium">{match.date}</div>
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
                          {home || away ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={home?.is_winner ? "font-bold text-emerald-700" : ""}>
                                  {home?.contingent_name || "TBA"}
                                </span>
                                {home?.score && (
                                  <Badge variant="secondary" className="text-xs">
                                    {home.score}
                                  </Badge>
                                )}
                                {home?.is_winner && (
                                  <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">
                                    Pemenang
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={away?.is_winner ? "font-bold text-emerald-700" : ""}>
                                  {away?.contingent_name || "TBA"}
                                </span>
                                {away?.score && (
                                  <Badge variant="secondary" className="text-xs">
                                    {away.score}
                                  </Badge>
                                )}
                                {away?.is_winner && (
                                  <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">
                                    Pemenang
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Belum dipilih</span>
                          )}
                        </td>
                        <td className="p-2 text-muted-foreground text-xs">{match.venue_name}</td>
                        <td className="p-2">
                          <Badge variant={match.status === "FINISHED" ? "default" : "secondary"}>
                            {statusLabels[match.status] || match.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1.5">
                            <Link to={`/admin/update/${match.id}`}>
                              <Button size="sm" variant="default" className="h-8 gap-1 text-xs">
                                <Trophy className="h-3.5 w-3.5" /> Input Hasil
                              </Button>
                            </Link>
                            <Link to={`/admin/jadwal?edit=${match.id}`}>
                              <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
                                <Edit3 className="h-3.5 w-3.5" /> Edit
                              </Button>
                            </Link>
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
