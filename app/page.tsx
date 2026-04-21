"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, hasRequiredConfig } from "@/lib/firebase";

type Stage = "sealed" | "opening" | "revealed";

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

const HERO_IMG     = "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=1800&q=80";
const STORY_IMG    = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1100&q=80";
const VENUE_IMG    = "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1400&q=80";
const GALLERY_IMGS: Array<{ src: string; alt: string; span?: string }> = [
  { src: "https://images.unsplash.com/photo-1525772764200-be829a350797?auto=format&fit=crop&w=900&q=80",   alt: "A bouquet on a wooden bench", span: "tall" },
  { src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1100&q=80",  alt: "A wedding arch at golden hour" },
  { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80",   alt: "A couple walking hand in hand" },
  { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1100&q=80",  alt: "Candlelit reception tables", span: "wide" },
  { src: "https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&w=800&q=80",   alt: "Two wedding rings on linen" },
  { src: "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1000&q=80",  alt: "A field of wildflowers", span: "tall" },
];

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

export default function Home() {
  const [stage, setStage] = useState<Stage>("sealed");
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "success" | "error">("idle");

  const canOpenEnvelope = stage === "sealed";
  const isEnvelopeOpening = stage === "opening";
  const isEnvelopeRevealed = stage === "revealed";
  const siteAriaHidden = useMemo(
    () => (isEnvelopeRevealed ? undefined : true),
    [isEnvelopeRevealed],
  );

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
    window.setTimeout(() => setStage("revealed"), 1900);
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
      setSubmitMessage("Firebase is not configured yet. Add values to .env.local and restart dev.");
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
    } catch {
      setSubmitState("error");
      setSubmitMessage("Could not send the letter. Check Firebase config and try again.");
    }
  }

  return (
    <div className={`invitation-page ${isEnvelopeRevealed ? "is-open" : ""}`}>
      <div className="paper-grain" aria-hidden="true" />

      {/* ─── sealed envelope ─────────────────────────────────── */}
      <section
        className={`envelope-scene ${isEnvelopeOpening ? "is-opening" : ""} ${
          isEnvelopeRevealed ? "is-revealed" : ""
        }`}
        aria-label="Sealed envelope — tap the wax to open"
      >
        <div className="envelope">
          <div className="envelope-body">
            <div className="envelope-letter" aria-hidden="true">
              <span className="envelope-letter-ornament">❦</span>
              <p className="envelope-letter-line">For the ones we love most</p>
              <p className="envelope-letter-sub">a small letter enclosed</p>
            </div>
            <div className="envelope-pocket" aria-hidden="true" />
            <div className="envelope-flap" aria-hidden="true">
              <span className="envelope-flap-liner" />
            </div>
            <button
              type="button"
              className="wax-crest"
              onClick={openEnvelope}
              disabled={!canOpenEnvelope}
              aria-label="Break the seal to open the invitation"
            >
              <span className="wax-crest-ring" aria-hidden="true" />
              <span className="wax-crest-monogram">
                <em>E</em>
                <i>&amp;</i>
                <em>L</em>
              </span>
            </button>
          </div>
        </div>
        <p className="envelope-caption">tap the wax seal</p>
      </section>

      {/* ─── full-page wedding site (mounted only after tap) ──── */}
      {stage !== "sealed" && (
      <main className={`wedding-site ${isEnvelopeRevealed ? "is-visible" : ""}`} aria-hidden={siteAriaHidden}>
        {/* HERO */}
        <section className="hero">
          <div className="hero-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HERO_IMG} alt="" decoding="async" />
            <div className="hero-image-wash" aria-hidden="true" />
          </div>

          <aside className="date-strip" aria-hidden="true">
            <span className="date-strip-year">MMXXVI</span>
            <span className="date-strip-dot">·</span>
            <span className="date-strip-month">October</span>
            <span className="date-strip-day">the seventeenth</span>
            <span className="date-strip-dot">·</span>
            <span className="date-strip-place">Larkspur Estate</span>
          </aside>

          <div className="hero-inner">
            <p className="hero-eyebrow">
              <span>Together with their families</span>
            </p>

            <div className="hero-crest">
              <OliveCrest />
            </div>

            <h1 className="names">
              <span className="name-line">Elena</span>
              <span className="ampersand" aria-hidden="true">&amp;</span>
              <span className="sr-only"> and </span>
              <span className="name-line name-line-right">Lucas</span>
            </h1>

            <p className="hero-date">
              Saturday · October seventeenth · Two thousand twenty-six
            </p>
            <p className="hero-venue">The Gilded Conservatory — Larkspur Estate</p>

            <a className="scroll-cue" href="#story" aria-label="Scroll to our story">
              <span>scroll</span>
              <span className="scroll-cue-line" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* STORY */}
        <Revealable className="story-section" id="story">
          <div className="story-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={STORY_IMG} alt="" />
            <Sprig className="story-sprig" />
          </div>
          <div className="story-text">
            <p className="section-label">Our story</p>
            <h2 className="section-heading">
              A rainy <em>Thursday</em> that never quite ended.
            </h2>
            <p className="story-intro">
              <span className="dropcap">W</span>e met under a borrowed umbrella neither of
              us wanted to return. Somewhere between laughter and a long walk home, our
              forever quietly began. What followed was a decade of small, ordinary things
              that became our most extraordinary memories — coffee on the balcony,
              handwritten notes tucked into books, kitchen dances when no one was watching.
            </p>
            <p className="story-paragraph">
              Now we are gathering with the people we love most to begin the next chapter
              together. Your presence, in any form, would mean the world.
            </p>
            <p className="story-signoff">
              — with love,
              <br />
              <span className="story-signoff-names">Elena &amp; Lucas</span>
            </p>
          </div>
        </Revealable>

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
              <figure key={img.src} className={`gallery-item ${img.span ? `is-${img.span}` : ""}`} style={{ "--i": i } as React.CSSProperties}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} loading="lazy" />
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
          <p className="footer-names">Elena &amp; Lucas</p>
          <p className="footer-date">October 17, 2026 · Larkspur Estate</p>
          <p className="footer-caption">
            We cannot wait to dance with you.
          </p>
        </footer>
      </main>
      )}
    </div>
  );
}
