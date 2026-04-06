import MapView from './components/map/MapView'
import './lib/mapConfig'   // runs the L.Icon.Default.mergeOptions side-effect

export default function App() {
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <MapView />
    </div>
  )
}