"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, hasRequiredConfig } from "@/lib/firebase";

type Stage = "sealed" | "opening" | "playing" | "revealed";
type SiteStage = "pamalaye" | "wedding";

// YouTube video id for "Little Things — One Direction". Swap if needed.
const MUSIC_VIDEO_ID = "xGPeNN9S0Fg";

function OliveCrest({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`crest ${className}`}
      viewBox="0 0 220 220"
      aria-hidden="true"
      role="presentation"
    >
      <g className="crest-branches" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path className="crest-stroke" d="M 110 200 Q 52 176 36 120 Q 28 78 56 40" />
        <path className="crest-stroke" d="M 110 200 Q 168 176 184 120 Q 192 78 164 40" />
        <g className="crest-leaves">
          <ellipse cx="44" cy="148" rx="11" ry="4.2" transform="rotate(-56 44 148)" />
          <ellipse cx="36" cy="124" rx="11.5" ry="4.2" transform="rotate(-72 36 124)" />
          <ellipse cx="34" cy="100" rx="11.5" ry="4.2" transform="rotate(-88 34 100)" />
          <ellipse cx="40" cy="76" rx="11" ry="4.2" transform="rotate(-106 40 76)" />
          <ellipse cx="52" cy="56" rx="10" ry="4" transform="rotate(-122 52 56)" />
          <ellipse cx="62" cy="168" rx="10" ry="3.8" transform="rotate(-36 62 168)" />
          <ellipse cx="54" cy="112" rx="10" ry="3.8" transform="rotate(62 54 112)" />
          <ellipse cx="50" cy="86" rx="9.5" ry="3.8" transform="rotate(44 50 86)" />
          <ellipse cx="176" cy="148" rx="11" ry="4.2" transform="rotate(56 176 148)" />
          <ellipse cx="184" cy="124" rx="11.5" ry="4.2" transform="rotate(72 184 124)" />
          <ellipse cx="186" cy="100" rx="11.5" ry="4.2" transform="rotate(88 186 100)" />
          <ellipse cx="180" cy="76" rx="11" ry="4.2" transform="rotate(106 180 76)" />
          <ellipse cx="168" cy="56" rx="10" ry="4" transform="rotate(122 168 56)" />
          <ellipse cx="158" cy="168" rx="10" ry="3.8" transform="rotate(36 158 168)" />
          <ellipse cx="166" cy="112" rx="10" ry="3.8" transform="rotate(-62 166 112)" />
          <ellipse cx="170" cy="86" rx="9.5" ry="3.8" transform="rotate(-44 170 86)" />
        </g>
        <circle className="crest-tie" cx="110" cy="196" r="3.2" />
      </g>
      <g className="crest-monogram">
        <text x="110" y="118" textAnchor="middle">E</text>
        <text x="110" y="146" textAnchor="middle" className="crest-amp">&amp;</text>
        <text x="110" y="172" textAnchor="middle">L</text>
      </g>
    </svg>
  );
}

function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`sprig ${className}`}
      viewBox="0 0 120 40"
      aria-hidden="true"
      role="presentation"
    >
      <path d="M 4 30 Q 40 10 116 20" fill="none" strokeLinecap="round" />
      <g className="sprig-leaves">
        <ellipse cx="22" cy="24" rx="7" ry="2.6" transform="rotate(-18 22 24)" />
        <ellipse cx="40" cy="18" rx="8" ry="2.8" transform="rotate(-10 40 18)" />
        <ellipse cx="60" cy="15" rx="8.5" ry="2.8" transform="rotate(-4 60 15)" />
        <ellipse cx="80" cy="16" rx="8" ry="2.8" transform="rotate(2 80 16)" />
        <ellipse cx="100" cy="19" rx="7" ry="2.6" transform="rotate(6 100 19)" />
        <ellipse cx="32" cy="30" rx="6" ry="2.2" transform="rotate(-24 32 30)" />
        <ellipse cx="70" cy="22" rx="6" ry="2.2" transform="rotate(10 70 22)" />
        <ellipse cx="92" cy="26" rx="6" ry="2.2" transform="rotate(16 92 26)" />
      </g>
    </svg>
  );
}

const HERO_IMG = "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=1800&q=80";
const VENUE_IMG = "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1400&q=80";

// Transparent-PNG corner decoration (rose & flourish cluster).
const CORNER_BOUQUET_IMG = "/flower.png";

