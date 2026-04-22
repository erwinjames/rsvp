"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db, hasRequiredConfig } from "@/lib/firebase";

type RSVP = {
  id: string;
  name: string;
  attendance: "yes" | "no" | string;
  guests: number;
  note: string;
  createdAt: Timestamp | null;
};

type SiteStage = "pamalaye" | "wedding";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [rsvpsLoading, setRsvpsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");

  // site stage (pamalaye | wedding)
  const [siteStage, setSiteStage] = useState<SiteStage>("pamalaye");
  const [stageCompletedAt, setStageCompletedAt] = useState<Timestamp | null>(null);
  const [stageSaving, setStageSaving] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);

  // auth gate
  useEffect(() => {
    if (!auth) {
      router.replace("/admin/login");
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/admin/login");
      } else {
        setUser(u);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // RSVP stream (only after auth confirmed)
  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, "rsvps"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const items: RSVP[] = snap.docs.map((doc) => {
          const data = doc.data() as Partial<RSVP>;
          return {
            id: doc.id,
            name: String(data.name ?? ""),
            attendance: String(data.attendance ?? ""),
            guests: Number(data.guests ?? 1),
            note: String(data.note ?? ""),
            createdAt: (data.createdAt as Timestamp | undefined) ?? null,
          };
        });
        setRsvps(items);
        setRsvpsLoading(false);
      },
      (err) => {
        setListError(
          err.code === "permission-denied"
            ? "Firestore denied access. Update security rules to allow authenticated reads on the 'rsvps' collection."
            : "Could not load the guest list. " + err.message,
        );
        setRsvpsLoading(false);
      },
    );
    return () => unsubscribe();
  }, [user]);

  // subscribe to site stage doc
  useEffect(() => {
    if (!user || !db) return;
    const unsub = onSnapshot(
      doc(db, "config", "site"),
      (snap) => {
        if (!snap.exists()) {
          setSiteStage("pamalaye");
          setStageCompletedAt(null);
          return;
        }
        const data = snap.data() as {
          stage?: SiteStage;
          pamalayeCompletedAt?: Timestamp;
        };
        setSiteStage(data.stage === "wedding" ? "wedding" : "pamalaye");
        setStageCompletedAt(data.pamalayeCompletedAt ?? null);
      },
      (err) => setStageError("Could not read site stage. " + err.message),
    );
    return () => unsub();
  }, [user]);

  async function setStage(nextStage: SiteStage) {
    if (!db || stageSaving) return;
    setStageSaving(true);
    setStageError(null);
    try {
      await setDoc(
        doc(db, "config", "site"),
        {
          stage: nextStage,
          ...(nextStage === "wedding"
            ? { pamalayeCompletedAt: serverTimestamp() }
            : { pamalayeCompletedAt: null }),
        },
        { merge: true },
      );
    } catch (err) {
      setStageError(
        "Could not update the site stage. " +
          (err instanceof Error ? err.message : "Unknown error."),
      );
    } finally {
      setStageSaving(false);
    }
  }

  const stats = useMemo(() => {
    const attending = rsvps.filter((r) => r.attendance === "yes");
    const regrets = rsvps.filter((r) => r.attendance === "no");
    const seats = attending.reduce((sum, r) => sum + (r.guests || 1), 0);
    return {
      total: rsvps.length,
      attending: attending.length,
      regrets: regrets.length,
      seats,
    };
  }, [rsvps]);

  const filtered = useMemo(() => {
    if (filter === "all") return rsvps;
    return rsvps.filter((r) => r.attendance === filter);
  }, [rsvps, filter]);

  async function handleSignOut() {
    if (!auth) return;
    await signOut(auth);
    router.replace("/admin/login");
  }

  if (!hasRequiredConfig) {
    return (
      <div className="admin-page">
        <main className="admin-login-shell">
          <article className="admin-card">
            <h1 className="admin-heading">Firebase not configured</h1>
            <p className="admin-sub">
              Add the required values to <code>.env</code> and restart the dev server.
            </p>
          </article>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <main className="admin-login-shell">
          <p className="admin-pending">opening the guest book…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page admin-page-dashboard">
      <div className="paper-grain" aria-hidden="true" />

      <header className="dashboard-header">
        <div>
          <p className="admin-eyebrow"><span>The guest book</span></p>
          <h1 className="dashboard-heading">
            Every reply, <em>gathered here.</em>
          </h1>
          {user?.email ? (
            <p className="dashboard-user">signed in as {user.email}</p>
          ) : null}
        </div>

        <div className="dashboard-actions">
          <Link href="/" className="dashboard-link">view invitation</Link>
          <button type="button" className="dashboard-signout" onClick={handleSignOut}>
            sign out
          </button>
        </div>
      </header>

      <section
        className={`stage-card stage-card-${siteStage}`}
        aria-label="Site journey stage"
      >
        <div className="stage-card-head">
          <p className="stage-card-eyebrow">Journey</p>
          <h2 className="stage-card-title">
            {siteStage === "pamalaye" ? (
              <>We&rsquo;re in the <em>pamalaye.</em></>
            ) : (
              <>The invitation is <em>live.</em></>
            )}
          </h2>
          <p className="stage-card-sub">
            {siteStage === "pamalaye"
              ? "Guests visiting the site see the quiet holding page — two houses, a countdown, and the reason we gather."
              : "Every guest now sees the full wedding invitation, with RSVP open."}
          </p>
          {stageCompletedAt ? (
            <p className="stage-card-meta">
              pamalaye marked complete · {formatDate(stageCompletedAt)}
            </p>
          ) : null}
        </div>

        <div className="stage-card-actions">
          {siteStage === "pamalaye" ? (
            <button
              type="button"
              className="stage-advance"
              onClick={() => {
                if (
                  window.confirm(
                    "Mark the pamalaye as complete? This replaces the holding page with the full wedding invitation for every guest.",
                  )
                ) {
                  setStage("wedding");
                }
              }}
              disabled={stageSaving}
            >
              <span className="stage-advance-label">
                {stageSaving ? "Sealing…" : "Mark pamalaye as complete"}
              </span>
              <span className="stage-advance-arrow" aria-hidden="true">→</span>
              <span className="stage-advance-sub">reveal the invitation</span>
            </button>
          ) : (
            <button
              type="button"
              className="stage-revert"
              onClick={() => {
                if (
                  window.confirm(
                    "Return the site to the pamalaye holding page? The wedding invitation will be hidden again.",
                  )
                ) {
                  setStage("pamalaye");
                }
              }}
              disabled={stageSaving}
            >
              {stageSaving ? "Returning…" : "Return to pamalaye"}
            </button>
          )}
        </div>

        {stageError ? (
          <p className="stage-card-error" role="alert">
            {stageError}
          </p>
        ) : null}
      </section>

      <section className="dashboard-stats" aria-label="Reply summary">
        <article className="stat">
          <p className="stat-label">Total replies</p>
          <p className="stat-value">{stats.total}</p>
        </article>
        <article className="stat stat-yes">
          <p className="stat-label">Joyfully attending</p>
          <p className="stat-value">{stats.attending}</p>
          <p className="stat-foot">{stats.seats} seat{stats.seats === 1 ? "" : "s"} to hold</p>
        </article>
        <article className="stat">
          <p className="stat-label">Regrets</p>
          <p className="stat-value">{stats.regrets}</p>
        </article>
      </section>

      <nav className="dashboard-filters" aria-label="Filter replies">
        <button
          type="button"
          className={filter === "all" ? "is-active" : ""}
          onClick={() => setFilter("all")}
        >
          All ({rsvps.length})
        </button>
        <button
          type="button"
          className={filter === "yes" ? "is-active" : ""}
          onClick={() => setFilter("yes")}
        >
          Joyful ({stats.attending})
        </button>
        <button
          type="button"
          className={filter === "no" ? "is-active" : ""}
          onClick={() => setFilter("no")}
        >
          Regret ({stats.regrets})
        </button>
      </nav>

      {listError ? (
        <p className="admin-error dashboard-error" role="alert">{listError}</p>
      ) : null}

      {rsvpsLoading ? (
        <p className="admin-pending">loading replies…</p>
      ) : filtered.length === 0 ? (
        <p className="dashboard-empty">
          <span className="dashboard-empty-ornament">❦</span>
          No replies yet under this view.
        </p>
      ) : (
        <ul className="rsvp-list">
          {filtered.map((r) => (
            <li key={r.id} className={`rsvp-item rsvp-${r.attendance}`}>
              <div className="rsvp-item-main">
                <h3 className="rsvp-name">{r.name || "(unnamed guest)"}</h3>
                <p className="rsvp-meta">
                  <span className={`rsvp-badge rsvp-badge-${r.attendance}`}>
                    {r.attendance === "yes" ? "Joyfully attending" :
                     r.attendance === "no" ? "Sending love from afar" :
                     r.attendance || "—"}
                  </span>
                  <span className="rsvp-sep">·</span>
                  <span>{r.guests} guest{r.guests === 1 ? "" : "s"}</span>
                  {r.createdAt ? (
                    <>
                      <span className="rsvp-sep">·</span>
                      <span>{formatDate(r.createdAt)}</span>
                    </>
                  ) : null}
                </p>
                {r.note ? <p className="rsvp-note">“{r.note}”</p> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(ts: Timestamp): string {
  try {
    return ts
      .toDate()
      .toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
  } catch {
    return "";
  }
}
