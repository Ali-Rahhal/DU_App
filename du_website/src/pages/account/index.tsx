import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

import {
  User,
  Lock,
  Users,
  RotateCcw,
  Heart,
  ShoppingBag,
  FileText,
  Receipt,
  Undo2,
  LogOut,
  ChevronRight,
  Building2,
  Hash,
  Phone,
  Mail,
} from "lucide-react";

import { useAccountStore, useAuthStore } from "@/store/zustand";
import { ALL_PERMISSIONS, ROLES } from "@/utils/data";
import Layout from "@/components/Layout/Layout";

interface AccountNavItem {
  key: string;
  href: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
  role?: string;
}

const AccountPage = () => {
  const t = useTranslations();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const {
    hydrated,
    name,
    pharmacy_name,
    code,
    moh_number,
    phone,
    email,
    checkPermission,
    checkRole,
  } = useAccountStore();

  const { logout } = useAuthStore();

  const clientName = name || "Client";

  const initials = clientName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const navItems: AccountNavItem[] = [
    {
      key: "account",
      href: "/account",
      label: t("my_account.title"),
      icon: User,
    },
    {
      key: "change-password",
      href: "/change-password",
      label: t("change_password.title"),
      icon: Lock,
      permission: ALL_PERMISSIONS.ChangePassword,
    },
    {
      key: "users",
      href: "/users",
      label: t("users.title"),
      icon: Users,
      role: ROLES.Admin,
    },
    {
      key: "return-admin",
      href: "/return-admin",
      label: t("return_admin.title"),
      icon: RotateCcw,
      role: ROLES.Admin,
    },
    {
      key: "wishlist",
      href: "/wishlist",
      label: t("wishlist.title"),
      icon: Heart,
    },
    {
      key: "orders",
      href: "/orders",
      label: t("orders.title"),
      icon: ShoppingBag,
    },
    {
      key: "open-invoice",
      href: "/open-invoice",
      label: t("open_invoices.title"),
      icon: FileText,
    },
    {
      key: "sales-invoice",
      href: "/sales-invoice",
      label: t("sales_invoice.title"),
      icon: Receipt,
    },
    {
      key: "returns",
      href: "/returns",
      label: t("returns.title"),
      icon: Undo2,
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.permission && !checkPermission(item.permission)) {
      return false;
    }

    if (item.role && !checkRole(item.role)) {
      return false;
    }

    return true;
  });

  const handleLogout = async () => {
    if (logoutLoading) return;

    try {
      setLogoutLoading(true);
      await logout();
      router.push("/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <Layout>
        <div className="account-page">
          <div className="account-page-container">
            <div className="account-client-card">
              <div className="account-client-avatar account-loading-pulse" />

              <div className="account-client-info">
                <div className="account-loading-name account-loading-pulse" />
                <div className="account-loading-code account-loading-pulse" />
              </div>
            </div>

            <div className="account-navigation-card">
              <div className="account-navigation-loading">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="account-navigation-loading-item account-loading-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="account-page">
        <div className="account-page-container">
          {/* Client Information */}
          <section className="account-client-card">
            <div className="account-client-avatar">{initials || "C"}</div>

            <div className="account-client-info">
              <h1 className="account-client-name">{clientName}</h1>

              {pharmacy_name && (
                <div className="account-client-detail">
                  <Building2 size={15} />
                  <span>{pharmacy_name}</span>
                </div>
              )}
            </div>
          </section>

          {/* Account Details */}
          <section className="account-details-card">
            <div className="account-details-grid">
              {code && (
                <div className="account-detail-item">
                  <div className="account-detail-icon">
                    <Hash size={18} />
                  </div>

                  <div className="account-detail-content">
                    <span className="account-detail-label">
                      {t("account.client_code")}
                    </span>
                    <span className="account-detail-value">{code}</span>
                  </div>
                </div>
              )}

              {moh_number && (
                <div className="account-detail-item">
                  <div className="account-detail-icon">
                    <Hash size={18} />
                  </div>

                  <div className="account-detail-content">
                    <span className="account-detail-label">
                      {t("account.moh_number")}
                    </span>
                    <span className="account-detail-value">{moh_number}</span>
                  </div>
                </div>
              )}

              {phone && (
                <div className="account-detail-item">
                  <div className="account-detail-icon">
                    <Phone size={18} />
                  </div>

                  <div className="account-detail-content">
                    <span className="account-detail-label">
                      {t("account.phone")}
                    </span>
                    <span className="account-detail-value">{phone}</span>
                  </div>
                </div>
              )}

              {email && (
                <div className="account-detail-item">
                  <div className="account-detail-icon">
                    <Mail size={18} />
                  </div>

                  <div className="account-detail-content">
                    <span className="account-detail-label">
                      {t("account.email")}
                    </span>
                    <span className="account-detail-value">{email}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Account Navigation */}
          <section className="account-navigation-card">
            <div className="account-navigation-list">
              {visibleItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="account-navigation-link"
                  >
                    <div className="account-navigation-link-content">
                      <div className="account-navigation-icon">
                        <Icon size={20} />
                      </div>

                      <span className="account-navigation-label">
                        {item.label}
                      </span>
                    </div>

                    <ChevronRight
                      size={18}
                      className="account-navigation-arrow"
                    />
                  </Link>
                );
              })}

              <button
                type="button"
                className="account-navigation-link account-navigation-logout"
                onClick={handleLogout}
                disabled={logoutLoading}
              >
                <div className="account-navigation-link-content">
                  <div className="account-navigation-icon">
                    <LogOut size={20} />
                  </div>

                  <span className="account-navigation-label">
                    {logoutLoading ? "..." : t("navbar.logout")}
                  </span>
                </div>

                <ChevronRight size={18} className="account-navigation-arrow" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
