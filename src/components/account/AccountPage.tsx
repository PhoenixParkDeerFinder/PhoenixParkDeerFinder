import { useState, useEffect } from "react";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../hooks/useAuth";
import "./AccountPage.css";

interface Props {
  onClose: () => void;
}

export default function AccountPage({ onClose }: Props) {
  const { user } = useAuth();
  const { profile, loading, updateUsername } = useProfile(user?.id ?? null);

  const [username, setUsername] = useState<string | undefined>(profile?.username)
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayUsername = username ?? profile?.username ?? ""

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isDirty = profile && username !== profile.username;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isDirty) return;
    setError(null);
    setSaving(true);
    const err = await updateUsername(username!.trim());
    setSaving(false);
    if (err) {
      setError(err);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <div className="account-overlay" onClick={onClose}>
      <div className="account-panel" onClick={(e) => e.stopPropagation()}>
        <div className="account-header">
          <h2 className="account-title">Account</h2>
          <button
            className="btn btn-ghost account-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="state-centered">Loading profile…</div>
        ) : (
          <>
            {/* Email — read only */}
            <div className="account-section">
              <div className="account-label">Email</div>
              <div className="account-value">{user?.email}</div>
            </div>

            <div className="account-divider" />

            {/* Username */}
            <div className="account-section">
              <form onSubmit={handleSave}>
                <label className="account-label" htmlFor="username-input">
                  Display username
                </label>
                <p className="account-hint">
                  Shown on pins you create. 3–20 characters, letters, numbers
                  and underscores only.
                </p>
                <div className="account-input-row">
                  <input
                    id="username-input"
                    className="form-input"
                    type="text"
                    value={displayUsername}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setSaved(false);
                    }}
                    placeholder="your_username"
                    minLength={3}
                    maxLength={20}
                    disabled={saving}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!isDirty || saving}
                  >
                    {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
                  </button>
                </div>
                {error && <div className="form-error">{error}</div>}
              </form>
            </div>

            <div className="account-divider" />

            {/* Account info */}
            <div className="account-section account-meta">
              <span>
                Member since{" "}
                {new Date(user?.created_at ?? "").toLocaleDateString("en-IE", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
