import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAccountStore } from "@/store/zustand";

type Props = {
  permission: string;
  children: React.ReactNode;
  redirectTo?: string;
  showToast?: boolean;
  toastMessage?: string;
};

const PermissionGuard = ({
  permission,
  children,
  redirectTo = "/",
  showToast = true,
  toastMessage = "You do not have permission to access this page",
}: Props) => {
  const router = useRouter();

  const { checkPermission, hydrated } = useAccountStore();

  const hasRedirected = useRef(false);

  const hasPermission = checkPermission(permission);

  useEffect(() => {
    if (!hydrated) return;

    if (!hasPermission && !hasRedirected.current) {
      hasRedirected.current = true;

      if (showToast) {
        toast.error(toastMessage);
      }

      router.push(redirectTo);
    }
  }, [hydrated, hasPermission, router]);

  // 🚨 IMPORTANT: prevent render before hydration
  if (!hydrated) return null;

  if (!hasPermission) return null;

  return <>{children}</>;
};

export default PermissionGuard;
