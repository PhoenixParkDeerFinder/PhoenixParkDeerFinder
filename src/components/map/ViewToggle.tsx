import './ViewToggle.css'

export type MapViewType = 'pins' | 'heatmap' | 'predicted'

interface Props {
  view: MapViewType
  onChange: (view: MapViewType) => void
}

const OPTIONS: { value: MapViewType; label: string; title: string }[] = [
  { value: 'pins',      label: 'Pins',      title: 'Show individual sighting pins' },
  { value: 'heatmap',   label: 'Heatmap',   title: 'Show sighting density heatmap' },
  { value: 'predicted', label: 'Predicted', title: 'Show predicted sighting locations' },
]

export default function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="view-toggle" role="group" aria-label="Map view">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={`view-toggle-btn ${view === opt.value ? 'view-toggle-btn-active' : ''}`}
          onClick={() => onChange(opt.value)}
          title={opt.title}
          aria-pressed={view === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}