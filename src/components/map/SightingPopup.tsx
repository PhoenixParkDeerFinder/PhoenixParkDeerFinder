import { Popup } from 'react-leaflet'
import { getPhotoUrl } from '../../lib/mapConfig'
import type { PinWithAnimal } from '../../types'
import "./SightingPopup.css"

interface Props {
  pin: PinWithAnimal
  onClose: () => void
}

export default function SightingPopup({ pin, onClose }: Props) {
  const date = new Date(pin.observed_at).toLocaleDateString('en-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <Popup eventHandlers={{popupclose: onClose}} minWidth={200}>
      <div style={{ fontSize: 13, lineHeight: 1.5 }}>
        {pin.photo_name && (
          <img
            src={getPhotoUrl(pin.photo_name)}
            alt="Sighting photo"
            style={{ width: '100%', borderRadius: 6, marginBottom: 8, objectFit: 'cover', maxHeight: 140 }}
          />
        )}
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          {pin.animals?.common_name ?? 'Unknown animal'}
        </div>
        {pin.animals?.species && (
          <div style={{ fontStyle: 'italic', color: '#6b6a65', marginBottom: 4 }}>
            {pin.animals.species}
          </div>
        )}
        <div style={{ color: '#6b6a65' }}>{date}</div>
        {!pin.is_verified && (
          <div style={{
            marginTop: 8, padding: '3px 8px',
            background: '#FAEEDA', color: '#633806',
            borderRadius: 99, fontSize: 11, display: 'inline-block'
          }}>
            Pending verification
          </div>
        )}
      </div>
    </Popup>
  )
}