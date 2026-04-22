"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth, hasRequiredConfig } from "@/lib/firebase";

function Crest() {
  return (
    <svg
      className="crest"
      viewBox="0 0 220 220"
      aria-hidden="true"
      role="presentation"
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
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

export default function AdminLoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!auth) {
      setCheckingAuth(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/admin");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!hasRequiredConfig || !auth) {
      setError("Firebase is not configured. Add values to .env and restart dev.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (!email || !password) {
      setError("Please enter both an email and a password.");
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/admin");
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      const message =
        code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found"
          ? "Those credentials don't match anything we have on file."
          : code === "auth/too-many-requests"
          ? "Too many attempts. Try again in a moment."
          : code === "auth/invalid-email"
          ? "That email address looks malformed."
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="paper-grain" aria-hidden="true" />

      <main className="admin-login-shell">
        <Link href="/" className="admin-back">
          ← back to the invitation
        </Link>

        <article className="admin-card">
          <div className="admin-crest">
            <Crest />
          </div>

          <p className="admin-eyebrow">
            <span>Private correspondence</span>
          </p>
          <h1 className="admin-heading">
            The <em>guest book.</em>
          </h1>
          <p className="admin-sub">
            A quiet room for the keepers of the list. Sign in to read every reply
            that has come home.
          </p>

          {checkingAuth ? (
            <p className="admin-pending">checking session…</p>
          ) : (
            <form className="admin-form" onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="password">Passphrase</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error ? (
                <p className="admin-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button type="submit" className="admin-submit" disabled={submitting}>
                <span>{submitting ? "Signing in…" : "Open the guest book"}</span>
                <span className="admin-submit-sprig" aria-hidden="true">❦</span>
              </button>
            </form>
          )}

          <p className="admin-footnote">
            First time here? Create an admin account in{" "}
            <a
              href="https://console.firebase.google.com/project/rsvp-72704/authentication/users"
              target="_blank"
              rel="noreferrer"
            >
              Firebase Console → Authentication
            </a>
            , then return to this page.
          </p>
        </article>
      </main>
    </div>
  );
}
