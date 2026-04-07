import { useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { postgisPointToLatLng } from "../../lib/mapConfig";
import SightingMarker from "./SightingMarker";
import CreatePinModal from "../sightings/CreatePinModal";
import type { LatLng } from "leaflet";
import { Polygon } from "react-leaflet";
import { usePark, usePins } from "../../hooks";
import "./MapView.css"

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

export default function MapView({selectedAnimalId} : {selectedAnimalId : number}) {
  const { park, loading: parkLoading } = usePark();
  const { pins, loading: pinsLoading } = usePins(park?.id ?? null, selectedAnimalId);
  const [pendingLatLng, setPendingLatLng] = useState<LatLng | null>(null);

  if (parkLoading) return <div className="map-loading">Loading map...</div>;
  if (!park) return <div className="map-loading">Park not found.</div>;

  const center = postgisPointToLatLng(park.center_location);

  return (
    <>
      <MapContainer
        center={center}
        zoom={park.default_zoom}
        style={{ height: "100vh", width: "100%" }}
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
            positions={park.bounds.coordinates}
            pathOptions={{ color: "#1D9E75", fillOpacity: 0.3, weight: 2 }}
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
