"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { OceanLoader } from "@/components/OceanLoader";

// Brief "Launching app…" loading screen shown when entering an app page
// (e.g. /connect after clicking Launch App). Same ocean loader as the landing.
export function LaunchGate({
  children,
  status = "Launching app",
  ms = 1900,
}: {
  children: ReactNode;
  status?: string;
  ms?: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);

  return (
    <>
      {children}
      <AnimatePresence>{!ready && <OceanLoader key="launch" status={status} />}</AnimatePresence>
    </>
  );
}
