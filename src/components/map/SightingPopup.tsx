import { Popup } from 'react-leaflet'
import { getPhotoUrl } from '../../lib/mapConfig'
import type { PinWithAnimal } from '../../types'
import "./SightingPopup.css"

interface Props {
  pin: PinWithAnimal
  onClose: () => void
}

export default function SightingPopup({ pin, onClose }: Props) {
  const date = new Date(pin.observed_at).toLocaleDateString('en-IE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const contributor = pin.profiles?.username ?? 'anon'

  return (
    <Popup eventHandlers={{popupclose: onClose}} minWidth={200}>
       <div className="popup">
        {pin.photo_name && (
          <img
            src={getPhotoUrl(pin.photo_name)}
            alt="Sighting"
            className="popup-photo"
          />
        )}

        <div className="popup-animal">
          {pin.animals?.common_name ?? 'Unknown animal'}
        </div>

        {pin.animals?.species && (
          <div className="popup-species">{pin.animals.species}</div>
        )}

        <div className="popup-meta">
          <span>{date}</span>
          <span className="popup-dot">·</span>
          <span className="popup-contributor">
            {pin.profiles ? contributor : <em>anon</em>}
          </span>
        </div>

        {!pin.is_verified && (
          <span className="badge badge-pending popup-badge">Pending verification</span>
        )}
      </div>
    </Popup>
  )
}