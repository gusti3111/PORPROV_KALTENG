import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Venue } from "../api/types";
import { getVenuePhotoUrl } from "../utils/venuePhoto";

type VenueMapProps = {
  venues: Venue[];
  selectedVenue: Venue | null;
  onSelectVenue: (venue: Venue) => void;
};

function MapViewport({ venue }: { venue: Venue | null }) {
  const map = useMap();

  useEffect(() => {
    if (venue) map.flyTo(venue.position, 16, { duration: 0.45 });
  }, [map, venue]);

  return null;
}

function createVenueIcon(selected: boolean) {
  return L.divIcon({
    className: "venue-map-marker",
    html: `<span class="venue-map-marker-pin${selected ? " is-selected" : ""}"><span></span></span>`,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    popupAnchor: [0, -34],
  });
}

export default function VenueMap({
  venues,
  selectedVenue,
  onSelectVenue,
}: VenueMapProps) {
  const icons = useMemo(
    () => new Map(venues.map((venue) => [venue.name, createVenueIcon(venue.name === selectedVenue?.name)])),
    [selectedVenue?.name, venues],
  );

  return (
    <div className="venue-map-frame">
      <MapContainer
        className="venue-map"
        center={[-2.6765645, 111.6316259]}
        zoom={14}
        scrollWheelZoom
        aria-label="Peta interaktif venue PORPROV XIII"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport venue={selectedVenue} />
        {venues.map((venue) => (
          <Marker
            key={venue.name}
            position={venue.position}
            icon={icons.get(venue.name)}
            eventHandlers={{
              click: () => onSelectVenue(venue),
            }}
          >
            <Popup>
              <div style={{ maxWidth: 220 }}>
                <img
                  src={getVenuePhotoUrl(venue.name, `${venue.category} ${venue.note || ""}`)}
                  alt={venue.name}
                  style={{ width: "100%", height: 105, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/venues/GORSportCenter.jpeg";
                  }}
                />
                <strong style={{ fontSize: 13, display: "block", marginBottom: 2 }}>{venue.name}</strong>
                {venue.category && (
                  <small style={{ color: "#174a72", fontWeight: 700, display: "block" }}>
                    {venue.category}
                  </small>
                )}
                {venue.address && (
                  <span style={{ fontSize: 11, color: "#666", display: "block", marginTop: 2 }}>
                    {venue.address}
                  </span>
                )}
                {venue.note && (
                  <small style={{ color: "#888", fontSize: 10, display: "block", marginTop: 4 }}>
                    {venue.note}
                  </small>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="venue-map-notice">
        <span aria-hidden="true">!</span>
        Titik pin disesuaikan dengan lokasi geografis venue di Kotawaringin Barat & Palangka Raya.
      </div>
    </div>
  );
}
