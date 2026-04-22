"use client";

import { useEffect, useRef, useState } from "react";

type Diff = { days: number; hours: number; minutes: number };

const PAMALAYE_DATE = new Date("2026-06-08T16:00:00-07:00");

function diffToTarget(target: Date): Diff {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
  };
}

function NipaHut({ mirror = false }: { mirror?: boolean }) {
  return (
    <svg
      className={`nipa-hut ${mirror ? "is-mirror" : ""}`}
      viewBox="0 0 160 150"
      aria-hidden="true"
      role="presentation"
    >
      {/* thatched roof */}
      <g className="nipa-roof">
        <path d="M 20 80 L 80 18 L 140 80 Z" />
        <path className="nipa-roof-line" d="M 36 80 L 80 34 L 124 80" />
        <path className="nipa-roof-line" d="M 52 80 L 80 50 L 108 80" />
        <path className="nipa-roof-line" d="M 68 80 L 80 66 L 92 80" />
      </g>
      {/* bamboo stilts */}
      <g className="nipa-stilts">
        <line x1="40" y1="82" x2="40" y2="132" />
        <line x1="120" y1="82" x2="120" y2="132" />
        <line x1="80" y1="82" x2="80" y2="132" />
      </g>
      {/* body */}
      <g className="nipa-body">
        <rect x="34" y="80" width="92" height="42" />
        <line x1="34" y1="90" x2="126" y2="90" />
        <line x1="34" y1="112" x2="126" y2="112" />
        <rect className="nipa-window" x="48" y="94" width="18" height="14" />
        <rect className="nipa-window" x="94" y="94" width="18" height="14" />
      </g>
      {/* steps */}
      <g className="nipa-steps">
        <line x1="68" y1="132" x2="92" y2="132" />
        <line x1="72" y1="138" x2="88" y2="138" />
        <line x1="76" y1="144" x2="84" y2="144" />
      </g>
    </svg>
  );
}

function SampaguitaGarland() {
  return (
    <svg
      className="sampaguita-garland"
      viewBox="0 0 600 80"
      aria-hidden="true"
      role="presentation"
    >
      {/* cord — animated draw */}
      <path
        className="garland-cord"
        d="M 8 40 Q 150 8 300 34 T 592 40"
        fill="none"
      />
      {/* flowers + leaves along the cord */}
      {[
        { x: 60, y: 28, r: 0 },
        { x: 120, y: 20, r: 18 },
        { x: 180, y: 18, r: -8 },
        { x: 240, y: 24, r: 10 },
        { x: 300, y: 32, r: 0 },
        { x: 360, y: 28, r: -12 },
        { x: 420, y: 22, r: 14 },
        { x: 480, y: 22, r: -6 },
        { x: 540, y: 30, r: 8 },
      ].map((f, i) => (
        <g
          key={i}
          className="garland-flower"
          style={{ "--i": i } as React.CSSProperties}
          transform={`translate(${f.x} ${f.y}) rotate(${f.r})`}
        >
          {/* 5-petal sampaguita */}
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-4"
              rx="3.2"
              ry="5"
              transform={`rotate(${deg})`}
              className="garland-petal"
            />
          ))}
          <circle r="1.5" className="garland-eye" />
        </g>
      ))}
      {/* small leaves */}
      {[90, 210, 330, 450].map((x, i) => (
        <g
          key={x}
          className="garland-leaf"
          style={{ "--i": i } as React.CSSProperties}
        >
          <ellipse
            cx={x}
            cy={30 + (i % 2 === 0 ? 6 : -2)}
            rx="7"
            ry="2.4"
            transform={`rotate(${i % 2 === 0 ? -18 : 14} ${x} ${30})`}
          />
        </g>
      ))}
    </svg>
  );
}

function BananaLeafCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`banana-leaf-corner ${className}`}
      viewBox="0 0 180 180"
      aria-hidden="true"
      role="presentation"
    >
      <g fill="none" strokeLinecap="round">
        <path className="banana-spine" d="M 10 170 Q 60 120 130 40" />
        {Array.from({ length: 12 }).map((_, i) => {
          const t = i / 11;
          const f = (n: number) => n.toFixed(3);
          const x1 = f(10 + (130 - 10) * t);
          const y1 = f(170 - (170 - 40) * t);
          const nx = Math.cos(t * 1.4) * 26;
          const ny = Math.sin(t * 1.4) * 20;
          return (
            <path
              key={i}
              className="banana-rib"
              d={`M ${x1} ${y1} q ${f(nx * 0.3)} ${f(-ny * 0.3)} ${f(nx * 0.8)} ${f(-ny * 0.8)}`}
            />
          );
        })}
      </g>
    </svg>
  );
}

