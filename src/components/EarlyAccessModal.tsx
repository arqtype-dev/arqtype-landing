import { useEffect, useState } from "react";

interface EarlyAccessModalProps {
  open: boolean;
  onClose: () => void;
}

// The Cloudflare Worker endpoint that proxies to Klaviyo.
// Override at build time with VITE_KLAVIYO_ENDPOINT if your worker
// is hosted on a different route.
const ENDPOINT =
  import.meta.env.VITE_KLAVIYO_ENDPOINT ?? "/api/subscribe";

type Status = "idle" | "submitting" | "success" | "error";

export function EarlyAccessModal({ open, onClose }: EarlyAccessModalProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset transient state whenever the modal is reopened.
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    setError("");

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!trimmedUsername) {
      setError("Enter a username.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, username: trimmedUsername }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Get early access"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-md border border-border bg-surface p-6 shadow-xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          ✕
        </button>

        {status === "success" ? (
          <div className="py-6 text-center">
            <div className="mb-3 font-mono text-[11px] tracking-[0.2em] text-accent">
              [ REGISTERED ]
            </div>
            <h2 className="font-display text-xl font-medium">You're on the list</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll be in touch about early access to Arqtype.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-[6px] border border-border px-5 py-2 text-sm transition-colors hover:border-accent/50"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-1 font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
              [ EARLY ACCESS ]
            </div>
            <h2 className="font-display text-2xl font-medium">Get Early Access</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Request access to the Arqtype private beta.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@team.xyz"
                  autoComplete="email"
                  className="w-full rounded-[6px] border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
                  USERNAME
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="operator handle"
                  autoComplete="username"
                  className="w-full rounded-[6px] border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent"
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 font-mono text-[12px] text-[oklch(0.65_0.2_25)]">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === "submitting"}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[6px] bg-accent px-6 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "submitting" ? "Submitting…" : "Get Early Access"}
              {status !== "submitting" && <span aria-hidden>→</span>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
