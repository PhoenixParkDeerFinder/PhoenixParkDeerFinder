import { useState } from 'react'
import { getPhotoUrl } from '../../lib/mapConfig'
import './PinReviewCard.css'
import type { PinWithAnimal } from '../../types/pin.types'

interface Props {
  pin: PinWithAnimal
  onVerify: (id: number) => Promise<boolean>
  onDelete: (id: number) => Promise<boolean>
}

export default function PinReviewCard({ pin, onVerify, onDelete }: Props) {
  const [busy, setBusy] = useState<'verify' | 'delete' | null>(null)
  const [done, setDone] = useState<'verified' | 'deleted' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [lng, lat] = pin.location.coordinates

  async function handleVerify() {
    setBusy('verify')
    const ok = await onVerify(pin.id)
    setBusy(null)
    if (ok) setDone('verified')
    else setError('Failed to verify pin.')
  }

  async function handleDelete() {
    if (!confirm('Delete this pin? This cannot be undone.')) return
    setBusy('delete')
    const ok = await onDelete(pin.id)
    setBusy(null)
    if (ok) setDone('deleted')
    else setError('Failed to delete pin.')
  }

  if (done) {
    return (
      <div className={`review-card review-card-done review-card-${done}`}>
        {done === 'verified' ? '✓ Verified' : '✕ Deleted'}
      </div>
    )
  }

  return (
    <div className="review-card">
      <div className="review-card-main">

        {/* Photo */}
        <div className="review-photo-wrap">
          {pin.photo_name
            ? <img src={getPhotoUrl(pin.photo_name)} alt="Sighting" className="review-photo" />
            : <div className="review-photo review-photo-empty">No photo</div>
          }
        </div>

        {/* Info */}
        <div className="review-info">
          <div className="review-animal">
            {pin.animals?.common_name ?? 'Unknown'}
            {pin.animals?.species && (
              <span className="review-species"> — {pin.animals.species}</span>
            )}
          </div>

          <div className="review-meta-grid">
            <span className="review-meta-label">Observed</span>
            <span>{new Date(pin.observed_at).toLocaleString('en-IE', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}</span>

            <span className="review-meta-label">Submitted</span>
            <span>{new Date(pin.created_at).toLocaleString('en-IE', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}</span>

            <span className="review-meta-label">Contributor</span>
            <span className="review-contributor">
              {pin.profiles?.username ?? <em>anon</em>}
            </span>

            <span className="review-meta-label">Coordinates</span>
            <code className="review-coords">{lat.toFixed(5)}, {lng.toFixed(5)}</code>

            <span className="review-meta-label">Status</span>
            <span className={`badge ${pin.is_verified ? 'badge-verified' : 'badge-pending'}`}>
              {pin.is_verified ? 'Verified' : 'Pending'}
            </span>
          </div>

          {error && <div className="form-error" style={{ marginTop: 8 }}>{error}</div>}
        </div>
      </div>

      {/* Actions */}
      <div className="review-actions">
        <button
          className="btn btn-primary"
          onClick={handleVerify}
          disabled={!!busy || pin.is_verified}
        >
          {busy === 'verify' ? 'Verifying…' : '✓ Verify'}
        </button>
        <button
          className="btn review-btn-delete"
          onClick={handleDelete}
          disabled={!!busy}
        >
          {busy === 'delete' ? 'Deleting…' : '✕ Delete'}
        </button>
      </div>
    </div>
  )
}