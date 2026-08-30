"use client";

import { useEffect } from "react";
import { usePWAInstallStore } from "@/store/zustand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function PWAProvider() {
  const setDeferredPrompt = usePWAInstallStore(
    (state) => state.setDeferredPrompt,
  );

  const setIsInstalled = usePWAInstallStore((state) => state.setIsInstalled);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", handleAppInstalled);

    const standaloneMediaQuery = window.matchMedia(
      "(display-mode: standalone)",
    );

    const checkStandalone = () => {
      const iosStandalone =
        (
          window.navigator as Navigator & {
            standalone?: boolean;
          }
        ).standalone === true;

      setIsInstalled(standaloneMediaQuery.matches || iosStandalone);
    };

    checkStandalone();

    standaloneMediaQuery.addEventListener("change", checkStandalone);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener("appinstalled", handleAppInstalled);

      standaloneMediaQuery.removeEventListener("change", checkStandalone);
    };
  }, [setDeferredPrompt, setIsInstalled]);

  return null;
}
