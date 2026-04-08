import { useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { postgisPointToLatLng } from "../../lib/mapConfig";
import SightingMarker from "./SightingMarker";
import CreatePinModal from "../sightings/CreatePinModal";
import type { LatLng } from "leaflet";
import { Polygon } from "react-leaflet";
import { usePark, usePins } from "../../hooks";
import "./MapView.css"
import type { FilterState } from "./FilterBar";

function ClickHandler({
  onMapClick,
}: {
  onMapClick: (latlng: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapView(filters: FilterState) {
  const { park, loading: parkLoading } = usePark();
  const { pins, loading: pinsLoading } = usePins(park?.id ?? null, filters);
  const [pendingLatLng, setPendingLatLng] = useState<LatLng | null>(null);

  if (parkLoading) return <div className="map-loading">Loading map...</div>;
  if (!park) return <div className="map-loading">Park not found.</div>;

  const center = postgisPointToLatLng(park.center_location);

  const adjustedCoordinates: [number, number][] = []

  if (park.bounds) {
    for (let i = 0; i < park.bounds.coordinates[0].length; i++) {
      const x = park.bounds.coordinates[0][i][1]
      const y = park.bounds.coordinates[0][i][0]

      adjustedCoordinates.push([x,y])
    }
  }

  return (
    <>
      <MapContainer
        center={center}
        zoom={park.default_zoom}
        minZoom={park.default_zoom-1}
        zoomControl={false}
        className="map-view-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onMapClick={setPendingLatLng} />

        {!pinsLoading &&
          pins.map((pin) => <SightingMarker key={pin.id} pin={pin} />)}

        {park.bounds && (
          <Polygon
            positions={adjustedCoordinates}
            pathOptions={{ color: "#1D9E75"}}
          />
        )}
      </MapContainer>

      {pendingLatLng && (
        <CreatePinModal
          latlng={pendingLatLng}
          parkId={park.id}
          onClose={() => setPendingLatLng(null)}
        />
      )}
    </>
  );
}
