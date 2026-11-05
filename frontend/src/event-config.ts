export const EVENT_START_AT =
  import.meta.env.VITE_EVENT_START_AT || "2026-11-28T00:00:00+07:00";

export const EVENT_START_DATE = new Date(EVENT_START_AT);

export const EVENT_START_LABEL = Number.isFinite(EVENT_START_DATE.getTime())
  ? `${new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(EVENT_START_DATE)} • ${new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(EVENT_START_DATE)} WIB`
  : "Tanggal belum dikonfigurasi";
