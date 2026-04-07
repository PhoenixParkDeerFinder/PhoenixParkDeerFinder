import { Popup } from "react-leaflet";
import { getPhotoUrl } from "../../lib/mapConfig";
import type { PinWithAnimal } from "../../types";

interface Props {
  pin: PinWithAnimal;
  onClose: () => void;
}

export default function SightingPopup({ pin, onClose }: Props) {
  const date = new Date(pin.observed_at).toLocaleDateString("en-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Popup eventHandlers={{ popupclose: onClose }}>
      <div>
        {pin.photo_url && (
          <img src={getPhotoUrl(pin.photo_url)} alt="Sighting photo" />
        )}
        <div>{pin.animals?.common_name ?? "Unknown animal"}</div>
        {pin.animals?.species && <div>{pin.animals.species}</div>}
        <div>{date}</div>
        {!pin.is_verified && <div>Pending verification</div>}
      </div>
    </Popup>
  );
}
