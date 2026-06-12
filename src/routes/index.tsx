import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARQTYPE // SYSTEM ACTIVE" },
      { name: "description", content: "Arqtype — currently building. Live infrastructure in progress." },
      { property: "og:title", content: "ARQTYPE // SYSTEM ACTIVE" },
      { property: "og:description", content: "Currently building Arqtype." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap",
      },
    ],
  }),
  component: Index,
});

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

function Index() {
  const uptime = useUptime();
  const progress = 38;
  const filled = Math.round((progress / 100) * 14);
  const bar = "■".repeat(filled) + "□".repeat(14 - filled);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-scanlines" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 65%)",
        }}
      />

      {/* Outer corner brackets */}
      <span className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l border-t border-accent/60" />
      <span className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r border-t border-accent/60" />
      <span className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b border-l border-accent/60" />
      <span className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b border-r border-accent/60" />

      {/* Mid-edge plus markers */}
      <span className="pointer-events-none absolute left-[7%] top-[22%] font-mono text-xs text-muted-foreground/60">+</span>
      <span className="pointer-events-none absolute right-[5%] top-[36%] font-mono text-xs text-muted-foreground/60">+</span>

      {/* TOP-LEFT path label */}
      <div className="absolute left-6 top-5 font-mono text-[12px] text-muted-foreground">
        /arqtype.io <span className="cursor-blink text-foreground">_</span>
      </div>

      {/* TOP-RIGHT spec block */}
      <div className="absolute right-6 top-5 font-mono text-[11px] leading-[1.55] text-muted-foreground">
        <KV k="UPTIME" v={uptime} />
        <KV k="MODE" v="BUILD" />
        <KV k="ENV" v="PRODUCTION" />
        <KV k="REGION" v="GLOBAL" />
      </div>

      {/* LEFT line numbers */}
      <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 font-mono text-[11px] leading-[1.7] text-muted-foreground/70 sm:block">
        {Array.from({ length: 20 }).map((_, i) => {
          const n = String(i + 1).padStart(2, "0");
          const active = i === 5;
          return (
            <div key={i} className={active ? "text-accent" : ""}>
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

      {/* BOTTOM-RIGHT comment block */}
      <div className="absolute bottom-7 right-6 text-right font-mono text-[12px] leading-[1.7] text-muted-foreground">
        <div>// building the</div>
        <div>// infrastructure</div>
        <div>// that moves markets</div>
        <div className="mt-2 text-accent">
          {"{ "}<span className="flicker">initializing...</span>{" }"}
        </div>
      </div>

      {/* CENTER */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Hero with side brackets */}
        <div className="relative flex items-center">
          <span className="font-mono text-[3.5rem] font-thin leading-none text-accent/80 sm:text-[5rem] md:text-[7rem]">
            [
          </span>
          <h1
            className="px-6 font-display text-[14vw] font-medium uppercase leading-none text-foreground text-glow sm:text-[11vw] md:text-[9vw] lg:text-[7.5vw]"
            style={{ letterSpacing: "0.08em" }}
          >
            ARQTYPE
          </h1>
          <span className="font-mono text-[3.5rem] font-thin leading-none text-accent/80 sm:text-[5rem] md:text-[7rem]">
            ]
          </span>
          {/* small underscore tick */}
          <span className="absolute left-1/2 -bottom-6 -translate-x-1/2 font-mono text-accent">_</span>
        </div>

        {/* Tagline */}
        <p className="mt-10 font-mono text-base text-foreground/90 sm:text-xl md:text-2xl">
          Currently building Arqtype<span className="text-accent">.</span>
        </p>

        {/* Status output — no container */}
        <div className="mt-12 w-full max-w-md font-mono text-[12px] leading-[1.9] text-muted-foreground">
          <div className="mb-2">
            <span className="text-muted-foreground">root@arqtype</span>
            <span>:~$ </span>
            <span className="text-accent">status</span>
          </div>
          <StatusLine n="01" label="SYSTEM" />
          <div className="grid grid-cols-[2.5rem_1fr]">
            <span className="text-muted-foreground/70">02</span>
            <span className="text-foreground">SYSTEM ACTIVE</span>
          </div>
          <div className="grid grid-cols-[2.5rem_1fr]">
            <span className="text-muted-foreground/70">03</span>
            <span> </span>
          </div>
          <StatusLine n="04" label="BUILD" />
          <div className="grid grid-cols-[2.5rem_1fr]">
            <span className="text-muted-foreground/70">05</span>
            <span className="text-foreground">IN PROGRESS</span>
          </div>
          <div className="grid grid-cols-[2.5rem_1fr]">
            <span className="text-muted-foreground/70">06</span>
            <span> </span>
          </div>
          <StatusLine n="07" label="PROGRESS" />
          <div className="grid grid-cols-[2.5rem_1fr] items-center">
            <span className="text-muted-foreground/70">08</span>
            <span>
              <span className="text-accent tracking-[0.15em]">{bar}</span>
              <span className="ml-3 text-foreground">{progress}%</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="cursor-blink text-foreground">_</span>
          </div>
        </div>
      </div>
    </main>
  );
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
