import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/Appheader";
import Field from "../components/Field";
import { setChoice, type ThemeChoice } from "../lib/Theme";
import { useTheme } from "../lib/Usetheme";
import {
  changePassword,
  deleteAccount,
  getCurrentUser,
  isAuthError,
  tokenStore,
  type User,
} from "../services/api";

const THEMES: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "Match device" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { choice } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const signOut = useCallback(() => {
    tokenStore.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((err) => {
        if (isAuthError(err)) signOut();
      });
  }, [signOut]);

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setDeleting(true);
    try {
      await deleteAccount(password);
      tokenStore.clear();
      navigate("/register", { replace: true });
    } catch (err) {
      if (isAuthError(err)) signOut();
      else setError(err instanceof Error ? err.message : "Server error");
      setDeleting(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmNewPassword) {
      setPasswordError("The new passwords don't match.");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordSuccess("Your password has been changed.");
    } catch (err) {
      if (isAuthError(err)) signOut();
      else setPasswordError(err instanceof Error ? err.message : "Server error");
    } finally {
      setChangingPassword(false);
    }
  }

  function cancelDelete() {
    setConfirming(false);
    setPassword("");
    setError("");
  }

  return (
    <div className="dash">
      <div className="band on-blue">
        <div className="wrap">
          <AppHeader email={user?.email} current="settings" onSignOut={signOut} />
          <h1 className="page-title">Settings</h1>
        </div>
      </div>

      <main className="settings wrap">
        <section className="setting">
          <div>
            <h2>Account</h2>
          </div>
          <div>
            <p className="muted">Email</p>
            <p className="value">{user?.email ?? " "}</p>
          </div>
        </section>

        <section className="setting">
          <div>
            <h2>Appearance</h2>
            <p className="setting-desc">Choose how the app looks on this device.</p>
          </div>
          <fieldset className="segmented">
            <legend className="sr-only">Theme</legend>
            {THEMES.map((t) => (
              <label key={t.value}>
                <input
                  type="radio"
                  name="theme"
                  value={t.value}
                  checked={choice === t.value}
                  onChange={() => setChoice(t.value)}
                />
                <span>{t.label}</span>
              </label>
            ))}
          </fieldset>
        </section>

        <section className="setting">
          <div>
            <h2>Change password</h2>
            <p className="setting-desc">
              Choose a new password with at least 8 characters.
            </p>
          </div>
          <form onSubmit={handleChangePassword}>
            <Field
              id="current-password"
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Field
              id="new-password"
              label="New password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Field
              id="confirm-new-password"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
            <p className="form-error" role="alert">
              {passwordError}
            </p>
            <p role="status">{passwordSuccess}</p>
            <button className="btn btn-primary" disabled={changingPassword}>
              {changingPassword ? "Changing password…" : "Change password"}
            </button>
          </form>
        </section>

        <section className="setting setting-danger">
          <div>
            <h2>Delete account</h2>
            <p className="setting-desc">
              This permanently deletes your account, every short link you made
              and all of their click history. Those short links will stop
              working. You can't undo this.
            </p>
          </div>

          <div>
            {confirming ? (
              <form onSubmit={handleDelete}>
                <Field
                  id="delete-password"
                  label="Enter your password to confirm"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <p className="form-error" role="alert">
                  {error}
                </p>
                <div className="actions">
                  <button className="btn btn-danger" disabled={deleting || !password}>
                    {deleting ? "Deleting…" : "Delete my account"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-quiet"
                    onClick={cancelDelete}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button className="btn btn-danger" onClick={() => setConfirming(true)}>
                Delete account
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}