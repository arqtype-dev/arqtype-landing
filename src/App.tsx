import { useCallback, useEffect, useRef, useState } from "react";
import { EarlyAccessModal } from "./components/EarlyAccessModal";

/** Live-ticking uptime counter (HH:MM:SS), seeded to a non-zero value. */
function useUptime() {
  const [t, setT] = useState(42);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `00:${h}:${m}:${s}`;
}

/** Live-loading progress value that climbs and loops, for motion only. */
function useProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setP((x) => (x >= 100 ? 0 : x + 1));
    }, 90);
    return () => clearInterval(id);
  }, []);
  return p;
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-end gap-3">
      <span className="text-muted-foreground">
        [ <span className="text-foreground/80">{k.padEnd(6, " ")}</span> ]
      </span>
      <span className="text-accent w-[7.5rem] text-left">{v}</span>
    </div>
  );
}

function StatusLine({ n, label }: { n: string; label: string }) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr]">
      <span className="text-muted-foreground/70">{n}</span>
      <span className="text-accent">[ {label} ]</span>
    </div>
  );
}

// Line numbers shown on the left rail — matches the reference, which
// skips 11 and 16.
const LINE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20];

export default function App() {
  const uptime = useUptime();
  const progress = useProgress();
  const filled = Math.round((progress / 100) * 14);
  const bar = "■".repeat(filled) + "□".repeat(14 - filled);

  const [modalOpen, setModalOpen] = useState(false);
  const exitIntentFired = useRef(false);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  // Exit-intent: open the modal when the cursor leaves through the top edge.
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
    <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-scanlines" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, color-mix(in oklab, var(--accent) 9%, transparent), transparent 65%)",
        }}
      />

      {/* Background waveform */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,470 C120,430 180,360 300,380 C420,400 460,520 600,500 C740,480 760,300 900,250 C1040,200 1100,360 1240,300 C1340,255 1400,210 1440,180"
          stroke="color-mix(in oklab, var(--accent) 35%, transparent)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Outer corner brackets */}
      <span className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l border-t border-accent/60" />
      <span className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r border-t border-accent/60" />
      <span className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b border-l border-accent/60" />
      <span className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b border-r border-accent/60" />

      {/* TOP-LEFT path label */}
      <div className="absolute left-6 top-5 font-mono text-[12px] text-muted-foreground">
        /arqtype.io <span className="cursor-blink text-foreground">_</span>
      </div>

      {/* TOP-RIGHT spec block */}
      <div className="absolute right-6 top-5 font-mono text-[11px] leading-[1.55] text-muted-foreground">
        <KV k="UPTIME" v={uptime} />
        <KV k="NODE" v="BUILD" />
        <KV k="ENV" v="PRODUCTION" />
        <KV k="REGION" v="GLOBAL" />
      </div>

      {/* LEFT line numbers */}
      <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 font-mono text-[11px] leading-[1.7] text-muted-foreground/70 sm:block">
        {LINE_NUMBERS.map((num) => {
          const n = String(num).padStart(2, "0");
          const active = num === 6;
          return (
            <div key={num} className={active ? "text-accent" : ""}>
              {active ? <span className="mr-1">&gt;</span> : <span className="mr-1 opacity-0">&gt;</span>}
              {n}
            </div>
          );
        })}
      </div>

      {/* BOTTOM-LEFT tree */}
      <div className="absolute bottom-7 left-6 font-mono text-[12px] leading-[1.7] text-muted-foreground">
        <div className="text-foreground/90">/arqtype</div>
        <div>├── operators</div>
        <div>├── infrastructure</div>
        <div>├── systems</div>
        <div>└── <span className="text-accent">[ classified ]</span></div>
      </div>

      {/* BOTTOM-RIGHT status block */}
      <div className="absolute bottom-7 right-6 font-mono text-[12px] leading-[1.85] text-muted-foreground">
        <div className="mb-1">
          <span className="text-muted-foreground">root@arqtype</span>
          <span>:~# </span>
          <span className="text-muted-foreground/70">status</span>
        </div>
        <StatusLine n="01" label="SYSTEM" />
        <div className="grid grid-cols-[2.5rem_1fr]">
          <span className="text-muted-foreground/70">02</span>
          <span className="text-foreground">SYSTEM ACTIVE</span>
        </div>
        <div className="grid grid-cols-[2.5rem_1fr]">
          <span className="text-muted-foreground/70">03</span>
          <span>-</span>
        </div>
        <StatusLine n="04" label="BUILD" />
        <div className="grid grid-cols-[2.5rem_1fr]">
          <span className="text-muted-foreground/70">05</span>
          <span className="text-foreground">IN PROGRESS</span>
        </div>
        <div className="grid grid-cols-[2.5rem_1fr]">
          <span className="text-muted-foreground/70">06</span>
          <span>-</span>
        </div>
        <StatusLine n="07" label="PROGRESS" />
        <div className="grid grid-cols-[2.5rem_1fr] items-center">
          <span className="text-muted-foreground/70">08</span>
          <span>
            <span className="text-accent tracking-[0.15em]">{bar}</span>
            <span className="ml-3 text-foreground">{progress}%</span>
          </span>
        </div>
        <div className="mt-1">
          <span className="cursor-blink text-foreground">_</span>
        </div>
      </div>

      {/* CENTER */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Hero with side brackets */}
        <div className="relative flex items-center">
          <span className="font-mono text-[3.5rem] font-thin leading-none text-accent text-glow sm:text-[5rem] md:text-[7rem]">
            [
          </span>
          <h1
            className="px-6 font-display text-[14vw] font-medium leading-none sm:text-[11vw] md:text-[9vw] lg:text-[7.5vw]"
            style={{ letterSpacing: "0.01em" }}
          >
            <span className="text-foreground">Arq</span>
            <span className="text-accent text-glow">type</span>
          </h1>
          <span className="font-mono text-[3.5rem] font-thin leading-none text-accent text-glow sm:text-[5rem] md:text-[7rem]">
            ]
          </span>
          <span className="absolute left-1/2 -bottom-6 -translate-x-1/2 font-mono text-accent">_</span>
        </div>

        {/* Tagline */}
        <p className="mt-12 text-base text-foreground/90 sm:text-xl md:text-3xl">
          The infrastructure that moves markets
        </p>

        {/* CTA button */}
        <button
          type="button"
          onClick={openModal}
          className="accent-glow mt-12 rounded-[4px] border border-accent bg-transparent px-10 py-4 font-mono text-sm tracking-[0.2em] text-accent transition-colors hover:bg-accent/10 sm:text-base"
        >
          GET EARLY ACCESS
        </button>
      </div>

      <EarlyAccessModal open={modalOpen} onClose={closeModal} />
    </main>
  );
}
