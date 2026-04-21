import { useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { postgisPointToLatLng } from "../../lib/mapConfig";
import SightingMarker from "./SightingMarker";
import CreatePinModal from "../sightings/CreatePinModal";
import type { LatLng } from "leaflet";
import "./MapView.css";
import type { FilterState } from "./FilterBar";
import { usePark } from "../../hooks/usePark";
import { usePins } from "../../hooks/usePins";
import { usePredictedPins } from "../../hooks/usePredictedPins";
import HeatmapLayer from "./HeatmapLayer";
import ViewToggle, { type MapViewType } from "./ViewToggle";

interface Props {
  filters: FilterState;
}

function ClickHandler({
  onMapClick,
}: {
  onMapClick: (latlng: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      console.log(e);
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapView({ filters }: Props) {
  const parkId = 2; //TODO: Implement props

  const { park, loading: parkLoading } = usePark(parkId);
  const { pins, loading: pinsLoading } = usePins(park?.id ?? null, filters);
  const { pins: predictedPins, loading: predictedLoading } = usePredictedPins(
    park?.id ?? null,
    filters.animalId,
  );
  const [pendingLatLng, setPendingLatLng] = useState<LatLng | null>(null);
  const [mapView, setMapView] = useState<MapViewType>("pins");

  if (parkLoading) return <div className="map-loading">Loading map...</div>;
  if (!park) return <div className="map-loading">Park not found.</div>;

  const center = postgisPointToLatLng(park.center_location);
  const clickEnabled = mapView === "pins";

  const adjustedCoordinates: [number, number][] = [];

  if (park.bounds) {
    for (let i = 0; i < park.bounds.coordinates[0].length; i++) {
      const x = park.bounds.coordinates[0][i][1];
      const y = park.bounds.coordinates[0][i][0];

      adjustedCoordinates.push([x, y]);
    }
  }

  return (
    <>
      <MapContainer
        center={center}
        zoom={park.default_zoom}
        style={{ height: "100%", width: "100%", zIndex: "0" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clickEnabled && <ClickHandler onMapClick={setPendingLatLng} />}

        {mapView === "pins" &&
          !pinsLoading &&
          pins.map((pin) => <SightingMarker key={pin.id} pin={pin} />)}

        {mapView === "heatmap" && !pinsLoading && (
          <HeatmapLayer pins={pins} mode="actual" />
        )}

        {mapView === "predicted" && !predictedLoading && (
          <HeatmapLayer pins={predictedPins} mode="predicted" />
        )}
      </MapContainer>

      <ViewToggle view={mapView} onChange={setMapView} />
      {mapView === "predicted" && (
        <div className="predicted-banner">
          Showing likely sighting locations based on historical data for this
          time of day and season
        </div>
      )}

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
