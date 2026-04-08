import './Navbar.css'
import AuthDropdown from '../auth/AuthDropdown'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-icon">🦌</span>
        <span className="navbar-title">DeerFinder</span>
      </div>
      <AuthDropdown />
    </nav>
  )
}