"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db, hasRequiredConfig } from "@/lib/firebase";
import Pamalaye from "../_components/Pamalaye";

type SiteStage = "pamalaye" | "wedding";

export default function PamalayeGuard() {
  const router = useRouter();
  const [stage, setStage] = useState<SiteStage | null>(null);

  useEffect(() => {
    if (!hasRequiredConfig || !db) {
      // no firebase → this URL is the pamalaye page; show it
      setStage("pamalaye");
      return;
    }
    const unsub = onSnapshot(
      doc(db, "config", "site"),
      (snap) => {
        const next = snap.exists() ? (snap.data() as { stage?: SiteStage })?.stage : undefined;
        setStage(next === "wedding" ? "wedding" : "pamalaye");
      },
      () => setStage("pamalaye"),
    );
    return () => unsub();
  }, []);

  // once pamalaye is marked complete, this URL should bounce home
  useEffect(() => {
    if (stage === "wedding") {
      router.replace("/");
    }
  }, [stage, router]);

  if (stage === null || stage === "wedding") {
    return <div className="pamalaye-boot" aria-hidden="true" />;
  }

  return <Pamalaye />;
}
