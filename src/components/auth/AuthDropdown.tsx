import { useRef, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import './AuthDropdown.css'

type Panel = 'signin' | 'signup'

export default function AuthDropdown() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<Panel>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Reset form when switching panels or closing
  function switchPanel(p: Panel) {
    setPanel(p)
    setError(null)
    setSuccessMsg(null)
    setEmail('')
    setPassword('')
  }

  function handleOpen() {
    setOpen(o => !o)
    setError(null)
    setSuccessMsg(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setSubmitting(true)

    if (panel === 'signin') {
      const err = await signIn(email, password)
      if (err) {
        setError(err)
      } else {
        setOpen(false)
        setEmail('')
        setPassword('')
      }
    } else {
      const err = await signUp(email, password)
      if (err) {
        setError(err)
      } else {
        setSuccessMsg('Account created! Check your email to confirm your address.')
        setEmail('')
        setPassword('')
      }
    }

    setSubmitting(false)
  }

  if (loading) return <div className="auth-skeleton" />

  return (
    <div className="auth-root" ref={ref}>

      {/* Trigger button */}
      {user ? (
        <button className="auth-trigger auth-trigger-user" onClick={handleOpen} aria-expanded={open}>
          <span className="auth-avatar">{user.email?.[0].toUpperCase()}</span>
          <svg className={`auth-chevron ${open ? 'auth-chevron-open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ) : (
        <button className="auth-trigger" onClick={handleOpen} aria-expanded={open}>
          Sign in
          <svg className={`auth-chevron ${open ? 'auth-chevron-open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className="auth-dropdown" role="dialog" aria-label="Authentication">

          {user ? (
            // ── Logged-in panel ───────────────────
            <>
              <div className="auth-user-info">
                <div className="auth-avatar auth-avatar-lg">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="auth-user-email">{user.email}</div>
              </div>

              <div className="auth-divider" />

              <button className="auth-menu-item" onClick={() => setOpen(false)}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M2 13c0-3.5 2.5-5 5.5-5s5.5 1.5 5.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Account settings
              </button>

              <div className="auth-divider" />

              <button className="auth-menu-item auth-menu-item-danger" onClick={() => { signOut(); setOpen(false) }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M6 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign out
              </button>
            </>

          ) : (
            // ── Auth form panel ───────────────────
            <>
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${panel === 'signin' ? 'auth-tab-active' : ''}`}
                  onClick={() => switchPanel('signin')}
                >
                  Sign in
                </button>
                <button
                  className={`auth-tab ${panel === 'signup' ? 'auth-tab-active' : ''}`}
                  onClick={() => switchPanel('signup')}
                >
                  Register
                </button>
              </div>

              {successMsg ? (
                <div className="auth-success">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="#0F6E56" strokeWidth="1.5"/>
                    <path d="M6 10l3 3 5-5" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>{successMsg}</p>
                </div>
              ) : (
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="auth-email">Email</label>
                    <input
                      id="auth-email"
                      className="auth-input"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="auth-password">Password</label>
                    <input
                      id="auth-password"
                      className="auth-input"
                      type="password"
                      autoComplete={panel === 'signup' ? 'new-password' : 'current-password'}
                      placeholder={panel === 'signup' ? 'At least 6 characters' : '••••••••'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  {error && <div className="auth-error">{error}</div>}

                  <button
                    className="btn btn-primary btn-full auth-submit"
                    type="submit"
                    disabled={submitting || !email || !password}
                  >
                    {submitting
                      ? 'Please wait…'
                      : panel === 'signin' ? 'Sign in' : 'Create account'
                    }
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}