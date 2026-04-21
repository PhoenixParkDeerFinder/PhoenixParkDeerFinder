import { useState } from 'react'
import MapView from './components/map/MapView'
import Navbar from './components/layout/Navbar'
import FilterBar from './components/map/FilterBar'
import type { FilterState } from './components/map/FilterBar'
import './App.css'
import AccountPage from './components/account/AccountPage'
import AdminPanel from './components/admin/AdminPanel'

const DEFAULT_FILTERS: FilterState = {
  animalId: null,
  verifiedOnly: false,
  hasPhoto: false,
  maxAgeHours: 12,
}

export default function App() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [accountOpen, setAccountOpen] = useState(false)
  const [adminOpen, setAdminOpen]     = useState(false)

  return (
    <div className="app">
      <Navbar
        onOpenAccount={() => setAccountOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
      />
      <div className="map-wrapper">
        <FilterBar filters={filters} onChange={setFilters} />
        <MapView filters={filters} />
      </div>
      {accountOpen && <AccountPage onClose={() => setAccountOpen(false)} />}
      {adminOpen   && <AdminPanel  onClose={() => setAdminOpen(false)} />}
    </div>
  )
}