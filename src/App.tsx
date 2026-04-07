import MapView from "./components/map/MapView";
import Navbar from "./components/layout/Navbar";
import AnimalFilterBar from "./components/map/FilterBar";
import "./App.css";
import React from "react";
import { CssBaseline } from "@mui/material";

export default function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <div className="app">
        <Navbar />
        <div className="map-wrapper">
          <AnimalFilterBar />
          <MapView />
        </div>
      </div>
    </React.Fragment>
  );
}
