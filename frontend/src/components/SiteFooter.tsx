import { Link } from "react-router-dom";
import ArrowIcon from "./ArrowIcon";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="brand footer-brand" to="/">
        <img
          className="brand-logo"
          src="/iconporKalteng.jpeg"
          alt="Logo PORPROV XIII Kalimantan Tengah"
        />
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
