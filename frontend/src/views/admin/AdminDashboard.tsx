import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarRange, TrendingUp, Users, Eye, Edit3 } from "lucide-react";
import { useCompetitionStore } from "../../stores/competitionStore";

export default function AdminDashboard() {
  const matches = useCompetitionStore((state) => state.matches) || [];
  const loading = useCompetitionStore((state) => state.loading.matches);

  useEffect(() => {
    void useCompetitionStore.getState().fetchMatches();
  }, []);

  return (
    <main className="admin-page p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel Admin Cabor</h1>
        <p className="text-muted-foreground">
          Kelola jadwal, skor, dan bagan pertandingan untuk cabang olahraga PORPROV.
        </p>
      </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{matches.length}</p>
                <p className="text-xs text-muted-foreground">Total pertandingan</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {matches.reduce((acc, m) => acc + (m.participants?.length || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total kontingen</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {matches.filter((m) => m.status === "FINISHED").length}
                </p>
                <p className="text-xs text-muted-foreground">Selesai</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {matches.filter((m) => m.status === "FINISHED").length}
                </p>
                <p className="text-xs text-muted-foreground">Selesai / TOTAL</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent matches */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pertandingan Terbaru</h2>
            <Link to="/admin/jadwal" className="text-sm text-primary hover:underline">
              Kelola semua
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
                    <th className="text-left font-medium text-muted-foreground p-2">Cabang</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Judul</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Tanggal</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Waktu</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Tempat</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Status</th>
                    <th className="text-left font-medium text-muted-foreground p-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 10).map((match) => (
                    <tr key={match.id} className="border-b hover:bg-muted/20">
                      <td className="p-2 font-medium">{match.sport_name}</td>
                      <td className="p-2">{match.title}</td>
                      <td className="p-2 text-muted-foreground">{match.date}</td>
                      <td className="p-2 text-muted-foreground">{match.time}</td>
                      <td className="p-2 text-muted-foreground">{match.venue_name}</td>
                      <td className="p-2">
                        <Badge variant={match.status === "FINISHED" ? "default" : "secondary"}>
                          {match.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Link to={`/admin/hasil/${match.id}`} className="text-primary hover:underline">
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link to={`/admin/jadwal/${match.id}`} className="text-primary hover:underline">
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
  );
}