const STORY_POLAROIDS: Array<{ src: string; caption: string; year: string }> = [
  { src: "https://images.unsplash.com/photo-1525772764200-be829a350797?auto=format&fit=crop&w=700&q=80", caption: "under the umbrella", year: "MMXIV" },
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80", caption: "a long walk home", year: "MMXVII" },
  { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=700&q=80", caption: "the small, small things", year: "MMXXIII" },
];
const GALLERY_IMGS: Array<{ src: string; alt: string; span?: string }> = [
  { src: "https://images.unsplash.com/photo-1525772764200-be829a350797?auto=format&fit=crop&w=900&q=80", alt: "A bouquet on a wooden bench", span: "tall" },
  { src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1100&q=80", alt: "A wedding arch at golden hour" },
  { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80", alt: "A couple walking hand in hand" },
  { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1100&q=80", alt: "Candlelit reception tables", span: "wide" },
  { src: "https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&w=800&q=80", alt: "Two wedding rings on linen" },
  { src: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1000&q=80", alt: "A field of wildflowers", span: "tall" },
];

const WEDDING_DATE = new Date("2026-06-08T16:00:00-07:00");

/* ─── Falling rose petals on hero ──────────────────────── */
function Petals({ count = 16 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        key: i,
        left: Math.random() * 100,
        delay: -Math.random() * 22,
        duration: 14 + Math.random() * 16,
        swayDuration: 4 + Math.random() * 4,
        drift: (Math.random() - 0.3) * 180,
        scale: 0.55 + Math.random() * 0.9,
        hue: Math.floor(Math.random() * 3),
      })),
    [count],
  );

  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.key}
          className={`petal petal-hue-${p.hue}`}
          style={
            {
              "--left": `${p.left}%`,
              "--delay": `${p.delay}s`,
              "--duration": `${p.duration}s`,
              "--sway-duration": `${p.swayDuration}s`,
              "--drift": `${p.drift}px`,
              "--scale": p.scale,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 20 18" aria-hidden="true">
            <path
              d="M 10 1 C 4 5, 1 12, 10 17 C 19 12, 16 5, 10 1 Z"
              fill="currentColor"
            />
            <path
              d="M 10 4 C 7 7, 6 11, 10 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.35"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

/* ─── Live countdown to the wedding ────────────────────── */
type Diff = { days: number; hours: number; minutes: number };

function diffToTarget(target: Date): Diff {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

function Countdown({ target }: { target: Date }) {
  const [diff, setDiff] = useState<Diff | null>(null);

  useEffect(() => {
    setDiff(diffToTarget(target));
    const id = setInterval(() => setDiff(diffToTarget(target)), 30_000);
    return () => clearInterval(id);
  }, [target]);

  if (!diff) return null;

  const done = diff.days === 0 && diff.hours === 0 && diff.minutes === 0;

  return (
    <div className="countdown" aria-live="polite">
      <span className="countdown-label">
        {done ? "Today is the day" : "Until we say I do"}
      </span>
      {!done && (
        <div className="countdown-units">
          <span className="countdown-unit">
            <b>{diff.days}</b>
            <em>days</em>
          </span>
          <span className="countdown-sep" aria-hidden="true">·</span>
          <span className="countdown-unit">
            <b>{String(diff.hours).padStart(2, "0")}</b>
            <em>hours</em>
          </span>
          <span className="countdown-sep" aria-hidden="true">·</span>
          <span className="countdown-unit">
            <b>{String(diff.minutes).padStart(2, "0")}</b>
            <em>min</em>
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Confetti burst on RSVP success ──────────────────── */
function Confetti({ count = 36 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        key: i,
        left: 10 + Math.random() * 80,
        delay: Math.random() * 0.25,
        duration: 1.8 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 260,
        rotate: Math.random() * 720 - 360,
        scale: 0.6 + Math.random() * 0.8,
        hue: Math.floor(Math.random() * 4),
      })),
    [count],
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.key}
          className={`confetti-piece confetti-hue-${p.hue}`}
          style={
            {
              "--left": `${p.left}%`,
              "--delay": `${p.delay}s`,
              "--duration": `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--rotate": `${p.rotate}deg`,
              "--scale": p.scale,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function useReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();

  }, deps);

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
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ─── Scroll-linked story section ──────────────────────── */
function StorySection() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);

    let raf = 0;
    function update() {
      raf = 0;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height + vh;
      const scrolled = vh - rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      el.style.setProperty("--sp", p.toFixed(4));
    }
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} id="story" className="story-v2 reveal">
      {/* ambient drifting umbrella */}
      <svg className="story-umbrella" viewBox="0 0 80 80" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M40 10 C 16 10 8 30 8 34 L 72 34 C 72 30 64 10 40 10 Z" />
          <path d="M8 34 Q 16 40 24 34 Q 32 40 40 34 Q 48 40 56 34 Q 64 40 72 34" />
          <path d="M40 10 L 40 34" />
          <path d="M40 34 L 40 62 C 40 68 45 70 50 66" />
          <path d="M22 33 L 20 12" strokeWidth="0.7" />
          <path d="M58 33 L 60 12" strokeWidth="0.7" />
        </g>
      </svg>

      {/* falling rain lines (subtle, behind polaroids) */}
      <div className="story-rain" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            style={{
              "--rx": `${(i * 7.3) % 100}%`,
              "--rd": `${(i * 0.37) % 2.2}s`,
              "--rs": `${2.4 + ((i * 0.53) % 1.8)}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="story-grid">
        {/* ─── left: polaroid stack ─── */}
        <div className="story-v2-photos">
          <div className="polaroid-stack">
            {STORY_POLAROIDS.map((p, i) => (
              <figure
                key={p.src}
                className="polaroid"
                style={{ "--idx": i } as React.CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" loading="lazy" />
                <figcaption>
                  <span className="polaroid-caption">{p.caption}</span>
                  <span className="polaroid-year">{p.year}</span>
                </figcaption>
                <span className="polaroid-tape" aria-hidden="true" />
              </figure>
            ))}
          </div>

          <p className="story-fan-hint" aria-hidden="true">
            <span>keep scrolling</span>
            <svg viewBox="0 0 40 10">
              <path d="M 2 5 L 36 5" />
              <path d="M 30 1 L 36 5 L 30 9" fill="none" />
            </svg>
          </p>
        </div>

        {/* ─── right: text ─── */}
        <div className="story-v2-text">
          <div className="story-chapter">
            <span>Chapter I</span>
            <span className="story-chapter-years">2014 — 2026</span>
          </div>

          <p className="section-label">Our story</p>

          <h2 className="section-heading story-v2-heading">
            A rainy{" "}
            <span className="story-v2-em">
              <em>Thursday</em>
              <svg className="story-v2-underline" viewBox="0 0 220 14" aria-hidden="true">
                <path d="M 4 9 Q 55 2 110 7 T 216 5" />
              </svg>
            </span>
            <br />
            that never quite ended.
          </h2>

          <div className="story-v2-body">
            <p className="story-v2-para">
              <span className="dropcap">W</span>e met under a borrowed umbrella
              neither of us wanted to return. Somewhere between laughter and a
              long walk home, our forever quietly began.
            </p>
            <p className="story-v2-para">
              What followed was a decade of small, ordinary things that became
              our most extraordinary memories.
            </p>
          </div>

          <ul className="story-moments" aria-label="little things we love">
            <li><span className="moment-dot" /> coffee on the balcony</li>
            <li><span className="moment-dot" /> handwritten notes in books</li>
            <li><span className="moment-dot" /> kitchen dances at midnight</li>
            <li><span className="moment-dot" /> Sunday market flowers</li>
          </ul>

          <p className="story-v2-closing">
            Now we are gathering with the people we love most to begin the next
            chapter together. Your presence, in any form, would mean the world.
          </p>

          <p className="story-v2-signoff">
            — with love,
            <br />
            <span className="story-signoff-names">Grasya &amp; Valian</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  // live site stage — null while resolving. When "pamalaye", redirect to /pamalaye.
  const [siteStage, setSiteStage] = useState<SiteStage | null>(null);

  useEffect(() => {
    if (!hasRequiredConfig || !db) {
      // no firebase → fall back to pamalaye holding page
      setSiteStage("pamalaye");
      return;
    }
    const unsub = onSnapshot(
      doc(db, "config", "site"),
      (snap) => {
        const next = snap.exists() ? (snap.data() as { stage?: SiteStage })?.stage : undefined;
        setSiteStage(next === "wedding" ? "wedding" : "pamalaye");
      },
      () => setSiteStage("pamalaye"),
    );
    return () => unsub();
  }, []);

  // if we're still in pamalaye, this route should live at /pamalaye
  useEffect(() => {
    if (siteStage === "pamalaye") {
      router.replace("/pamalaye");
    }
  }, [siteStage, router]);

  const [stage, setStage] = useState<Stage>("sealed");
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [vinylVanished, setVinylVanished] = useState(false);

  const heroImgRef = useRef<HTMLImageElement | null>(null);
  const heroCrestRef = useRef<HTMLDivElement | null>(null);

  const canOpenEnvelope = stage === "sealed";
  const isEnvelopeOpening = stage === "opening" || stage === "playing";
  const isEnvelopePlaying = stage === "playing";
  const isEnvelopeRevealed = stage === "revealed";
  const canPlayVinyl = stage === "opening";
  const siteAriaHidden = useMemo(
    () => (isEnvelopeRevealed ? undefined : true),
    [isEnvelopeRevealed],
  );

  // lock scroll until the envelope is opened (wedding stage only)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (siteStage !== "wedding") return;
    document.documentElement.classList.toggle("site-open", isEnvelopeRevealed);
    document.body.style.overflow = isEnvelopeRevealed ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEnvelopeRevealed, siteStage]);

  // lightbox keyboard controls
  useEffect(() => {
    if (lightboxIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((i) => (i === null ? null : (i + 1) % GALLERY_IMGS.length));
      if (e.key === "ArrowLeft") setLightboxIdx((i) => (i === null ? null : (i - 1 + GALLERY_IMGS.length) % GALLERY_IMGS.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx]);

  // mouse parallax on hero image + 3D tilt on hero crest
  useEffect(() => {
    if (!isEnvelopeRevealed) return;
    let raf = 0;
    function onMove(e: MouseEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;  // -1..1
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        const img = heroImgRef.current;
        if (img) {
          img.style.setProperty("--mx", String(x));
          img.style.setProperty("--my", String(y));
        }
        const crest = heroCrestRef.current;
        if (crest) {
          crest.style.setProperty("--tx", String(x));
          crest.style.setProperty("--ty", String(y));
        }
        raf = 0;
      });
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isEnvelopeRevealed]);

  function openEnvelope() {
    if (!canOpenEnvelope) return;
    setStage("opening");
  }

  function playVinyl() {
    if (!canPlayVinyl) return;
    setMusicPlaying(true);
    setStage("playing");
    // vinyl dissolves with sparkles at ~1.3s, site reveals shortly after
    window.setTimeout(() => setVinylVanished(true), 1300);
    window.setTimeout(() => setStage("revealed"), 2600);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("saving");
    setSubmitMessage(null);

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const attendance = String(data.get("attendance") ?? "");
    const guests = Number(data.get("guests") ?? 1);
    const note = String(data.get("note") ?? "").trim();

    if (!hasRequiredConfig || !db) {
      setSubmitState("error");
      setSubmitMessage("Firebase is not configured yet. Add values to .env and restart dev.");
      return;
    }

    try {
      await addDoc(collection(db, "rsvps"), {
        name: name || "Guest",
        attendance,
        guests,
        note,
        createdAt: serverTimestamp(),
      });

      setSubmittedName(name || "Guest");
      setSubmitState("success");
      setSubmitMessage("Your reply is tucked between the pages.");
      event.currentTarget.reset();
      if (attendance === "yes") {
        setShowConfetti(true);
        window.setTimeout(() => setShowConfetti(false), 3500);
      }
    } catch {
      setSubmitState("error");
      setSubmitMessage("Could not send the letter. Check Firebase config and try again.");
    }
  }

  // hold a neutral loading state while we resolve + while we're bouncing to /pamalaye
  if (siteStage === null || siteStage === "pamalaye") {
    return <div className="pamalaye-boot" aria-hidden="true" />;
  }

  return (
    <div className={`invitation-page ${isEnvelopeRevealed ? "is-open" : ""}`}>
      <div className="paper-grain" aria-hidden="true" />

      {/* ─── sealed envelope ─────────────────────────────────── */}
      <section
        className={`envelope-scene ${isEnvelopeOpening ? "is-opening" : ""} ${isEnvelopePlaying ? "is-playing" : ""
          } ${isEnvelopeRevealed ? "is-revealed" : ""}`}
        aria-label="Sealed envelope — tap the wax to open"
      >
        <div className="envelope">
          <div className="envelope-body">
            <div className="envelope-letter">
              <span className="envelope-letter-ornament" aria-hidden="true">❦</span>
              <p className="envelope-letter-line">For the ones we love most</p>

              <button
                type="button"
                className={`envelope-vinyl ${isEnvelopePlaying ? "is-spinning" : ""} ${vinylVanished ? "is-vanished" : ""
                  }`}
                onClick={playVinyl}
                disabled={!canPlayVinyl}
                aria-label="Drop the needle — play our song"
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
                    <radialGradient id="vinyl-gloss" cx="35%" cy="28%" r="55%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                      <stop offset="60%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                    <radialGradient id="vinyl-body" cx="50%" cy="50%" r="55%">
                      <stop offset="0%" stopColor="#1a1a1a" />
                      <stop offset="80%" stopColor="#0a0a0a" />
                      <stop offset="100%" stopColor="#000" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="100" r="98" fill="url(#vinyl-body)" />
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
                  <circle cx="100" cy="100" r="40" fill="#c41e3a" />
                  <circle cx="100" cy="100" r="40" fill="none" stroke="#7a0d1e" strokeWidth="0.8" />
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
                  <circle cx="100" cy="100" r="98" fill="url(#vinyl-gloss)" />
                </svg>
                <span className="vinyl-needle" aria-hidden="true">
                  <span className="vinyl-needle-arm" />
                  <span className="vinyl-needle-head" />
                </span>
              </button>

              <p className="envelope-letter-sub" aria-hidden="true">
                {canPlayVinyl
                  ? "tap the record — play our song"
                  : isEnvelopePlaying
                    ? "now playing ♫"
                    : "a small letter enclosed"}
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
              aria-label="Break the seal to open the invitation"
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

      {/* hidden music iframe — persists across stages once started */}
      {musicPlaying && (
        <iframe
          className="music-iframe"
          src={`https://www.youtube.com/embed/${MUSIC_VIDEO_ID}?autoplay=1&controls=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=${MUSIC_VIDEO_ID}`}
          allow="autoplay; encrypted-media"
          title="Little Things — One Direction"
          aria-hidden="true"
        />
      )}

      {/* ─── full-page wedding site (mounted only after tap) ──── */}
      {stage !== "sealed" && (
        <main className={`wedding-site ${isEnvelopeRevealed ? "is-visible" : ""}`} aria-hidden={siteAriaHidden}>
          {/* HERO */}
          <section className="hero">
            {/* hero background image — disabled for now, will use later
          <div className="hero-image">
            <img ref={heroImgRef} src={HERO_IMG} alt="" decoding="async" />
            <div className="hero-image-wash" aria-hidden="true" />
          </div>
          */}

            <Petals />

            <div
              className="hero-bouquet hero-bouquet-tl"
              style={{ backgroundImage: `url("${CORNER_BOUQUET_IMG}")` } as React.CSSProperties}
              aria-hidden="true"
            />
            <div
              className="hero-bouquet hero-bouquet-tr"
              style={{ backgroundImage: `url("${CORNER_BOUQUET_IMG}")` } as React.CSSProperties}
              aria-hidden="true"
            />
            <div
              className="hero-bouquet hero-bouquet-bl"
              style={{ backgroundImage: `url("${CORNER_BOUQUET_IMG}")` } as React.CSSProperties}
              aria-hidden="true"
            />
            <div
              className="hero-bouquet hero-bouquet-br"
              style={{ backgroundImage: `url("${CORNER_BOUQUET_IMG}")` } as React.CSSProperties}
              aria-hidden="true"
            />

            <aside className="date-strip" aria-hidden="true">
              <span className="date-strip-year">MMXXVI</span>
              <span className="date-strip-dot">·</span>
              <span className="date-strip-month">June</span>
              <span className="date-strip-day">the eighth</span>
              <span className="date-strip-dot">·</span>
              <span className="date-strip-place">Negros Oriental</span>
            </aside>

            <div className="hero-inner">
              <p className="hero-eyebrow">
                <span>Together with their families</span>
              </p>

              <div className="hero-crest" ref={heroCrestRef}>
                <OliveCrest />
              </div>

              <h1 className="names">
                <span className="name-line">Grasya</span>
                <span className="ampersand" aria-hidden="true">&amp;</span>
                <span className="sr-only"> and </span>
                <span className="name-line name-line-right">Valian</span>
              </h1>

              <svg
                className="names-swash"
                viewBox="0 0 380 40"
                aria-hidden="true"
                role="presentation"
              >
                <path d="M 8 28 C 60 10, 130 36, 190 22 S 320 10, 372 28" />
                <circle className="swash-dot" cx="4" cy="29" />
                <circle className="swash-dot" cx="376" cy="29" />
              </svg>

              <p className="hero-date">
                Monday · June eighth · Two thousand twenty-six
              </p>
              <p className="hero-venue">Ermita, Poblacion, Pamplona, Negros Oriental</p>

              <Countdown target={WEDDING_DATE} />

              <a className="scroll-cue" href="#story" aria-label="Scroll to our story">
                <span>scroll</span>
                <span className="scroll-cue-line" aria-hidden="true" />
              </a>
            </div>
          </section>

          {/* STORY */}
          <StorySection />

          {/* TIMELINE */}
          <Revealable className="timeline-section">
            <header className="section-header">
              <p className="section-label">The day</p>
              <h2 className="section-heading">
                A slow evening <em>of candlelight.</em>
              </h2>
              <Sprig className="section-sprig" />
            </header>

            <ol className="timeline">
              <li className="timeline-item">
                <p className="timeline-time">4:30 pm</p>
                <p className="timeline-label">Arrival</p>
                <h3>A welcome drink</h3>
                <p className="timeline-body">
                  Find your seat in the olive grove. Something cold, something sparkling.
                </p>
              </li>
              <li className="timeline-item">
                <p className="timeline-time">5:30 pm</p>
                <p className="timeline-label">The ceremony</p>
                <h3>Golden-hour vows</h3>
                <p className="timeline-body">
                  Garden aisle · a small quartet · thirty minutes that will change
                  everything, and nothing.
                </p>
              </li>
              <li className="timeline-item">
                <p className="timeline-time">7:00 pm</p>
                <p className="timeline-label">Reception</p>
                <h3>Candlelit supper</h3>
                <p className="timeline-body">
                  A long table under the glass atrium. Speeches that will make you cry.
                  Dancing that will make you forget to.
                </p>
              </li>
              <li className="timeline-item">
                <p className="timeline-time">11:30 pm</p>
                <p className="timeline-label">Afterglow</p>
                <h3>Pastries &amp; a last dance</h3>
                <p className="timeline-body">
                  Espresso, small sweets, and one quiet slow song before lanterns lead
                  you back through the grove.
                </p>
              </li>
            </ol>
          </Revealable>

          {/* GALLERY */}
          <Revealable className="gallery-section">
            <header className="section-header">
              <p className="section-label">Moments</p>
              <h2 className="section-heading">
                Ten years <em>of Sundays.</em>
              </h2>
            </header>

            <div className="gallery-grid">
              {GALLERY_IMGS.map((img, i) => (
                <figure
                  key={img.src}
                  className={`gallery-item ${img.span ? `is-${img.span}` : ""}`}
                  style={{ "--i": i } as React.CSSProperties}
                  onClick={() => setLightboxIdx(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setLightboxIdx(i);
                    }
                  }}
                  aria-label={`Expand photo: ${img.alt}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} loading="lazy" />
                  <span className="gallery-expand" aria-hidden="true">+</span>
                </figure>
              ))}
            </div>
          </Revealable>

          {/* VENUE + DETAILS */}
          <Revealable className="venue-section">
            <div className="venue-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={VENUE_IMG} alt="" />
            </div>
            <div className="venue-text">
              <p className="section-label">The venue</p>
              <h2 className="section-heading">
                A glass atrium <em>in the olive grove.</em>
              </h2>
              <p className="venue-address">
                Larkspur Estate · 47 Conservatory Lane
                <br />
                Larkspur, California
              </p>

              <div className="details-grid">
                <article className="detail-card">
                  <p className="detail-kicker">Stay the night</p>
                  <h3>The Larkspur Inn</h3>
                  <p>
                    A small block of rooms is held under our names until the first of
                    September. Mention the wedding when booking.
                  </p>
                </article>
                <article className="detail-card">
                  <p className="detail-kicker">Attire</p>
                  <h3>Black-tie optional</h3>
                  <p>
                    We want you comfortable. Long dresses, suits, soft florals — and
                    shoes that will carry you through the dance floor.
                  </p>
                </article>
                <article className="detail-card">
                  <p className="detail-kicker">Getting there</p>
                  <h3>A short drive north</h3>
                  <p>
                    Forty minutes from the city. Valet parking will be open from four
                    o&apos;clock. A late-night shuttle returns at midnight.
                  </p>
                </article>
              </div>
            </div>
          </Revealable>

          {/* RSVP */}
          <Revealable as="section" className="rsvp-section" id="rsvp">
            <header className="section-header">
              <p className="section-label">RSVP</p>
              <h2 className="section-heading">
                Kindly reply <em>by the first of September.</em>
              </h2>
              <p className="rsvp-instruction">
                A note, a song, a toast — anything you leave below reaches us directly.
              </p>
            </header>

            <form className="rsvp-form" onSubmit={handleSubmit}>
              <div className="field field-wide">
                <label htmlFor="name">Your name, in full</label>
                <input id="name" name="name" type="text" autoComplete="name" required />
              </div>

              <fieldset className="field field-wide attendance">
                <legend>Will you join us?</legend>
                <label className="choice">
                  <input type="radio" name="attendance" value="yes" required />
                  <span className="choice-body">
                    <span className="choice-title">Joyfully</span>
                    <span className="choice-sub">I wouldn&apos;t miss it</span>
                  </span>
                </label>
                <label className="choice">
                  <input type="radio" name="attendance" value="no" required />
                  <span className="choice-body">
                    <span className="choice-title">Regretfully</span>
                    <span className="choice-sub">Sending love from afar</span>
                  </span>
                </label>
              </fieldset>

              <div className="field">
                <label htmlFor="guests">Seated with me</label>
                <select id="guests" name="guests" defaultValue="1">
                  <option value="1">Just myself</option>
                  <option value="2">Two of us</option>
                  <option value="3">A party of three</option>
                  <option value="4">A party of four</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="song">A song, a toast, a wish</label>
                <input id="song" name="song" type="text" placeholder="optional" />
              </div>

              <div className="field field-wide">
                <label htmlFor="note">A message for the couple</label>
                <textarea
                  id="note"
                  name="note"
                  rows={4}
                  placeholder="Tell us anything at all — we will read it twice."
                />
              </div>

              <button type="submit" className="submit-btn" disabled={submitState === "saving"}>
                <span>{submitState === "saving" ? "Sending..." : "Seal & send"}</span>
                <span className="submit-btn-sprig" aria-hidden="true">❦</span>
              </button>
            </form>

            {submittedName && submitState === "success" && submitMessage ? (
              <p className="submit-feedback" role="status">
                Thank you, {submittedName}. {submitMessage}
              </p>
            ) : null}

            {submitState === "error" && submitMessage ? (
              <p className="submit-feedback submit-feedback-error" role="alert">
                {submitMessage}
              </p>
            ) : null}
          </Revealable>

          {/* FOOTER */}
          <footer className="site-footer">
            <div className="footer-crest">
              <OliveCrest />
            </div>
            <p className="footer-names">Grasya &amp; Valian</p>
            <p className="footer-date">June 8, 2026 · Negros Oriental</p>
            <p className="footer-caption">
              We cannot wait to dance with you.
            </p>
          </footer>

          {/* LIGHTBOX */}
          {lightboxIdx !== null && (
            <div
              className="lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={GALLERY_IMGS[lightboxIdx].alt}
              onClick={() => setLightboxIdx(null)}
            >
              <button
                type="button"
                className="lightbox-close"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
                aria-label="Close"
              >
                ×
              </button>
              <button
                type="button"
                className="lightbox-nav lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((i) =>
                    i === null ? null : (i - 1 + GALLERY_IMGS.length) % GALLERY_IMGS.length,
                  );
                }}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={GALLERY_IMGS[lightboxIdx].src} alt={GALLERY_IMGS[lightboxIdx].alt} />
                <figcaption>{GALLERY_IMGS[lightboxIdx].alt}</figcaption>
              </figure>
              <button
                type="button"
                className="lightbox-nav lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((i) =>
                    i === null ? null : (i + 1) % GALLERY_IMGS.length,
                  );
                }}
                aria-label="Next photo"
              >
                ›
              </button>
              <p className="lightbox-counter">
                {lightboxIdx + 1} / {GALLERY_IMGS.length}
              </p>
            </div>
          )}

          {/* CONFETTI */}
          {showConfetti && <Confetti />}
        </main>
      )}
    </div>
  );
}
