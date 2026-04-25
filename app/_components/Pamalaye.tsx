"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Diff = { days: number; hours: number; minutes: number };
type Stage = "sealed" | "opening" | "playing" | "revealed";

const PAMALAYE_DATE = new Date("2026-06-08T16:00:00-07:00");
const MUSIC_SRC = "/theme.mp3";

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

function MemorialDove() {
  return (
    <svg
      className="memorial-dove-svg"
      viewBox="0 0 40 22"
      aria-hidden="true"
      role="presentation"
    >
      {/* raised wing (behind body) */}
      <path
        className="memorial-dove-wing"
        d="M 13 11 Q 16 2 28 1.5 Q 20 6 22 11.5 Z"
      />
      {/* body: tail → back → head → beak → belly */}
      <path
        className="memorial-dove-body"
        d="M 2.4 11.2 L 4.6 9.4 L 7.6 10.4 Q 14 9.2 22 9 Q 30 8.8 34 8 L 38.2 7.4 L 37.8 9.2 L 36.2 9.8 L 33.6 10.2 Q 29 11 22 12 Q 14 13.1 8 13.2 Q 4.6 13.1 2.4 11.2 Z"
      />
      {/* tail fan notch */}
      <path
        className="memorial-dove-tail"
        d="M 2.4 11.2 L 4.2 11.2 L 3.2 12.6 Z"
      />
      {/* eye */}
      <circle className="memorial-dove-eye" cx="35.2" cy="8.6" r="0.42" />
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

function PamalayeContent() {
  // petals must be generated client-only — Math.random() would hydration-mismatch
  const [drift, setDrift] = useState<Petal[]>([]);
  const [coupleExpanded, setCoupleExpanded] = useState(false);

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

  function openCouple() {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 640px)").matches) return;
    setCoupleExpanded(true);
  }

  useEffect(() => {
    if (!coupleExpanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCoupleExpanded(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [coupleExpanded]);

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

      {/* ─── ETYMOLOGY / OUR STORY ─── */}
      <Revealable className="pamalaye-etymology">
        <article className="pamalaye-letter">
          <span className="pamalaye-letter-spine" aria-hidden="true" />

          <p className="pamalaye-section-label">a word, a walking</p>

          <aside className="pamalaye-definition" aria-label="Balay — definition">
            <p className="pamalaye-definition-tag">
              <span>Visayan</span>
              <em aria-hidden="true">·</em>
              <span>n.</span>
              <em aria-hidden="true">·</em>
              <span className="pamalaye-definition-pron">
                /ba<span className="pamalaye-definition-pron-stress">láy</span>/
              </span>
            </p>

            <h3 className="pamalaye-definition-headword">
              <span className="pamalaye-definition-initial">B</span>alay
              <span className="pamalaye-definition-period">.</span>
            </h3>

            <div className="pamalaye-definition-rule" aria-hidden="true">
              <span className="pamalaye-definition-rule-line" />
              <svg
                width="60"
                height="18"
                viewBox="-30 -9 60 18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse
                  cx="-20"
                  cy="0"
                  rx="9"
                  ry="2"
                  transform="rotate(-14 -20 0)"
                  fill="#9a7a3e"
                  opacity="0.7"
                />
                <ellipse
                  cx="20"
                  cy="0"
                  rx="9"
                  ry="2"
                  transform="rotate(14 20 0)"
                  fill="#9a7a3e"
                  opacity="0.7"
                />
                {[0, 72, 144, 216, 288].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="0"
                    cy="-3.6"
                    rx="2.4"
                    ry="3.8"
                    transform={`rotate(${deg})`}
                    fill="#fbf1dc"
                    stroke="#9a7a3e"
                    strokeWidth="0.6"
                  />
                ))}
                <circle cx="0" cy="0" r="1.1" fill="#9a2438" />
              </svg>
              <span className="pamalaye-definition-rule-line" />
            </div>

            <p className="pamalaye-definition-gloss">
              <em>house; a home.</em> The root of{" "}
              <strong className="pamalaye-definition-root">pamalaye</strong> &mdash;
              the going, house to house, carrying one&rsquo;s hopes in both hands.
            </p>

            <p className="pamalaye-definition-body">
              Traditionally, the family of the groom calls upon the family of the
              bride. Elders speak. Parents listen. A dowry is offered &mdash; not
              always gold, sometimes a promise:{" "}
              <em>to honour, to provide, to belong.</em>
            </p>

            <p className="pamalaye-definition-body">
              It is an old rite, quiet and formal. We keep it because some promises
              are only real when they&rsquo;re spoken inside a living room, over
              coffee still too hot to drink.
            </p>
          </aside>

          <h2 className="pamalaye-h2">
            <span className="pamalaye-dropcap">A</span> place of strength,
            <br />
            <em>where paths quietly crossed.</em>
          </h2>

          <div className="pamalaye-asterism" aria-hidden="true">
            <span /><span /><span />
          </div>

          <ol className="pamalaye-stanzas" role="list">
            <li className="pamalaye-stanza" data-stanza="I">
              <p>We met at the gym back in 2022&mdash;</p>
              <p>no grand introductions,</p>
              <p>no proper beginnings.</p>
            </li>

            <li className="pamalaye-stanza" data-stanza="II">
              <p>Just two souls sharing the same space,</p>
              <p>unaware of what was slowly unfolding.</p>
            </li>

            <li className="pamalaye-stanza" data-stanza="III">
              <p>Somewhere between familiar glances</p>
              <p>and moments that felt like coincidence,</p>
              <p><em>our story found its way to begin.</em></p>
            </li>

            <li className="pamalaye-stanza" data-stanza="IV">
              <p>What followed were days we grew into&mdash;</p>
              <p>simple, gentle, and full of meaning.</p>
            </li>
          </ol>

          <ul className="pamalaye-gifts" aria-label="the days we grew into">
            {[
              <>coffee dates and discovering new caf&eacute;s</>,
              <>lifting each other up, in and out of the gym</>,
              <>little adventures outdoors, chasing fresh air and freedom</>,
              <>
                flowers, given every month&mdash;
                <em>a quiet reminder of love that never forgets</em>
              </>,
            ].map((text, i) => (
              <li
                key={i}
                className="pamalaye-gift"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="pamalaye-gift-bloom" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="-10 -10 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <ellipse
                        key={deg}
                        cx="0"
                        cy="-4"
                        rx="2.6"
                        ry="4.2"
                        transform={`rotate(${deg})`}
                        fill="#fbf1dc"
                        stroke="#9a2438"
                        strokeWidth="0.8"
                      />
                    ))}
                    <circle r="1.2" fill="#9a7a3e" />
                  </svg>
                </span>
                <span className="pamalaye-gift-text">{text}</span>
              </li>
            ))}
          </ul>

          <div className="pamalaye-asterism" aria-hidden="true">
            <span /><span /><span />
          </div>

          <p className="pamalaye-epigraph">
            Now, we gather with the people we hold dear
            <br />
            to begin <em>the next chapter</em> of our story together.
          </p>

          <p className="pamalaye-coda">
            <span className="pamalaye-coda-rule" aria-hidden="true" />
            Your presence, in any form,
            <br />
            <em>would mean the world.</em>
          </p>
        </article>
      </Revealable>

      {/* ─── THE HOUSES ─── */}
      <Revealable className="pamalaye-houses-panel">
        <header>
          <p className="pamalaye-section-label">the houses</p>

          <div className="pamalaye-couple-pin">
            <span className="pamalaye-couple-tape" aria-hidden="true" />
            <figure
              className="pamalaye-couple-portrait"
              aria-label="Grasya and Valian — click to enlarge"
              role="button"
              tabIndex={0}
              onClick={openCouple}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openCouple();
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/couple.jpeg"
                alt="Grasya and Valian"
                loading="lazy"
                draggable={false}
              />
            </figure>
          </div>

          {coupleExpanded &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="pamalaye-couple-lightbox"
                role="dialog"
                aria-modal="true"
                aria-label="Grasya and Valian"
                onClick={() => setCoupleExpanded(false)}
              >
                <button
                  type="button"
                  className="pamalaye-couple-lightbox-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoupleExpanded(false);
                  }}
                  aria-label="Close"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M6 6 L18 18 M18 6 L6 18"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="pamalaye-couple-lightbox-img"
                  src="/couple.jpeg"
                  alt="Grasya and Valian"
                />
              </div>,
              document.body,
            )}

          <h2 className="pamalaye-h2">
            Two families <em>at one table.</em>
          </h2>
        </header>

        <div className="pamalaye-house-grid">
          <article className="pamalaye-house-card">
            <p className="pamalaye-house-kicker">Balay ng Babae</p>
            <h3>Family Labe</h3>
            <p className="pamalaye-house-elders">
              Mr. Cipriano &amp; Mrs. Thelma Labe
              <br />
              Cipres Labe
              <br />
              Totchie Santana
              <br />
              Rhotchiel Labe
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
              Mr. Julito &amp; Mrs. Nancy Jusain
              <br />
              Luffy
            </p>
            <div
              className="pamalaye-house-memoriam"
              role="group"
              aria-label="In loving memory"
            >
              <span
                className="pamalaye-house-memoriam-mark"
                aria-hidden="true"
              >
                <svg viewBox="-20 -5 40 10">
                  <line
                    x1="-18"
                    y1="0"
                    x2="-4"
                    y2="0"
                    stroke="currentColor"
                    strokeWidth="0.4"
                  />
                  <line
                    x1="18"
                    y1="0"
                    x2="4"
                    y2="0"
                    stroke="currentColor"
                    strokeWidth="0.4"
                  />
                  <path
                    d="M -2.6 0 L 0 -2.6 L 2.6 0 L 0 2.6 Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <p className="pamalaye-house-memoriam-label">
                <span
                  className="pamalaye-memoriam-dove is-left"
                  aria-hidden="true"
                >
                  <MemorialDove />
                </span>
                Special mention
                <span
                  className="pamalaye-memoriam-dove is-right"
                  aria-hidden="true"
                >
                  <MemorialDove />
                </span>
              </p>
              <ul className="pamalaye-house-memoriam-names">
                <li>Nida Jusain</li>
                <li>Alma Torres</li>
              </ul>
            </div>
            <p className="pamalaye-house-note">
              Odiongan, Brgy. Novallas, Tanjay City
            </p>
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
            <div className="pamalaye-asking-val">
              Monday · the eighth of June
              <br />
              Two thousand twenty-six · four o&rsquo;clock

              <ol className="pamalaye-schedule" aria-label="Order of the afternoon">
                <li className="pamalaye-schedule-item">
                  <span className="pamalaye-schedule-bullet" aria-hidden="true" />
                  <span className="pamalaye-schedule-time">
                    3<i>pm</i>
                  </span>
                  <span className="pamalaye-schedule-label">
                    <span className="pamalaye-schedule-name"> Merienda</span>
                    <span className="pamalaye-schedule-gloss"> light snacks served</span>
                  </span>
                </li>
                <li className="pamalaye-schedule-item is-pivot">
                  <span className="pamalaye-schedule-bullet" aria-hidden="true" />
                  <span className="pamalaye-schedule-time">
                    4<i>pm</i>
                  </span>
                  <span className="pamalaye-schedule-label">
                    <span className="pamalaye-schedule-name"> Pamalaye</span>
                    <span className="pamalaye-schedule-gloss"> the asking begins</span>
                  </span>
                </li>
                <li className="pamalaye-schedule-item">
                  <span className="pamalaye-schedule-bullet" aria-hidden="true" />
                  <span className="pamalaye-schedule-time">
                    6<i>pm</i>
                  </span>
                  <span className="pamalaye-schedule-label">
                    <span className="pamalaye-schedule-name"> Hapunan</span>
                    <span className="pamalaye-schedule-gloss"> supper, together</span>
                  </span>
                </li>
              </ol>
            </div>
          </div>
          <div className="pamalaye-asking-row">
            <span className="pamalaye-asking-key">Where</span>
            <span className="pamalaye-asking-val">
              Ermita
              <br />
              Poblacion, Pamplona, Negros Oriental
            </span>
          </div>
          <div className="pamalaye-asking-row pamalaye-asking-dress" tabIndex={0}>
            <span className="pamalaye-asking-key">Dress</span>
            <div className="pamalaye-asking-val">
              White or light beige &middot; casual attire
              <br />
              <em>set against a deep, old-world palette</em>
              <ul className="pamalaye-palette" aria-label="event colour palette">
                {[
                  { name: "Antique Taupe", c: "#b7a58d" },
                  { name: "Crimson Velvet", c: "#7a2a33" },
                  { name: "Claystone", c: "#b09175" },
                  { name: "Oak Moss", c: "#55553c" },
                  { name: "Espresso Ember", c: "#2c1810" },
                ].map((s) => (
                  <li key={s.name} style={{ "--c": s.c } as React.CSSProperties}>
                    <span className="pamalaye-swatch" aria-hidden="true" />
                    <span className="pamalaye-swatch-name">{s.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="pamalaye-dress-preview"
              role="img"
              aria-label="Dress code reference — white and light beige attire"
            >
              <span className="pamalaye-dress-kicker">The wardrobe</span>
              <img
                className="pamalaye-dress-img"
                src="/dress-code.png"
                alt=""
                draggable={false}
                onError={(e) => {
                  e.currentTarget.classList.add("is-missing");
                }}
              />
              <svg
                className="pamalaye-dress-forms"
                viewBox="0 0 240 150"
                aria-hidden="true"
              >
                {/* brass rail */}
                <line
                  x1="22"
                  y1="22"
                  x2="218"
                  y2="22"
                  stroke="#9a7a3e"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <circle cx="22" cy="22" r="2" fill="#9a7a3e" />
                <circle cx="218" cy="22" r="2" fill="#9a7a3e" />

                {/* gown 1 — ivory, strapless A-line */}
                <g transform="translate(60 22)">
                  <path
                    d="M -2 0 q -4 -4 0 -8 q 4 -4 8 0 q 4 4 0 8"
                    fill="none"
                    stroke="#9a7a3e"
                    strokeWidth="0.9"
                  />
                  <path
                    d="M -12 4 L -5 8 L -6 28 L -22 115 L 22 115 L 6 28 L 5 8 L 12 4 Z"
                    fill="#fbf1dc"
                    stroke="#b7a58d"
                    strokeWidth="0.7"
                  />
                  <path
                    d="M -6 40 Q 0 38 6 40"
                    fill="none"
                    stroke="#9a7a3e"
                    strokeWidth="0.5"
                    opacity="0.7"
                  />
                </g>

                {/* gown 2 — linen two-piece, beige */}
                <g transform="translate(120 22)">
                  <path
                    d="M -2 0 q -4 -4 0 -8 q 4 -4 8 0 q 4 4 0 8"
                    fill="none"
                    stroke="#9a7a3e"
                    strokeWidth="0.9"
                  />
                  {/* shirt */}
                  <path
                    d="M -14 4 L -5 10 L -5 52 L 5 52 L 5 10 L 14 4 L 12 50 L -12 50 Z"
                    fill="#f1e4cc"
                    stroke="#b7a58d"
                    strokeWidth="0.7"
                  />
                  <line
                    x1="0"
                    y1="10"
                    x2="0"
                    y2="48"
                    stroke="#b7a58d"
                    strokeWidth="0.4"
                  />
                  {/* trousers */}
                  <path
                    d="M -12 50 L -8 115 L -2 115 L 0 72 L 2 115 L 8 115 L 12 50 Z"
                    fill="#c9b89a"
                    stroke="#9a7a3e"
                    strokeWidth="0.5"
                  />
                </g>

                {/* gown 3 — taupe floor-length */}
                <g transform="translate(180 22)">
                  <path
                    d="M -2 0 q -4 -4 0 -8 q 4 -4 8 0 q 4 4 0 8"
                    fill="none"
                    stroke="#9a7a3e"
                    strokeWidth="0.9"
                  />
                  <path
                    d="M -10 6 L -4 10 L -5 26 L -20 115 L 20 115 L 5 26 L 4 10 L 10 6 Z"
                    fill="#b7a58d"
                    stroke="#8a7658"
                    strokeWidth="0.6"
                  />
                  {/* drape line */}
                  <path
                    d="M 0 32 Q -4 60 -8 110"
                    fill="none"
                    stroke="#8a7658"
                    strokeWidth="0.4"
                    opacity="0.6"
                  />
                </g>
              </svg>
              <span className="pamalaye-dress-caption">
                ivory &middot; beige &middot; earth
              </span>
            </div>
          </div>
          <div className="pamalaye-asking-row">
            <span className="pamalaye-asking-key">Please bring</span>
            <span className="pamalaye-asking-val">
              Nothing but your voice and a blessing
              <br />
              <em>merienda will be served at 3:00 pm</em>
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
          <span>Mary Grace Lado Labe &amp; Valian Zerna Jusain</span>
        </p>
      </Revealable>

      <footer className="pamalaye-footer">
        <p>Mga Pamilya Labe &amp; Jusain</p>
        <p className="pamalaye-footer-small">
          June 8, 2026 &middot; Ermita, Poblacion, Pamplona, Negros Oriental
        </p>
        <p className="pamalaye-footer-blessing">
          We look forward to your presence and blessings on this special
          occasion. See you there.
        </p>
        <figure className="pamalaye-footer-portrait" aria-label="Our beloved dogs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dogs.jpeg" alt="Our beloved dogs" loading="lazy" />
        </figure>
      </footer>
    </div>
  );
}

export default function Pamalaye() {
  const [stage, setStage] = useState<Stage>("sealed");
  const [vinylVanished, setVinylVanished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const canOpenEnvelope = stage === "sealed";
  const isEnvelopeOpening = stage === "opening" || stage === "playing";
  const isEnvelopePlaying = stage === "playing";
  const isEnvelopeRevealed = stage === "revealed";
  const canPlayVinyl = stage === "opening";

  // lock scroll until the envelope is opened
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("site-open", isEnvelopeRevealed);
    document.body.style.overflow = isEnvelopeRevealed ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEnvelopeRevealed]);

  function openEnvelope() {
    if (!canOpenEnvelope) return;
    setStage("opening");
  }

  function playVinyl() {
    if (!canPlayVinyl) return;
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => { });
    }
    setStage("playing");
    // vinyl sparkles + dissolves at 1.3s, the pamalaye page reveals shortly after
    window.setTimeout(() => setVinylVanished(true), 1300);
    window.setTimeout(() => setStage("revealed"), 2600);
  }

  return (
    <div className={`invitation-page pamalaye-invitation-shell ${isEnvelopeRevealed ? "is-open" : ""}`}>
      <div className="paper-grain" aria-hidden="true" />

      <section
        className={`envelope-scene ${isEnvelopeOpening ? "is-opening" : ""} ${isEnvelopePlaying ? "is-playing" : ""} ${isEnvelopeRevealed ? "is-revealed" : ""}`}
        aria-label="Sealed envelope — tap the wax to open"
      >
        <div className="envelope">
          <div className="envelope-body">
            <div className="envelope-letter">
              <span className="envelope-letter-ornament" aria-hidden="true">❦</span>
              <p className="envelope-letter-line">A quiet word, house to house</p>

              <button
                type="button"
                className={`envelope-vinyl ${isEnvelopePlaying ? "is-spinning" : ""} ${vinylVanished ? "is-vanished" : ""}`}
                onClick={playVinyl}
                disabled={!canPlayVinyl}
                aria-label="Drop the needle — play the kundiman"
              >
                <span className="vinyl-sparkles" aria-hidden="true">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span
                      key={i}
                      className="vinyl-sparkle"
                      style={{ "--i": i, "--n": 14 } as React.CSSProperties}
                    />
                  ))}
                </span>
                <svg className="vinyl-svg" viewBox="0 0 200 200" aria-hidden="true">
                  <defs>
                    <radialGradient id="pam-vinyl-gloss" cx="35%" cy="28%" r="55%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                      <stop offset="60%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                    <radialGradient id="pam-vinyl-body" cx="50%" cy="50%" r="55%">
                      <stop offset="0%" stopColor="#1a1a1a" />
                      <stop offset="80%" stopColor="#0a0a0a" />
                      <stop offset="100%" stopColor="#000" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="100" r="98" fill="url(#pam-vinyl-body)" />
                  {[93, 86, 79, 72, 65, 58, 51, 46].map((r) => (
                    <circle
                      key={r}
                      cx="100"
                      cy="100"
                      r={r}
                      fill="none"
                      stroke="#2a2a2a"
                      strokeOpacity="0.55"
                      strokeWidth="0.35"
                    />
                  ))}
                  <circle cx="100" cy="100" r="40" fill="#a0341a" />
                  <circle cx="100" cy="100" r="40" fill="none" stroke="#55000f" strokeWidth="0.8" />
                  <g className="vinyl-label-text" fill="#fbf1dc">
                    <text x="100" y="90" textAnchor="middle" fontSize="6.4" fontFamily="serif" fontStyle="italic" letterSpacing="0.4">
                      little things
                    </text>
                    <text x="100" y="100" textAnchor="middle" fontSize="3" letterSpacing="1.6">
                      ♡ · ♡ · ♡
                    </text>
                    <text x="100" y="112" textAnchor="middle" fontSize="3.2" letterSpacing="0.8">
                      ONE DIRECTION
                    </text>
                  </g>
                  <circle cx="100" cy="100" r="2.2" fill="#1a0810" />
                  <circle cx="100" cy="100" r="98" fill="url(#pam-vinyl-gloss)" />
                </svg>
                <span className="vinyl-needle" aria-hidden="true">
                  <span className="vinyl-needle-arm">
                    <span className="vinyl-needle-head" />
                  </span>
                </span>
              </button>

              <p className="envelope-letter-sub" aria-hidden="true">
                {canPlayVinyl
                  ? "tap the record — play the kundiman"
                  : isEnvelopePlaying
                    ? "now playing ♫"
                    : "balay · balay"}
              </p>
            </div>
            <div className="envelope-pocket" aria-hidden="true" />
            <div className="envelope-flap" aria-hidden="true">
              <span className="envelope-flap-liner" />
            </div>
            <button
              type="button"
              className="wax-crest is-photo"
              onClick={openEnvelope}
              disabled={!canOpenEnvelope}
              aria-label="Break the seal to open the pamalaye"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/seal.png"
                alt=""
                className="wax-crest-image"
                draggable={false}
              />
            </button>
          </div>
        </div>
        <p className="envelope-caption">
          {canOpenEnvelope ? "tap the wax seal" : canPlayVinyl ? "drop the needle" : ""}
        </p>
      </section>

      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="auto"
        playsInline
        aria-hidden="true"
      />


      {stage !== "sealed" && (
        <main
          className={`wedding-site pamalaye-site ${isEnvelopeRevealed ? "is-visible" : ""}`}
          aria-hidden={isEnvelopeRevealed ? undefined : true}
        >
          <PamalayeContent />
        </main>
      )}
    </div>
  );
}
