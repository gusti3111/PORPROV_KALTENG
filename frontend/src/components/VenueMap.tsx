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
              <strong>{venue.name}</strong>
              <br />
              <span>Pin perkiraan area — koordinat resmi belum tersedia.</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="venue-map-notice">
        <span aria-hidden="true">!</span>
        Semua pin adalah perkiraan di area Pangkalan Bun, bukan titik alamat
        resmi.
      </div>
    </div>
  );
}
