"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Spinner } from "react-bootstrap";
import {
  Home,
  Package,
  ShoppingCart,
  ShoppingBasket,
  Menu,
  X,
  User,
  Languages,
  Download,
  LayoutDashboard,
  UserCircle,
  Megaphone,
  ClipboardList,
  MessageSquareWarning,
  RefreshCcw,
  Heart,
  Sparkles,
  Receipt,
  LogOut,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

import SearchBar from "./SearchBar";
import MiniCart from "./MiniCart";

import ChangeLangDropdown from "@/components/common/ChangeLangDropdown";
import InstallPWAButton from "@/components/common/InstalPWAButton";

import { useAccountStore, useAuthStore } from "@/store/zustand";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";

import { ROLES } from "@/utils/data";

interface NavbarProps {
  showMobileNavbar?: boolean;
  showBottomNavbar?: boolean;
}

function Navbar({
  showMobileNavbar = true,
  showBottomNavbar = true,
}: NavbarProps) {
  const router = useRouter();
  const t = useTranslations();

  const { companyHydrated, companyName, companyLogo } = useCompanyAssets();

  const {
    cart,
    cartItems,
    refreshCart,
    pharmacy_name,
    name,
    firstName,
    lastName,
    checkRole,
  } = useAccountStore();

  const { isAuth, logout } = useAuthStore();

  const [showSidebar, setShowSidebar] = useState(false);

  const [subtotal, setSubtotal] = useState<
    {
      currency_code: string;
      price: number;
      discountedPrice: number;
    }[]
  >([]);

  /*
   * Calculate cart subtotal by currency.
   */
  useEffect(() => {
    if (!cart) {
      setSubtotal([]);
      return;
    }

    const currencyCodes = [
      ...new Set(cartItems.map((item) => item.currency_code)),
    ];

    const tempSubtotal = currencyCodes.map((currency_code) => {
      const total = cartItems
        .filter((item) => item.currency_code === currency_code)
        .reduce((acc, item) => {
          return (
            acc +
            Number(item.quantity) *
              Number(item.discountedPrice ? item.discountedPrice : item.price)
          );
        }, 0);

      return {
        currency_code,
        price: total,
        discountedPrice: 0,
      };
    });

    setSubtotal(tempSubtotal);
  }, [cart, cartItems]);

  useEffect(() => {
    refreshCart();
  }, []);

  /*
   * Prevent the page from scrolling while the sidebar is open.
   */
  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showSidebar]);

  const initials = useMemo(() => {
    return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase();
  }, [firstName, lastName]);

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const handleLogout = async () => {
    closeSidebar();

    await logout();

    window.location.href = "/login";
  };

  const AIMagicButton = ({ isMobile = false }: { isMobile?: boolean }) => {
    return (
      <Link
        href="/ai-order-proposal"
        className={`ai-magic-btn ${isMobile ? "ai-magic-btn-mobile" : ""}`}
      >
        <Sparkles size={isMobile ? 19 : 18} />

        {!isMobile && (
          <span className="ai-magic-btn__text">{t("navbar.ai")}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP NAVBAR                                            */}
      {/* ========================================================= */}

      <header className="desktop-navbar">
        <div className="desktop-navbar-inner">
          {/* Left */}
          <div className="desktop-navbar-left">
            <button
              type="button"
              className="navbar-icon-button"
              onClick={() => setShowSidebar(true)}
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <Link href="/" className="navbar-logo-container">
              {companyHydrated ? (
                <Image
                  src={companyLogo}
                  alt={companyName}
                  width={220}
                  height={42}
                  className="navbar-logo"
                />
              ) : (
                <Spinner
                  animation="border"
                  style={{
                    width: "30px",
                    height: "30px",
                  }}
                />
              )}
            </Link>
          </div>

          {/* Center */}
          <div className="desktop-navbar-search">
            <SearchBar showSearch />
          </div>

          {/* Right */}
          <div className="desktop-navbar-right">
            {isAuth && (
              <>
                <Link href="/" className="desktop-navbar-nav-button">
                  <Home size={19} />
                  <span>{t("navbar.home")}</span>
                </Link>

                <Link href="/category" className="desktop-navbar-nav-button">
                  <Package size={19} />
                  <span>{t("navbar.products")}</span>
                </Link>

                <Link href="/orders" className="desktop-navbar-nav-button">
                  <ShoppingBasket size={19} />
                  <span>{t("navbar.orders")}</span>
                </Link>
              </>
            )}

            {isAuth && <AIMagicButton />}

            {isAuth && (
              <Dropdown>
                <Dropdown.Toggle
                  variant="link"
                  id="desktop-cart-dropdown"
                  className="cart-navbar-button"
                >
                  <ShoppingCart size={22} />

                  <span className="cart-badge">{cart}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shopping-cart shopping-cart-empty dropdown-menu-right">
                  <MiniCart subtotal={subtotal} cartItems={cartItems} />
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </div>
      </header>
      {showMobileNavbar ? (
        <>
          {/* ========================================================= */}
          {/* MOBILE NAVBAR                                             */}
          {/* ========================================================= */}

          <header className="mobile-navbar">
            {/* Row 1 - Logo */}
            <div className="mobile-navbar-logo-row">
              <Link href="/" className="mobile-navbar-logo-container">
                {companyHydrated ? (
                  <Image
                    src={companyLogo}
                    alt={companyName}
                    width={210}
                    height={42}
                    className="mobile-navbar-logo"
                  />
                ) : (
                  <Spinner
                    animation="border"
                    style={{
                      width: "30px",
                      height: "30px",
                    }}
                  />
                )}
              </Link>
            </div>

            {/* Row 2 - Profile + pharmacy + actions */}
            <div className="mobile-navbar-profile-row">
              <Link
                href={isAuth ? "/account" : "/login"}
                className="mobile-profile"
              >
                <div className="mobile-profile-avatar">
                  {isAuth && initials ? initials : <User size={20} />}
                </div>

                <div className="mobile-profile-info">
                  <span className="mobile-profile-greeting">
                    {isAuth ? t("navbar.hi") : ""}
                  </span>

                  <span className="mobile-profile-name">
                    {isAuth
                      ? pharmacy_name || name || t("navbar.account")
                      : t("navbar.login")}
                  </span>
                </div>
              </Link>

              <div className="mobile-navbar-actions">
                {isAuth && <AIMagicButton isMobile />}

                <Link
                  href={isAuth ? "/cart" : "/login"}
                  className="mobile-action-button"
                >
                  <ShoppingCart size={20} />

                  {isAuth && <span className="mobile-cart-badge">{cart}</span>}
                </Link>
              </div>
            </div>

            {/* Row 3 - Search */}
            <div className="mobile-navbar-search">
              <SearchBar showSearch={false} text="search_products" />
            </div>
          </header>
        </>
      ) : (
        /* ========================================================= */
        /* MOBILE BACK HEADER                                        */
        /* ========================================================= */

        <header className="mobile-back-navbar">
          <button
            type="button"
            className="mobile-back-button"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft size={22} />

            <span>{t("navbar.back")}</span>
          </button>

          <Link href="/" className="mobile-back-logo-container">
            {companyHydrated ? (
              <Image
                src={companyLogo}
                alt={companyName}
                width={170}
                height={36}
                className="mobile-back-logo"
              />
            ) : (
              <Spinner
                animation="border"
                style={{
                  width: "26px",
                  height: "26px",
                }}
              />
            )}
          </Link>
        </header>
      )}

      {/* ========================================================= */}
      {/* SHARED SIDEBAR                                           */}
      {/* ========================================================= */}

      <aside className={`app-sidebar ${showSidebar ? "app-sidebar-open" : ""}`}>
        <div className="app-sidebar-header">
          <Link
            href="/"
            className="sidebar-logo-container"
            onClick={closeSidebar}
          >
            {companyHydrated ? (
              <Image
                src={companyLogo}
                alt={companyName}
                width={190}
                height={38}
                className="sidebar-logo"
              />
            ) : (
              <Spinner
                animation="border"
                style={{
                  width: "30px",
                  height: "30px",
                }}
              />
            )}
          </Link>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {isAuth && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {initials || <User size={20} />}
            </div>

            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{pharmacy_name || name}</span>

              <span className="sidebar-user-account">
                {t("navbar.account")}
              </span>
            </div>
          </div>
        )}

        <nav className="sidebar-navigation">
          {isAuth && (
            <>
              <SidebarLink
                href="/dashboard"
                icon={<LayoutDashboard size={19} />}
                label={t("navbar.dashboard")}
                onClick={closeSidebar}
              />

              <SidebarLink
                href="/account"
                icon={<UserCircle size={19} />}
                label={t("navbar.account")}
                onClick={closeSidebar}
              />

              <SidebarLink
                href="/cart"
                icon={<ShoppingCart size={19} />}
                label={t("navbar.cart")}
                onClick={closeSidebar}
              />

              <SidebarLink
                href="/promotions"
                icon={<Megaphone size={19} />}
                label={t("navbar.promotion")}
                onClick={closeSidebar}
              />

              <SidebarLink
                href="/survey"
                icon={<ClipboardList size={19} />}
                label={t("navbar.survey")}
                onClick={closeSidebar}
              />

              <SidebarLink
                href="/complaint"
                icon={<MessageSquareWarning size={19} />}
                label={t("complaint_page.title")}
                onClick={closeSidebar}
              />

              {checkRole(ROLES.Admin) && (
                <>
                  <SidebarLink
                    href="/item-alternatives"
                    icon={<Package size={19} />}
                    label={t("item_alternatives.title")}
                    onClick={closeSidebar}
                  />

                  <SidebarLink
                    href="/expiry-deal"
                    icon={<Receipt size={19} />}
                    label={t("expiry_deal.title")}
                    onClick={closeSidebar}
                  />
                </>
              )}

              <SidebarLink
                href="/restock"
                icon={<RefreshCcw size={19} />}
                label={t("restock.title")}
                onClick={closeSidebar}
              />

              <SidebarLink
                href="/fidelity"
                icon={<Heart size={19} />}
                label={t("fidelity.link")}
                onClick={closeSidebar}
              />

              <SidebarLink
                href="/ai-order-proposal"
                icon={<Sparkles size={19} />}
                label={t("ai_proposal.title")}
                onClick={closeSidebar}
              />

              <SidebarLink
                href="/collection"
                icon={<Receipt size={19} />}
                label="Collection"
                onClick={closeSidebar}
              />
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-settings-row">
            <Languages size={18} />
            <ChangeLangDropdown />
          </div>

          <div className="sidebar-settings-row">
            <Download size={18} />
            <InstallPWAButton className="pwa-button" />
          </div>

          {isAuth && (
            <div className="sidebar-settings-row">
              <LogOut size={18} />
              <Button
                variant="outline-danger"
                className="sidebar-logout-button"
                onClick={handleLogout}
              >
                <span>{t("navbar.logout")}</span>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Sidebar overlay */}
      <div
        className={`app-sidebar-overlay ${
          showSidebar ? "app-sidebar-overlay-visible" : ""
        }`}
        onClick={closeSidebar}
      />

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION                                  */}
      {/* ========================================================= */}

      {showBottomNavbar && (
        <nav className="mobile-bottom-navbar">
          <Link href="/" className="mobile-bottom-nav-item">
            <Home size={21} />
            <span>{t("navbar.home")}</span>
          </Link>

          <Link href="/category" className="mobile-bottom-nav-item">
            <Package size={21} />
            <span>{t("navbar.products")}</span>
          </Link>

          <Link href="/orders" className="mobile-bottom-nav-item">
            <ShoppingBasket size={21} />
            <span>{t("navbar.orders")}</span>
          </Link>

          <button
            type="button"
            className="mobile-bottom-nav-item"
            onClick={() => setShowSidebar(true)}
          >
            <Menu size={21} />
            <span>{t("navbar.menu")}</span>
          </button>
        </nav>
      )}
    </>
  );
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function SidebarLink({ href, icon, label, onClick }: SidebarLinkProps) {
  return (
    <Link href={href} className="sidebar-link" onClick={onClick}>
      <span className="sidebar-link-icon">{icon}</span>

      <span className="sidebar-link-label">{label}</span>

      <ChevronRight size={16} className="sidebar-link-arrow" />
    </Link>
  );
}

export default Navbar;
