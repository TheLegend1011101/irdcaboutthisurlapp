import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/Appheader";
import LinkRow from "../components/LinkRow";
import {
  createShortUrl,
  deleteUrl,
  getCurrentUser,
  getUserUrls,
  isAuthError,
  shortLinkHref,
  shortLinkLabel,
  tokenStore,
  type UrlItem,
  type User,
} from "../services/api";
import { copyText, normalizeUrl } from "../lib/Format";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<UrlItem[] | null>(null);
  const [loadError, setLoadError] = useState("");

  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fresh, setFresh] = useState<UrlItem | null>(null);
  const [freshCopied, setFreshCopied] = useState(false);

  const signOut = useCallback(() => {
    tokenStore.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadLinks = useCallback(async () => {
    try {
      setLinks(await getUserUrls());
      setLoadError("");
    } catch (err) {
      if (isAuthError(err)) signOut();
      else
        setLoadError(
          err instanceof Error ? err.message : "Couldn't load your links."
        );
    }
  }, [signOut]);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((err) => {
        if (isAuthError(err)) signOut();
      });
    loadLinks();
  }, [loadLinks, signOut]);

  // Click counts change outside this tab, so refresh when the tab regains focus.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") loadLinks();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadLinks]);

  async function handleShorten(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFresh(null);

    const normalized = normalizeUrl(input);
    if (!normalized) {
      setFormError(
        "That doesn't look like a link. Paste a full address, for example https://example.com/page."
      );
      return;
    }

    setSubmitting(true);
    try {
      const created = await createShortUrl(normalized);
      setLinks((prev) => [created, ...(prev ?? [])]);
      setFresh(created);
      setFreshCopied(false);
      setInput("");
    } catch (err) {
      if (isAuthError(err)) signOut();
      else
        setFormError(
          err instanceof Error ? err.message : "Couldn't shorten that link."
        );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyFresh() {
    if (!fresh) return;
    if (await copyText(shortLinkHref(fresh.short_code))) {
      setFreshCopied(true);
      window.setTimeout(() => setFreshCopied(false), 1800);
    }
  }

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteUrl(id);
      } catch (err) {
        if (isAuthError(err)) signOut();
        throw err;
      }
      setLinks((prev) => (prev ?? []).filter((l) => l.id !== id));
      setFresh((prev) => (prev?.id === id ? null : prev));
    },
    [signOut]
  );

  const totalClicks = (links ?? []).reduce((sum, l) => sum + l.click_count, 0);

  return (
    <div className="dash">
      <div className="band on-blue">
        <div className="wrap">
          <AppHeader email={user?.email} current="links" onSignOut={signOut} />

          <section className="hero">
            <h1>Paste a long link. Get a short one.</h1>

            <form className="shorten" onSubmit={handleShorten}>
              <label htmlFor="long-url" className="sr-only">
                Link to shorten
              </label>
              <input
                id="long-url"
                type="text"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="https://example.com/a/very/long/address"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="btn btn-signal" disabled={submitting}>
                {submitting ? "Shortening…" : "Shorten link"}
              </button>
            </form>

            <div aria-live="polite">
              {formError && <p className="hero-error">{formError}</p>}

              {fresh && (
                <div className="result">
                  <div>
                    <p className="result-label">Your short link is ready</p>
                    <a
                      className="result-link"
                      href={shortLinkHref(fresh.short_code)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortLinkLabel(fresh.short_code)}
                    </a>
                  </div>
                  <button className="btn btn-ink" onClick={handleCopyFresh}>
                    {freshCopied ? "Copied" : "Copy link"}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <main className="board wrap">
        <div className="board-head">
          <h2>Your links</h2>
          {links && links.length > 0 && (
            <p className="muted">
              {links.length} {links.length === 1 ? "link" : "links"} ·{" "}
              {totalClicks} {totalClicks === 1 ? "click" : "clicks"}
            </p>
          )}
        </div>

        {loadError ? (
          <div className="empty">
            <p className="form-error">{loadError}</p>
            <button className="btn btn-quiet btn-small" onClick={loadLinks}>
              Try again
            </button>
          </div>
        ) : links === null ? (
          <p className="muted empty">Loading your links…</p>
        ) : links.length === 0 ? (
          <div className="empty">
            <p className="empty-title">No links yet</p>
            <p className="muted">
              Paste a long link above and your first short link appears here,
              with a running count of its clicks.
            </p>
          </div>
        ) : (
          <>
            <div className="cols" aria-hidden="true">
              <span>Short link</span>
              <span>Destination</span>
              <span className="right">Clicks</span>
              <span>Created</span>
              <span />
            </div>
            <ul className="list">
              {links.map((item) => (
                <LinkRow
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onAuthError={signOut}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}