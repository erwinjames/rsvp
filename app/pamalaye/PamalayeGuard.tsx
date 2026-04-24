"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /pamalaye is no longer a user-facing URL — the home route renders the
// pamalaye holding page inline when the Firebase stage is "pamalaye".
// This guard exists only to bounce any old shared /pamalaye links to /.
export default function PamalayeGuard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return <div className="pamalaye-boot" aria-hidden="true" />;
}
