import { useState, useEffect } from 'react'
import type { LatLng } from 'leaflet'
import { latLng } from 'leaflet'
import { useAnimals } from '../../hooks/useAnimals'
import { useCreatePin } from '../../hooks/useCreatePin'
import { useGeolocation } from '../../hooks/useGeolocation'
import PhotoUploader from './PhotoUploader'
import './CreatePinModal.css'

interface Props {
  latlng: LatLng
  parkId: number
  onClose: () => void
}

type Step = 'form' | 'submitting' | 'success' | 'blocked'

export default function CreatePinModal({ latlng: initialLatLng, parkId, onClose }: Props) {
  const { animals, loading: animalsLoading } = useAnimals()
  const { createPin, error: createError } = useCreatePin()
  const { status: geoStatus, request: requestGeo } = useGeolocation()

  const [step, setStep] = useState<Step>('form')
  const [animalId, setAnimalId] = useState<number | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [coords, setCoords] = useState(initialLatLng)
  const [accuracy, setAccuracy] = useState<number | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleUseGPS() {
    const result = await requestGeo()
    if (result) {
      setCoords(latLng(result.lat, result.lng))
      setAccuracy(result.accuracy)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!animalId) { setErrorMsg('Please select an animal.'); return }
    setErrorMsg(null)
    setStep('submitting')

    const result = await createPin({ latlng: coords, parkId, animalId, photoFile })

    if (result === 'blocked') { setStep('blocked'); return }
    if (result === 'error') { setStep('form'); setErrorMsg(createError ?? 'Something went wrong.'); return }
    setStep('success')
  }

  const gpsWasUsed = coords !== initialLatLng

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {step === 'form' && (
          <>
            <div className="modal-header">
              <div className="modal-title">Log a sighting</div>
              <button className="modal-close btn-ghost" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Coordinates row */}
              <label className="form-label">Location</label>
              <div className="pin-location-row">
                <code className="modal-coords">
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </code>
                <button
                  type="button"
                  className={`btn btn-secondary pin-gps-btn ${gpsWasUsed ? 'pin-gps-btn-active' : ''}`}
                  onClick={handleUseGPS}
                  disabled={geoStatus === 'requesting'}
                  title="Use my current location"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M6.5 1v1.5M6.5 10.5V12M1 6.5h1.5M10.5 6.5H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  {geoStatus === 'requesting' ? 'Locating…' : 'Use my location'}
                </button>
              </div>

              {/* GPS status messages */}
              {geoStatus === 'success' && accuracy !== null && (
                <p className="pin-gps-note pin-gps-note-success">
                  GPS resolved — accurate to ~{accuracy}m
                </p>
              )}
              {geoStatus === 'denied' && (
                <p className="pin-gps-note pin-gps-note-error">
                  Location access was denied. Enable it in your browser settings.
                </p>
              )}
              {geoStatus === 'unavailable' && (
                <p className="pin-gps-note pin-gps-note-error">
                  Geolocation is not available in this browser.
                </p>
              )}
              {geoStatus === 'error' && (
                <p className="pin-gps-note pin-gps-note-error">
                  Could not get your location. Try again.
                </p>
              )}

              {/* Animal select */}
              <label className="form-label" htmlFor="animal-select">Animal</label>
              {animalsLoading
                ? <div className="modal-text">Loading animals…</div>
                : (
                  <select
                    id="animal-select"
                    className="form-select"
                    value={animalId ?? ''}
                    onChange={e => setAnimalId(Number(e.target.value))}
                    required
                  >
                    <option value="" disabled>Select a species…</option>
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.common_name}{a.species ? ` — ${a.species}` : ''}
                      </option>
                    ))}
                  </select>
                )
              }

              {/* Photo */}
              <label className="form-label">
                Photo <span className="form-label-optional">(optional)</span>
              </label>
              <PhotoUploader onFileSelected={setPhotoFile} />

              {errorMsg && <div className="form-error">{errorMsg}</div>}

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 20 }}>
                Submit sighting
              </button>
            </form>
          </>
        )}

        {step === 'submitting' && (
          <div className="modal-centered">
            <div className="modal-text">Saving your sighting…</div>
          </div>
        )}

        {step === 'success' && (
          <div className="modal-centered">
            <div className="modal-success-icon">✓</div>
            <div className="modal-heading">Sighting logged!</div>
            <div className="modal-text">Your pin will appear on the map shortly.</div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 20 }} onClick={onClose}>
              Close
            </button>
          </div>
        )}

        {step === 'blocked' && (
          <div className="modal-centered">
            <div style={{ fontSize: 28, marginBottom: 12 }}>🚫</div>
            <div className="modal-heading">Too many sightings</div>
            <div className="modal-text">You've reached the anonymous submission limit. Try again later.</div>
            <button className="btn btn-secondary btn-full" style={{ marginTop: 20 }} onClick={onClose}>
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  )
}