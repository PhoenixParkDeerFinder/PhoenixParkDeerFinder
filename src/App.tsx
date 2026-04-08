import { useState } from 'react'
import MapView from './components/map/MapView'
import Navbar from './components/layout/Navbar'
import FilterBar from './components/map/FilterBar'
import type { FilterState } from './components/map/FilterBar'
import './App.css'

const DEFAULT_FILTERS: FilterState = {
  animalId: null,
  verifiedOnly: false,
  hasPhoto: false,
  maxAgeHours: 12,
}

export default function App() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  return (
    <div className="app">
      <Navbar />
      <div className="map-wrapper">
        <FilterBar filters={filters} onChange={setFilters} />
        <MapView {...filters} />
      </div>
    </div>
  )
}