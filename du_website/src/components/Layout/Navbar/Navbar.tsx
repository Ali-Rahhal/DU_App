import { Button, Dropdown } from "react-bootstrap";
import SearchBar from "./SearchBar";
import MiniCart from "./MiniCart";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useAccountStore, useAuthStore } from "@/store/zustand";
import { useTranslations } from "next-intl";

import ChangeLangDropdown from "@/components/common/ChangeLangDropdown";
import FloatingMenu from "../FloatingMenu";
import { ROLES } from "@/utils/data";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import InstallPWAButton from "@/components/common/InstalPWAButton";
import { useRouter } from "next/router";
function Navbar() {
  const router = useRouter();
  const t = useTranslations();
  const { companyHydrated, companyName, companyLogo } = useCompanyAssets();

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [subtotal, setSubtotal] = useState<
    {
      currency_code: string;
      price: number;
      discountedPrice: number;
    }[]
  >();
  const { isAuth, logout } = useAuthStore();
  const { cart, cartItems, refreshCart, name, firstName, lastName, checkRole } =
    useAccountStore();

  useEffect(() => {
    if (!cart) return;
    const currency_codes: string[] = [
      ...new Set(cartItems.map((item) => item.currency_code)),
    ] as string[];
    const tempSubtotal: {
      currency_code: string;
      price: number;
      discountedPrice: number;
    }[] = [];
    //get total for each currency
    for (const currency_code of currency_codes) {
      const total = cartItems
        .filter((item) => item.currency_code === currency_code)
        .reduce((acc, item) => {
          return (
            acc +
            Number(item.quantity) *
              Number(item.discountedPrice ? item.discountedPrice : item.price)
          );
        }, 0);
      tempSubtotal.push({
        currency_code: currency_code,
        price: total,
        discountedPrice: 0,
      });
    }
    setSubtotal(tempSubtotal);
  }, [cartItems]);

  useEffect(() => {
    refreshCart();
  }, []);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileMenu]);

  const AIMagicButton = ({ isMobile = false }) => {
    return (
      <Link href="/ai-order-proposal" className="ai-magic-btn">
        {!isMobile && <span className="ai-magic-btn__icon">🤖</span>}
        <span className="ai-magic-btn__text">AI</span>
      </Link>
    );
  };

  return (
    <>
      <div className="header">
        <div className="container-fluid theme-container">
          <div className="top-header">
            <div className="row align-items-center">
              <div
                className="col-auto"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "2rem",
                }}
              >
                <Link href="/">
                  {(companyHydrated && (
                    <Image
                      src={companyLogo}
                      alt={companyName}
                      height={40}
                      width={250}
                      className="header-logo"
                    />
                  )) || (
                    <Spinner
                      animation="border"
                      style={{
                        width: "40px",
                        height: "40px",
                      }}
                    />
                  )}
                </Link>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <ChangeLangDropdown />
                  <InstallPWAButton className="pwa-button" />
                </div>
              </div>
              <div className="col px-4">
                <SearchBar showSearch />
              </div>
              <div className="col-auto ms-auto">
                <ul className="header-right-options">
                  {isAuth && (
                    <li className="link-item">
                      <Link
                        href="/"
                        onClick={() => {
                          logout().then(() => {
                            window.location.href = "/login";
                          });
                        }}
                      >
                        {t("logout")}
                      </Link>
                    </li>
                  )}

                  {isAuth && (
                    <li style={{ display: "flex", alignItems: "center" }}>
                      <AIMagicButton />
                    </li>
                  )}

                  <li className="dropdown head-cart-content">
                    {isAuth && (
                      <Dropdown>
                        <Dropdown.Toggle variant="link" id="cart-menu-dropdown">
                          <div className="list-icon">
                            <i className="ti-bag"></i>
                          </div>
                          <span className="badge badge-secondary">{cart}</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="shopping-cart shopping-cart-empty dropdown-menu dropdown-menu-right">
                          {isAuth ? (
                            <MiniCart
                              subtotal={subtotal}
                              cartItems={cartItems}
                            />
                          ) : (
                            ""
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </li>
                  <li>
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="link"
                        id="user-menu-dropdown"
                        {...(!isAuth
                          ? {
                              onClick: () => {
                                if (!isAuth) {
                                  router.push("/login");
                                }
                              },
                            }
                          : {})}
                      >
                        <div className="list-icon">
                          <i className="ti-user"></i>
                        </div>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="user-links">
                        <ul>
                          <li>
                            <Link href="/dashboard">{t("dashboard")}</Link>
                          </li>
                          <li>
                            <Link href="/account">{t("account")}</Link>
                          </li>
                          <li>
                            <Link href="/cart">{t("cart")}</Link>
                          </li>
                          <li>
                            <Link href="/promotions">{t("promotion")}</Link>
                          </li>
                          <li>
                            <Link href="/survey">{t("survey")}</Link>
                          </li>
                          <li>
                            <Link href="/complaint">{t("complaint")}</Link>
                          </li>
                          {checkRole(ROLES.Admin) ? (
                            <>
                              <li>
                                <Link href="/item-alternatives">
                                  {t("item_alternatives.title")}
                                </Link>
                              </li>
                              <li>
                                <Link href="/expiry-deal">
                                  {t("expiry_deal.title")}
                                </Link>
                              </li>
                            </>
                          ) : null}
                          <li>
                            <Link href="/restock">{t("restock.title")}</Link>
                          </li>
                          <li>
                            <Link href="/fidelity">{t("fidelity.link")}</Link>
                          </li>
                          <li>
                            <Link href="/ai-order-proposal">
                              {t("ai_proposal.title")}
                            </Link>
                          </li>
                          <li>
                            <Link href="/collection">{"Collection"}</Link>
                          </li>
                          <li>
                            <Link
                              href="/"
                              onClick={() => {
                                logout().then(() => {
                                  window.location.href = "/login";
                                });
                              }}
                            >
                              {t("logout")}
                            </Link>
                          </li>
                        </ul>
                      </Dropdown.Menu>
                    </Dropdown>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-header">
        <div className="container-fluid theme-container">
          <div className="mobile-header-content">
            <div className="mobile-header-top">
              <div className="col-auto">
                <ul className="header-left-options">
                  <li
                    className="link-item open-sidebar"
                    onClick={() => {
                      setShowMobileMenu(true);
                    }}
                  >
                    <i className="ti-menu"></i>
                  </li>
                </ul>
              </div>

              <div className="mobile-logo">
                <Link href="/">
                  {(companyHydrated && (
                    <Image
                      src={companyLogo}
                      alt={companyName}
                      height={40}
                      width={250}
                      className="header-logo"
                    />
                  )) || (
                    <Spinner
                      animation="border"
                      style={{
                        width: "40px",
                        height: "40px",
                      }}
                    />
                  )}
                </Link>
              </div>

              <div className="mobile-actions">
                <ul className="header-right-options">
                  {isAuth && <AIMagicButton isMobile />}

                  {isAuth ? (
                    <Link href={"/cart"} className="link-item">
                      <span className="badge badge-secondary">{cart}</span>
                      <i className="ti-bag"></i>
                    </Link>
                  ) : (
                    <Link
                      className="link-item"
                      href="#"
                      onClick={() => router.push("/login")}
                    >
                      <i className="ti-bag"></i>
                    </Link>
                  )}
                </ul>
              </div>
            </div>

            <div className="mobile-search-bar">
              <SearchBar showSearch={false} text={"search_products"} />
            </div>
          </div>
          <div
            className={showMobileMenu ? "menu-sidebar show" : "menu-sidebar"}
          >
            <div
              className="close"
              onClick={() => {
                setShowMobileMenu(false);
              }}
            >
              <i className="ti-close"></i>
            </div>

            {isAuth && (
              <div className="welcome d-flex align-items-center">
                <div
                  className="avater btn-soft-primary"
                  style={{
                    textTransform: "uppercase",
                  }}
                >{`${
                  (firstName ? firstName[0] : "") +
                  (lastName ? lastName[0] : "")
                }`}</div>
                <span>Hi, {name}</span>
              </div>
            )}

            {isAuth && (
              <div className="mobileMenuLinks mb-2 mt-2">
                <ul>
                  <li>
                    <Link href="/dashboard">{t("dashboard")}</Link>
                  </li>
                  <li>
                    <Link href="/account">{t("account")}</Link>
                  </li>
                  <li>
                    <Link href="/cart">{t("cart")}</Link>
                  </li>
                  <li>
                    <Link href="/promotions">{t("promotion")}</Link>
                  </li>
                  <li>
                    <Link href="/survey">{t("survey")}</Link>
                  </li>
                  <li>
                    <Link href="/complaint">{t("complaint")}</Link>
                  </li>
                  {checkRole(ROLES.Admin) ? (
                    <>
                      <li>
                        <Link href="/item-alternatives">
                          {t("item_alternatives.title")}
                        </Link>
                      </li>
                      <li>
                        <Link href="/expiry-deal">
                          {t("expiry_deal.title")}
                        </Link>
                      </li>
                    </>
                  ) : null}
                  <li>
                    <Link href="/restock">{t("restock.title")}</Link>
                  </li>
                  <li>
                    <Link href="/fidelity">{t("fidelity.link")}</Link>
                  </li>
                  <li>
                    <Link href="/ai-order-proposal">
                      {t("ai_proposal.title")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/collection">{"Collection"}</Link>
                  </li>
                </ul>
              </div>
            )}
            <div className="mobile-language-pwa">
              <ChangeLangDropdown />
              <InstallPWAButton className="pwa-button" />
            </div>
            <div
              className="d-flex align-items-center"
              style={{
                padding: "1rem 1rem 1rem 1rem",
              }}
            >
              {isAuth && (
                <Button
                  variant="outline-danger"
                  className="w-100 py-2 fw-medium rounded-2"
                  onClick={() => {
                    logout().then(() => {
                      window.location.href = "/login";
                    });
                  }}
                >
                  {t("logout")}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div
          className={showMobileMenu ? "overlay show" : "overlay"}
          onClick={() => {
            setShowMobileMenu(false);
          }}
        ></div>
      </div>
      {isAuth && <FloatingMenu />}
    </>
  );
}

export default Navbar;
