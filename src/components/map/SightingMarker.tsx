import { Marker } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";
import SightingPopup from "./SightingPopup";
import type { PinWithAnimal } from "../../types/pin.types";

function makeIcon(iconUrl: string | null, isVerified: boolean, animalId: number) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 32px; height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${isVerified ? "#1D9E75" : "#888780"};
        border: 2px solid white;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        opacity: ${isVerified ? "1" : "0.65"};
      ">
        ${
          iconUrl
            ? `<img src="${iconUrl}" style="width:16px;height:16px;transform:rotate(45deg);border-radius:50%" />`
            : `<span style="transform:rotate(45deg);font-size:14px">${chooseAnimalEmoji(animalId)}</span>`
        }
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

function chooseAnimalEmoji(animalId: number) {
  switch (animalId) {
    case 1:
      return "🦌"
    case 2:
      return "🦊"
    case 3: 
      return "🐰"
    default:
      return "IDK"
  }
    
}

export default function SightingMarker({ pin }: { pin: PinWithAnimal }) {
  const [open, setOpen] = useState(false);
  const [lng, lat] = pin.location.coordinates; 
  const position: [number, number] = [lat, lng];

  return (
    <Marker
      position={position}
      icon={makeIcon(pin.animals?.icon_url ?? null, pin.is_verified, pin.animal_id)}
      eventHandlers={{ click: () => setOpen(true) }}
    >
      {open && <SightingPopup pin={pin} onClose={() => setOpen(false)} />}
    </Marker>
  );
}
