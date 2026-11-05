import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PORPROV XIII Kalimantan Tengah 2026",
  description:
    "Portal informasi Pekan Olahraga Provinsi XIII Kalimantan Tengah 2026. Satu semangat untuk berkompetisi, berprestasi, dan tumbuh bersama.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
