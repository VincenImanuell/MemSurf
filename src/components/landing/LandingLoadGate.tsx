"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OceanLoader } from "@/components/OceanLoader";

const CRITICAL_IMAGES = ["/hero-surfer.png", "/features-ocean-bg.png", "/logo.png"];
const CRITICAL_VIDEOS = ["/problem-illustration.mp4"];
const MIN_LOADING_MS = 2200;
const MAX_LOADING_MS = 4200;

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

      <AnimatePresence>{!isReady && <OceanLoader key="loader" />}</AnimatePresence>
    </>
  );
}
