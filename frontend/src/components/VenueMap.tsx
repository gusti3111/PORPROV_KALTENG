import { useEffect, useMemo, useRef } from "react";
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
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

function MapViewport({
  venue,
  markerRefs,
}: {
  venue: Venue | null;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!venue) return;
    map.invalidateSize({ animate: false });
    map.closePopup();

    const openSelectedPopup = () => {
      const marker = markerRefs.current.get(venue.name);
      if (marker) {
        marker.openPopup();
      }
    };

    const handleMoveEnd = () => {
      openSelectedPopup();
    };

    map.once("moveend", handleMoveEnd);
    map.flyTo(venue.position, 16, { duration: 0.45 });

    return () => {
      map.off("moveend", handleMoveEnd);
    };
  }, [map, markerRefs, venue]);

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
  containerRef,
}: VenueMapProps) {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const icons = useMemo(
    () => new Map(venues.map((venue) => [venue.name, createVenueIcon(venue.name === selectedVenue?.name)])),
    [selectedVenue?.name, venues],
  );

  return (
    <div className="venue-map-frame" ref={containerRef}>
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
        <MapViewport venue={selectedVenue} markerRefs={markerRefs} />
        {venues.map((venue) => (
          <Marker
            key={venue.name}
            ref={(instance) => {
              if (instance) {
                markerRefs.current.set(venue.name, instance);
              } else {
                markerRefs.current.delete(venue.name);
              }
            }}
            position={venue.position}
            icon={icons.get(venue.name)}
            eventHandlers={{
              click: () => onSelectVenue(venue),
            }}
          >
            <Popup autoPanPadding={[32, 32]}>
              <div style={{ maxWidth: 220 }}>
                {(() => {
                  const photoUrl =
                    venue.image_url?.trim() ||
                    getVenuePhotoUrl(
                      venue.name,
                      `${venue.category} ${venue.note || ""}`,
                    );
                  if (!photoUrl) return null;
                  return (
                    <img
                      src={photoUrl}
                      alt={venue.name}
                      style={{
                        width: "100%",
                        maxHeight: 140,
                        height: "auto",
                        objectFit: "contain",
                        backgroundColor: "#f1f5f9",
                        borderRadius: 6,
                        marginBottom: 8,
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  );
                })()}
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
