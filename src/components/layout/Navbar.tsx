import "./Navbar.css";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, signIn, signOut, loading } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-icon">🦌</span>
        <span className="navbar-title">DeerFinder</span>
      </div>

      <div className="navbar-actions">
        {loading ? null : user ? (
          <>
            <span className="navbar-user">{user.email}</span>
            <button className="btn btn-ghost" onClick={signOut}>
              Sign out
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={signIn}>
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
