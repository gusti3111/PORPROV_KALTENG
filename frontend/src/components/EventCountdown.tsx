import { useEffect, useState } from "react";
import { EVENT_START_DATE } from "../event-config";

export default function EventCountdown() {
  const eventStartTimestamp = EVENT_START_DATE.getTime();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(eventStartTimestamp)) return;

    const updateCountdown = () => {
      setRemaining(Math.max(0, eventStartTimestamp - Date.now()));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1_000);
    return () => window.clearInterval(intervalId);
  }, [eventStartTimestamp]);

  if (!Number.isFinite(eventStartTimestamp)) {
    return (
      <p className="m-0 text-[13px] font-extrabold text-[var(--green)]">
        Tanggal pembukaan belum dikonfigurasi.
      </p>
    );
  }

  if (remaining === 0) {
    return (
      <p className="m-0 text-[13px] font-extrabold text-[var(--green)]">
        PORPROV XIII telah dimulai!
      </p>
    );
  }

  const totalSeconds = Math.floor((remaining ?? 0) / 1_000);
  const units = [
    { label: "Hari", value: Math.floor(totalSeconds / 86_400) },
    { label: "Jam", value: Math.floor(totalSeconds / 3_600) % 24 },
    { label: "Menit", value: Math.floor(totalSeconds / 60) % 60 },
    { label: "Detik", value: totalSeconds % 60 },
  ];

  return (
    <div
      className="flex items-center gap-[9px] max-[620px]:gap-[7px]"
      aria-label="Hitung mundur menuju pembukaan PORPROV XIII Kalimantan Tengah 2026"
    >
      {units.map((unit) => (
        <div
          key={unit.label}
          className="countdown-unit grid min-w-[62px] justify-items-center gap-1 rounded-[var(--ui-radius)] bg-[var(--ui-subtle)] px-2 pt-[10px] pb-2 text-[var(--ui-foreground)] max-[620px]:min-w-0 max-[620px]:flex-1 max-[620px]:px-[5px]"
        >
          <strong className="text-[23px] tabular-nums leading-none tracking-[-0.05em] max-[620px]:text-[21px]">
            {String(unit.value).padStart(2, "0")}
          </strong>
          <span className="countdown-unit-label text-[8px] font-bold">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
