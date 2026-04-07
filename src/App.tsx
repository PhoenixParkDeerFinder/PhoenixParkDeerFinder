import { useState } from "react";
import MapView from "./components/map/MapView";
import Navbar from "./components/layout/Navbar";
import AnimalFilterBar from "./components/map/AnimalFilterBar";
import "./App.css";

export default function App() {
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);

  return (
    <div className="app">
      <Navbar />
      <div className="map-wrapper">
        <AnimalFilterBar
          selectedId={selectedAnimalId}
          onChange={setSelectedAnimalId}
        />
        <MapView />
      </div>
    </div>
  );
}
