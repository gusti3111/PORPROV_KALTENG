import { Link } from "react-router-dom";
import ArrowIcon from "./ArrowIcon";
import SiteNavigation from "./SiteNavigation";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link
        className="brand"
        to="/"
        aria-label="PORPROV XIII Kalteng"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span className="brand-mark" aria-hidden="true">
          P<span>13</span>
        </span>
        <span className="brand-copy">
          <strong>PORPROV</strong>
          <small>KALIMANTAN TENGAH</small>
        </span>
      </Link>

      <SiteNavigation />

      <Link className="header-link" to="/#informasi">
        Pusat informasi <ArrowIcon diagonal />
      </Link>
    </header>
  );
}
