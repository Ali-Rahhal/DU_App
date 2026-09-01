"use client";

import { Download } from "lucide-react";
import { usePWAInstallStore } from "@/store/zustand";
import { useTranslations } from "next-intl";

export default function InstallPWAButton({
  className,
  showIcon = false,
}: {
  className?: string;
  showIcon?: boolean;
}) {
  const t = useTranslations();
  const { deferredPrompt, isInstalled, setDeferredPrompt } =
    usePWAInstallStore();

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("❌ Install prompt is not available");
      return;
    }

    try {
      await deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      console.log(`PWA install result: ${outcome}`);

      setDeferredPrompt(null);
    } catch (error) {
      console.error("❌ Failed to show PWA install prompt:", error);

      setDeferredPrompt(null);
    }
  };

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className={className}
      title="Install App"
    >
      {showIcon && <Download size={18} />}
      {!showIcon && t("pwa_install")}
    </button>
  );
}
