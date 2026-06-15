import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAccountStore } from "@/store/zustand";
import { ROLES } from "@/utils/data";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { checkRole, hydrated } = useAccountStore();

  const isAdmin = checkRole(ROLES.Admin);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAdmin && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.error("Only Admins can access this page");
      router.push("/");
    }
  }, [isAdmin, hydrated]);

  if (!hydrated) return null;

  if (!isAdmin) return null;

  return <>{children}</>;
};

export default AdminGuard;
