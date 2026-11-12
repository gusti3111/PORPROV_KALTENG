import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import CaborView from "./views/CaborView";
import BaganView from "./views/BaganView";
import HomeView from "./views/HomeView";
import Newsview from "./views/Newsview";
import ResultsView from "./views/ResultsView";
import ScheduleView from "./views/ScheduleView";
import SportDetailView from "./views/SportDetailView";
import VenueView from "./views/VenueView";
import AdminDashboard from "./views/admin/AdminDashboard";
import MatchUpdateForm from "./views/admin/MatchUpdateForm";
import JadwalPage from "./views/admin/JadwalPage";
import HasilPage from "./views/admin/HasilPage";
import BaganPage from "./views/admin/BaganPage";
import AdminLoginPage from "./views/admin/AdminLoginPage";
import AdminRegisterPage from "./views/admin/AdminRegisterPage";
import AdminGuard from "./components/AdminGuard";

function RouteEffects() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const isCabor = pathname.startsWith("/cabor");
    const isBracket = pathname === "/bagan";
    const isVenue = pathname === "/venue";
    const isSchedule = pathname === "/jadwal";
    const isResults = pathname === "/hasil";
    const isNews = pathname === "/informasi";
    const isAdmin = pathname.startsWith("/admin");
    document.title = isCabor
      ? "Cabang Olahraga | PORPROV XIII Kalimantan Tengah 2026"
      : isBracket
        ? "Bagan Pertandingan | PORPROV XIII Kalimantan Tengah 2026"
        : isVenue
          ? "Venue | PORPROV XIII Kalimantan Tengah 2026"
          : isSchedule
            ? "Jadwal Pertandingan | PORPROV XIII Kalimantan Tengah 2026"
            : isResults
              ? "Rekap hasil pertandingan | PORPROV XIII Kalimantan Tengah 2026"
              : isNews
                ? "Berita dan informasi | PORPROV XIII Kalimantan Tengah 2026"
                : isAdmin
                  ? "Admin Panel | PORPROV XIII Kalimantan Tengah 2026"
                  : "PORPROV XIII Kalimantan Tengah 2026";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        isCabor
          ? "Daftar cabang olahraga PORPROV XIII Kalimantan Tengah 2026."
          : isBracket
            ? "Bagan dan alur pertandingan cabang olahraga PORPROV XIII Kalimantan Tengah 2026."
            : isVenue
              ? "Daftar venue pada jadwal sementara PORPROV XIII Kalimantan Tengah 2026."
              : isSchedule
                ? "Jadwal harian PORPROV XIII Kalimantan Tengah 2026."
                : isResults
                  ? "Rekap hasil pertandingan PORPROV XIII Kalimantan Tengah 2026."
                  : isNews
                    ? "Berita dan informasi PORPROV XIII Kalimantan Tengah 2026."
                    : isAdmin
                      ? "Panel Admin untuk pembaruan skor dan jadwal pertandingan."
                      : "Portal informasi Pekan Olahraga Provinsi XIII Kalimantan Tengah 2026.",
      );

    if (hash) {
      requestAnimationFrame(() => {
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView({ behavior: "smooth" });
      });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteEffects />
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/cabor" element={<CaborView />} />
        <Route path="/cabor/:sportId" element={<SportDetailView />} />
        <Route path="/bagan" element={<BaganView />} />
        <Route path="/venue" element={<VenueView />} />
        <Route path="/jadwal" element={<ScheduleView />} />
        <Route path="/hasil" element={<ResultsView />} />
        <Route path="/informasi" element={<Newsview />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/jadwal" element={<JadwalPage />} />
          <Route path="/admin/hasil" element={<HasilPage />} />
          <Route path="/admin/bagan" element={<BaganPage />} />
          <Route path="/admin/update/:id" element={<MatchUpdateForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
