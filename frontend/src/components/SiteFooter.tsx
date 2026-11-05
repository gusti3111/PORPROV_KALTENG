import { Link } from "react-router-dom";
import ArrowIcon from "./ArrowIcon";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="brand footer-brand" to="/">
        <span className="brand-mark" aria-hidden="true">
          P<span>13</span>
        </span>
        <span className="brand-copy">
          <strong>PORPROV</strong>
          <small>KALIMANTAN TENGAH</small>
        </span>
      </Link>
      <p>PORPROV XIII Kalimantan Tengah 2026</p>
      <Link className="footer-top" to="/">
        BERANDA <ArrowIcon diagonal />
      </Link>
      <span className="footer-note">
        Informasi resmi akan diperbarui oleh penyelenggara.
      </span>
    </footer>
  );
}
