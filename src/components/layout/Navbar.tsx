import './Navbar.css'
import AuthDropdown from '../auth/AuthDropdown'

interface Props {
  onOpenAccount: () => void
}

export default function Navbar({onOpenAccount}: Props) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-icon">🦌</span>
        <span className="navbar-title">DeerFinder</span>
      </div>
      <AuthDropdown onOpenAccount={onOpenAccount}/>
    </nav>
  )
}