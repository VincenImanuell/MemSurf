"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/Logo";

const CRITICAL_IMAGES = ["/hero-surfer.png", "/features-ocean-bg.png", "/logo.png"];
const CRITICAL_VIDEOS = ["/problem-illustration.mp4"];
const MIN_LOADING_MS = 850;
const MAX_LOADING_MS = 3600;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();

    image.decoding = "async";
    image.onload = () => {
      if (image.decode) {
        image.decode().catch(() => undefined).finally(resolve);
        return;
      }

      resolve();
    };
    image.onerror = () => resolve();
    image.src = src;
  });
}

function preloadVideo(src: string) {
  return new Promise<void>((resolve) => {
    const video = document.createElement("video");

    const finish = () => {
      video.removeEventListener("loadeddata", finish);
      video.removeEventListener("canplay", finish);
      video.removeEventListener("error", finish);
      resolve();
    };

    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.addEventListener("loadeddata", finish, { once: true });
    video.addEventListener("canplay", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    video.src = src;
    video.load();
  });
}

function waitForFonts() {
  if (!document.fonts?.ready) {
    return Promise.resolve();
  }

  return document.fonts.ready.then(() => undefined).catch(() => undefined);
}

export function LandingLoadGate({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const assetsReady = Promise.all([
      ...CRITICAL_IMAGES.map(preloadImage),
      ...CRITICAL_VIDEOS.map(preloadVideo),
      waitForFonts(),
      wait(reduceMotion ? 120 : MIN_LOADING_MS),
    ]);

    Promise.race([assetsReady, wait(MAX_LOADING_MS)]).then(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {!isReady && (
          <motion.div
            role="status"
            aria-label="Loading MemSurf"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center overflow-hidden bg-navy text-white"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(56,189,248,0.36),transparent_34%),linear-gradient(180deg,#0369A1_0%,#0C4A6E_52%,#082F49_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/10 to-transparent" />

            {[...Array(36)].map((_, i) => {
              const size = 4 + (i % 5) * 2;

              return (
                <motion.span
                  key={i}
                  className="absolute rounded-full border border-white/30 bg-white/20"
                  style={{
                    width: size,
                    height: size,
                    left: `${(i * 47) % 100}%`,
                    bottom: `${(i * 19) % 90}%`,
                  }}
                  animate={{
                    x: [0, (i % 6) * 7 - 18, 0],
                    y: [0, -90 - (i % 7) * 24],
                    opacity: [0, 0.7, 0],
                    scale: [0.6, 1, 0.75],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.2 + (i % 8) * 0.45,
                    delay: (i % 10) * 0.16,
                    ease: "easeInOut",
                  }}
                />
              );
            })}

            <div className="relative z-10 flex flex-col items-center gap-7">
              <div className="text-center">
                <div className="font-serif text-4xl tracking-tight">MemSurf</div>
              </div>

              <div className="relative h-16 w-64">
                <div className="absolute left-5 right-5 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-white"
                    animate={{ width: ["8%", "100%", "8%"], opacity: [0.45, 1, 0.45] }}
                    transition={{ repeat: Infinity, duration: 2.1, ease: "easeInOut" }}
                  />
                </div>
                <motion.div
                  animate={{ x: [0, 200, 0], y: [0, -5, 0], scale: [0.96, 1.05, 0.96] }}
                  transition={{ repeat: Infinity, duration: 2.1, ease: "easeInOut" }}
                  className="absolute left-0 top-2 rounded-2xl border border-white/30 bg-white/20 p-2 shadow-2xl shadow-sky-950/30 backdrop-blur-md"
                >
                  <Logo size={40} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