function PamalayeCountdown({ target }: { target: Date }) {
  const [diff, setDiff] = useState<Diff | null>(null);

  useEffect(() => {
    setDiff(diffToTarget(target));
    const id = setInterval(() => setDiff(diffToTarget(target)), 30_000);
    return () => clearInterval(id);
  }, [target]);

  if (!diff) return null;

  const done = diff.days === 0 && diff.hours === 0 && diff.minutes === 0;

  return (
    <div className="pamalaye-countdown" aria-live="polite">
      <span className="pamalaye-countdown-label">
        {done ? "The houses meet today" : "Until the houses meet"}
      </span>
      {!done && (
        <div className="pamalaye-countdown-units">
          <span>
            <b>{diff.days}</b>
            <em>days</em>
          </span>
          <span className="pamalaye-countdown-sep" aria-hidden="true">·</span>
          <span>
            <b>{String(diff.hours).padStart(2, "0")}</b>
            <em>hours</em>
          </span>
          <span className="pamalaye-countdown-sep" aria-hidden="true">·</span>
          <span>
            <b>{String(diff.minutes).padStart(2, "0")}</b>
            <em>min</em>
          </span>
        </div>
      )}
    </div>
  );
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Revealable({
  as: Tag = "section",
  className = "",
  children,
  ...rest
}: {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} className={`pamalaye-reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

type Petal = {
  key: number;
  left: number;
  delay: number;
  duration: number;
  scale: number;
};

export default function Pamalaye() {
  // petals must be generated client-only — Math.random() would hydration-mismatch
  const [drift, setDrift] = useState<Petal[]>([]);
  useEffect(() => {
    setDrift(
      Array.from({ length: 10 }).map((_, i) => ({
        key: i,
        left: Math.random() * 100,
        delay: -Math.random() * 24,
        duration: 22 + Math.random() * 18,
        scale: 0.5 + Math.random() * 0.7,
      })),
    );
  }, []);

  return (
    <div className="pamalaye-page">
      <div className="pamalaye-grain" aria-hidden="true" />
      <div className="pamalaye-weave" aria-hidden="true" />

      {/* drifting sampaguita petals */}
      <div className="pamalaye-petals" aria-hidden="true">
        {drift.map((p) => (
          <span
            key={p.key}
            className="pamalaye-petal"
            style={
              {
                "--left": `${p.left}%`,
                "--delay": `${p.delay}s`,
                "--duration": `${p.duration}s`,
                "--scale": p.scale,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <BananaLeafCorner className="corner-tl" />
      <BananaLeafCorner className="corner-br" />

      {/* ─── HERO ─── */}
      <section className="pamalaye-hero">
        <p className="pamalaye-eyebrow">
          <span>Mga Pamilya Labe &amp; Jusain</span>
        </p>

        <div className="pamalaye-houses">
          <NipaHut />
          <div className="pamalaye-title-block">
            <p className="pamalaye-kicker">a quiet first chapter</p>
            <h1 className="pamalaye-title">
              <span className="pamalaye-title-ch">P</span>amalaye
            </h1>
            <div className="pamalaye-weave-band" aria-hidden="true">
              <span /><span /><span /><span /><span /><span /><span /><span /><span />
            </div>
            <p className="pamalaye-subtitle">
              <em>balay</em> to <em>balay</em> — the joining of two houses
            </p>
          </div>
          <NipaHut mirror />
        </div>

        <SampaguitaGarland />

        <p className="pamalaye-lead">
          Before any guest, before any toast, two families gather. An old Visayan tradition
          carries us, house to house, asking for the blessing that turns love into kin.
        </p>

        <PamalayeCountdown target={PAMALAYE_DATE} />
      </section>

      {/* ─── ETYMOLOGY ─── */}
      <Revealable className="pamalaye-etymology">
        <article>
          <p className="pamalaye-section-label">a word, a walking</p>
          <h2 className="pamalaye-h2">
            <span className="pamalaye-dropcap">B</span>alay<span className="pamalaye-ampersand">.</span>
          </h2>
          <p className="pamalaye-etymology-def">
            <span className="pamalaye-part-of-speech">(n.) Visayan</span> — house;
            a home. The root of <em>pamalaye</em>: the going, house to house,
            carrying one&rsquo;s hopes in both hands.
          </p>
          <p className="pamalaye-etymology-body">
            Traditionally, the family of the groom calls upon the family of the bride.
            Elders speak. Parents listen. A dowry is offered — not always gold, sometimes
            a promise: <em>to honour, to provide, to belong.</em>
          </p>
          <p className="pamalaye-etymology-body">
            It is an old rite, quiet and formal. We keep it because some promises are
            only real when they&rsquo;re spoken inside a living room, over coffee still
            too hot to drink.
          </p>
        </article>
      </Revealable>

      {/* ─── THE HOUSES ─── */}
      <Revealable className="pamalaye-houses-panel">
        <header>
          <p className="pamalaye-section-label">the houses</p>
          <h2 className="pamalaye-h2">
            Two families <em>at one table.</em>
          </h2>
        </header>

        <div className="pamalaye-house-grid">
          <article className="pamalaye-house-card">
            <p className="pamalaye-house-kicker">Balay ng Babae</p>
            <h3>Family Labe</h3>
            <p className="pamalaye-house-elders">
              Mr. &amp; Mrs. Labe
              {/* <br />
              Lola Pacita Reyes
              <br />
              Tito Eduardo Reyes */}
            </p>
            <p className="pamalaye-house-note">
              Ermita, Poblacion, Pamplona, Negros Oriental
            </p>
          </article>

          <div className="pamalaye-house-bridge" aria-hidden="true">
            <svg viewBox="0 0 120 40">
              <path d="M 6 30 Q 60 6 114 30" fill="none" />
              <circle cx="60" cy="12" r="2.2" />
            </svg>
            <span>balay &middot; balay</span>
          </div>

          <article className="pamalaye-house-card">
            <p className="pamalaye-house-kicker">Balay ng Lalaki</p>
            <h3>Family Jusain</h3>
            <p className="pamalaye-house-elders">
              Mr. &amp; Mrs. Jusain
              {/* <br />
              Lolo Benigno Dela Cruz
              <br />
              Tita Corazon Dela Cruz */}
            </p>
            {/* <p className="pamalaye-house-note">
              of Cebu City, Cebu
            </p> */}
          </article>
        </div>
      </Revealable>

      {/* ─── THE ASKING ─── */}
      <Revealable className="pamalaye-asking">
        <p className="pamalaye-section-label">the asking</p>
        <h2 className="pamalaye-h2">
          A Monday afternoon, <em>in June.</em>
        </h2>

        <div className="pamalaye-asking-details">
          <div className="pamalaye-asking-row">
            <span className="pamalaye-asking-key">When</span>
            <span className="pamalaye-asking-val">
              Monday · the eighth of June
              <br />
              Two thousand twenty-six · four o&rsquo;clock
            </span>
          </div>
          <div className="pamalaye-asking-row">
            <span className="pamalaye-asking-key">Where</span>
            <span className="pamalaye-asking-val">
              Ermita
              <br />
              Poblacion, Pamplona, Negros Oriental
            </span>
          </div>
          {/* <div className="pamalaye-asking-row">
            <span className="pamalaye-asking-key">Dress</span>
            <span className="pamalaye-asking-val">
              Barong tagalog, terno, or Sunday best
              <br />
              <em>ivory, cream, soft earth tones</em>
            </span>
          </div> */}
          <div className="pamalaye-asking-row">
            <span className="pamalaye-asking-key">Please bring</span>
            <span className="pamalaye-asking-val">
              Nothing but your voice and a blessing
              <br />
              <em>merienda will be served at five</em>
            </span>
          </div>
        </div>
      </Revealable>

      {/* ─── CLOSING ─── */}
      <Revealable className="pamalaye-closing">
        <div className="pamalaye-seal" aria-hidden="true">
          <svg viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" />
            <circle cx="80" cy="80" r="62" fill="none" />
            <text x="80" y="56" textAnchor="middle">BALAY</text>
            <text x="80" y="90" textAnchor="middle" className="pamalaye-seal-amp">&amp;</text>
            <text x="80" y="118" textAnchor="middle">BALAY</text>
            {/* laurel */}
            <path
              d="M 22 80 Q 30 40 80 30 Q 130 40 138 80"
              fill="none"
            />
          </svg>
        </div>
        <p className="pamalaye-closing-body">
          When the blessing is given, the full invitation will unfold here.
          Until then, a quiet waiting — with warm coffee, warmer kitchens,
          and a word for every elder who brought us this far.
        </p>
        <p className="pamalaye-closing-signoff">
          With reverence,
          <br />
          <span>Mary Grace Lado Labe &amp; Valiant Zerna Jusain</span>
        </p>
      </Revealable>

      <footer className="pamalaye-footer">
        <p>Mga Pamilya Labe &amp; Jusain</p>
        <p className="pamalaye-footer-small">
          June 8, 2026 &middot; Ermita, Poblacion, Pamplona, Negros Oriental
        </p>
      </footer>
    </div>
  );
}
