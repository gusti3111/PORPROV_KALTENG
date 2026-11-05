"use client";

import { useEffect, useState } from "react";
import { EVENT_START_DATE } from "./event-config";

const eventStartTimestamp = EVENT_START_DATE.getTime();
export default function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(eventStartTimestamp)) {
      return;
    }

    const updateCountdown = () => {
      setRemaining(Math.max(0, eventStartTimestamp - Date.now()));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1_000);

    return () => window.clearInterval(intervalId);
  }, []);

  if (!Number.isFinite(eventStartTimestamp)) {
    return (
      <p className="countdown-message">
        Tanggal pembukaan belum dikonfigurasi.
      </p>
    );
  }

  if (remaining === 0) {
    return <p className="countdown-message">PORPROV XIII telah dimulai!</p>;
  }

  const totalSeconds = Math.floor((remaining ?? 0) / 1_000);
  const values = [
    { label: "Hari", value: Math.floor(totalSeconds / 86_400) },
    { label: "Jam", value: Math.floor(totalSeconds / 3_600) % 24 },
    { label: "Menit", value: Math.floor(totalSeconds / 60) % 60 },
    { label: "Detik", value: totalSeconds % 60 },
  ];

  return (
    <div
      className="countdown-units"
      aria-label="Hitung mundur menuju pembukaan PORPROV XIII Kalimantan Tengah 2026"
    >
      {values.map(({ label, value }) => (
        <div className="countdown-unit" key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
