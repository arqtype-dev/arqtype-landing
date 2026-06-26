import { useCallback, useEffect, useRef, useState } from "react";
import { EarlyAccessModal } from "./components/EarlyAccessModal";

const NAV_ITEMS = [
  "Product",
  "Infrastructure",
  "Operations",
  "Chains",
  "Docs",
  "Changelog",
];

const CHAINS = [
  { glyph: "≡", name: "Solana" },
  { glyph: "◆", name: "Ethereum" },
  { glyph: "⊖", name: "Base" },
  { glyph: "◊", name: "SUI" },
  { glyph: "▽", name: "TON" },
  { glyph: "❖", name: "BNB" },
  { glyph: "⊘", name: "Arbitrum" },
  { glyph: "Ⱨ", name: "HYPE" },
];

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  // Ensures the exit-intent modal only fires once per page session.
  const exitIntentFired = useRef(false);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  // Exit-intent: open the modal when the cursor leaves the viewport
  // through the top edge (typical "leaving the page" gesture).
  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      if (exitIntentFired.current) return;
      if (e.relatedTarget !== null) return;
      if (e.clientY > 0) return;
      exitIntentFired.current = true;
      setModalOpen(true);
    };
    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 60%)",
        }}
      />

      {/* ── HEADER ── */}
      <header className="relative z-10 mx-auto mt-4 flex max-w-[1400px] items-center gap-6 rounded-md border border-border bg-surface/40 px-5 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-9 items-center justify-center rounded-[4px] border border-accent/70 font-display text-sm font-bold text-accent">
            A
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            Arqtype
          </span>
          <span className="ml-3 hidden h-4 w-px bg-border md:block" />
          <span className="ml-1 hidden font-mono text-[11px] tracking-[0.2em] text-muted-foreground md:inline">
            EXECUTION LAYER · V2.4
          </span>
        </div>

        {/* Nav */}
        <nav className="ml-auto hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item} href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Sign in
          </a>
          <button
            type="button"
            className="flex items-center gap-2 rounded-[6px] bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Private Beta v0.45
            <span aria-hidden>→</span>
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 mx-auto flex max-w-[1100px] flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28">
        {/* Status chip */}
        <div className="mb-12 flex items-center gap-2 rounded-[6px] border border-border bg-surface/40 px-4 py-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
          <span>[</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.17_150)]" />
          <span className="text-foreground/80">V2.4 · MULTI-CHAIN EXECUTION ENGINE ·</span>
          <span className="text-[oklch(0.72_0.17_150)]">LIVE</span>
          <span className="text-border">|</span>
          <a href="#" className="text-foreground/80 transition-colors hover:text-foreground">
            CHANGELOG →
          </a>
          <span>]</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-[2.75rem] font-medium leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          <span className="text-accent/65">Launch, automate</span>
          <br />
          <span className="text-accent/65">and scale</span>
          <br />
          <span className="text-accent">token operations.</span>
        </h1>

        {/* Subcopy */}
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Arqtype is the institutional execution layer for Web3 teams — token
          deployment, liquidity infrastructure, campaign automation and
          multi-chain market operations, built as a single operating system.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={openModal}
            className="flex items-center gap-2 rounded-[6px] bg-accent px-6 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            Get Early Access
            <span aria-hidden>→</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-[6px] border border-border bg-surface/50 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/50"
          >
            <span className="font-mono text-accent">$</span>
            View documentation
          </button>
        </div>
      </section>

      {/* ── OPERATING ON ── */}
      <section className="relative z-10 mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 pb-20">
        <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
          OPERATING ON
        </span>
        {CHAINS.map((chain) => (
          <span
            key={chain.name}
            className="flex items-center gap-2 text-sm text-foreground/80"
          >
            <span className="font-mono text-muted-foreground">{chain.glyph}</span>
            {chain.name}
          </span>
        ))}
      </section>

      <EarlyAccessModal open={modalOpen} onClose={closeModal} />
    </main>
  );
}
