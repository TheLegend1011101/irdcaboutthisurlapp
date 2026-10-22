import type { ReactNode } from "react";
import Logo from "./Logo";
import ThemeToggle from "./Themetoggle";
import { shortLinkLabel } from "../services/api";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="auth">
      <aside className="auth-side on-blue">
        <Logo />

        <div>
          <h2 className="auth-claim">Share the short one. See who clicked.</h2>

          <div className="demo" aria-hidden="true">
            <p className="demo-long">
              https://example.com/blog/2026/how-we-rebuilt-onboarding?utm_source=newsletter&amp;utm_campaign=autumn
            </p>
            <p className="demo-short">{shortLinkLabel("k3Fx9aQ")}</p>
          </div>
        </div>

        <p className="auth-note">
          Every short link counts its clicks and keeps the referrer and browser
          of each visit.
        </p>
      </aside>

      <main className="auth-main">
        <div className="auth-tools">
          <ThemeToggle />
        </div>
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}