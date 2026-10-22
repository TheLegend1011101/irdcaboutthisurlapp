import { Link } from "react-router-dom";
import Logo from "./Logo";
import ThemeToggle from "./Themetoggle";

interface AppHeaderProps {
  email?: string;
  current: "links" | "settings";
  onSignOut: () => void;
}

export default function AppHeader({ email, current, onSignOut }: AppHeaderProps) {
  return (
    <header className="topbar">
      <Link to="/dashboard" className="logo-link" aria-label="irdcabturlshortening, your links">
        <Logo />
      </Link>

      <div className="topbar-right">
        <span className="topbar-email">{email}</span>
        <ThemeToggle />
        {current === "settings" ? (
          <Link className="btn btn-outline-light btn-small" to="/dashboard">
            Your links
          </Link>
        ) : (
          <Link className="btn btn-outline-light btn-small" to="/settings">
            Settings
          </Link>
        )}
        <button className="btn btn-outline-light btn-small" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}