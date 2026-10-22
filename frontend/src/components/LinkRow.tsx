import { useEffect, useState } from "react";
import {
  getUrlClicks,
  isAuthError,
  shortLinkHref,
  shortLinkLabel,
  type ClickItem,
  type UrlItem,
} from "../services/api";
import {
  copyText,
  describeAgent,
  describeReferrer,
  fullDate,
  timeAgo,
} from "../lib/Format";

interface LinkRowProps {
  item: UrlItem;
  onDelete: (id: number) => Promise<void>;
  onAuthError: () => void;
}

export default function LinkRow({ item, onDelete, onAuthError }: LinkRowProps) {
  const [open, setOpen] = useState(false);
  const [clicks, setClicks] = useState<ClickItem[] | null>(null);
  const [clicksError, setClicksError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setClicksError("");
    getUrlClicks(item.id)
      .then((data) => {
        if (!cancelled) setClicks(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (isAuthError(err)) onAuthError();
        else
          setClicksError(
            err instanceof Error ? err.message : "Couldn't load the clicks."
          );
      });
    return () => {
      cancelled = true;
    };
  }, [open, item.id, onAuthError]);

  async function handleCopy() {
    if (await copyText(shortLinkHref(item.short_code))) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await onDelete(item.id);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Couldn't delete this link."
      );
      setDeleting(false);
    }
  }

  const panelId = `details-${item.id}`;

  return (
    <li className="item">
      <div className="row">
        <div className="cell-code">
          <a
            className="code-link"
            href={shortLinkHref(item.short_code)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {shortLinkLabel(item.short_code)}
          </a>
          <button className="btn btn-quiet btn-small" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="cell-dest" title={item.original_url}>
          {item.original_url}
        </p>

        <p className="cell-clicks">
          {item.click_count}
          <span className="clicks-label">
            {item.click_count === 1 ? " click" : " clicks"}
          </span>
        </p>

        <p className="cell-created">{timeAgo(item.created_at)}</p>

        <button
          className="toggle"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Hide details" : "Show details"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M3 6l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="panel" id={panelId}>
          <p className="panel-dest">
            Goes to <span>{item.original_url}</span>
          </p>

          <h3>Recent clicks</h3>

          {clicksError ? (
            <p className="form-error">{clicksError}</p>
          ) : clicks === null ? (
            <p className="muted">Loading clicks…</p>
          ) : clicks.length === 0 ? (
            <p className="muted">
              No clicks yet. Open the short link or share it, and each visit
              will show up here.
            </p>
          ) : (
            <div className="table-scroll">
              <table className="clicks">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Came from</th>
                    <th>Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {clicks.map((click) => (
                    <tr key={click.id}>
                      <td>{fullDate(click.timestamp)}</td>
                      <td>{describeReferrer(click.referrer)}</td>
                      <td>{describeAgent(click.user_agent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="panel-actions">
            {confirming ? (
              <>
                <span className="confirm-text">
                  Delete this link? The short link stops working and its click
                  history is removed.
                </span>
                <button
                  className="btn btn-danger btn-small"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete link"}
                </button>
                <button
                  className="btn btn-quiet btn-small"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                >
                  Keep it
                </button>
              </>
            ) : (
              <button
                className="btn btn-quiet btn-small"
                onClick={() => setConfirming(true)}
              >
                Delete link
              </button>
            )}
          </div>
          {deleteError && <p className="form-error">{deleteError}</p>}
        </div>
      )}
    </li>
  );
}