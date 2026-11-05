import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import CaborView from "./views/CaborView";
import HomeView from "./views/HomeView";
import ScheduleView from "./views/ScheduleView";
import VenueView from "./views/VenueView";

function RouteEffects() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const isCabor = pathname === "/cabor";
    const isVenue = pathname === "/venue";
    const isSchedule = pathname === "/jadwal";
    document.title = isCabor
      ? "Cabang Olahraga | PORPROV XIII Kalimantan Tengah 2026"
      : isVenue
        ? "Venue | PORPROV XIII Kalimantan Tengah 2026"
        : isSchedule
          ? "Jadwal Pertandingan | PORPROV XIII Kalimantan Tengah 2026"
        : "PORPROV XIII Kalimantan Tengah 2026";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        isCabor
          ? "Daftar cabang olahraga PORPROV XIII Kalimantan Tengah 2026."
          : isVenue
            ? "Daftar venue pada jadwal sementara PORPROV XIII Kalimantan Tengah 2026."
            : isSchedule
              ? "Jadwal harian PORPROV XIII Kalimantan Tengah 2026."
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
        <Route path="/venue" element={<VenueView />} />
        <Route path="/jadwal" element={<ScheduleView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
