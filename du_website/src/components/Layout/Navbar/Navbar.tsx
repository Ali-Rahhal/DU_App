import { Button, Dropdown, FormSelect } from "react-bootstrap";
import Navlinks from "./Navlinks";
import SearchBar from "./SearchBar";
import MiniCart from "./MiniCart";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import LoginModal from "./modals/Login";
// import RegisterModal from "./modals/Register";
import ForgotModal from "./modals/Forgot";
import { useAccountStore, useAuthStore } from "@/store/zustand";
import { useTranslations } from "next-intl";

import ChangeLangDropdown from "@/components/common/ChangeLangDropdown";
import FloatingMenu from "../FloatingMenu";
function Navbar() {
  //   const { cart } = useSelector((state) => state.cart);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showModal, setShowModal] = useState("");

  const handleModalClose = (e) => setShowModal(e);
  const handleModalShow = (e) => setShowModal(e);

  // const [cartItemsCount, setCartItemsCount] = useState(0);
  const [subtotal, setSubtotal] = useState<
    {
      currency_code: string;
      price: number;
      discountedPrice: number;
    }[]
  >();
  //   useEffect(() => {
  //     setCartItemsCount(cart.length);
  //     let total = 0;
  //     for (const c of cart) {
  //       total = total + Number(c.quantity) * Number(c.price);
  //     }
  //     setSubtotal(total);
  //     setCartItems(cart);
  //   }, [cart]);
  const { isAuth, logout } = useAuthStore();
  const { cart, cartItems, refreshCart, name, firstName, lastName } =
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

  const t = useTranslations();

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
                  <Image
                    src={"/assets/img/logo_cropped.png"}
                    alt="Logo"
                    height={40}
                    width={250}
                    className="header-logo"
                  />
                </Link>
                <ChangeLangDropdown />
              </div>
              <div className="col">
                <SearchBar showSearch={true} />
              </div>
              <div className="col-auto">
                <ul className="header-right-options">
                  {!isAuth ? (
                    <>
                      {" "}
                      <li className="link-item">
                        <Link href="#" onClick={() => handleModalShow("login")}>
                          {t("login")}
                        </Link>
                      </li>
                      {/* <li className="link-item">
                        <Link
                          href="#"
                          onClick={() => handleModalShow("register")}
                        >
                          Register
                        </Link>
                      </li> */}
                    </>
                  ) : (
                    <>
                      {/* <li className="link-item">
                        <Link href="/account">Account</Link>
                      </li> */}
                      <li className="link-item">
                        <Link
                          href="#"
                          onClick={() => {
                            logout().then(() => {
                              window.location.reload();
                            });
                          }}
                        >
                          {t("logout")}
                        </Link>
                      </li>
                    </>
                  )}
                  <li className="dropdown head-cart-content">
                    {isAuth ? (
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
                    ) : (
                      <div>
                        <Link
                          href="#"
                          onClick={() => handleModalShow("login")}
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "flex-end",
                          }}
                        >
                          <i
                            className="ti-bag"
                            style={{
                              fontSize: "20px",
                            }}
                          ></i>
                        </Link>
                      </div>
                    )}
                    {/* <Dropdown>
                      <Dropdown.Toggle
                        variant="link"
                        id="cart-menu-dropdown"
                        {...(!isAuth
                          ? {
                              onClick: () => {
                                if (!isAuth) {
                                  handleModalShow("login");
                                }
                              },
                            }
                          : {})}
                      >
                        <div className="list-icon">
                          <i className="ti-bag"></i>
                        </div>
                        <span className="badge badge-secondary">{cart}</span>
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="shopping-cart shopping-cart-empty dropdown-menu dropdown-menu-right">
                        {isAuth ? (
                          <MiniCart subtotal={subtotal} cartItems={cartItems} />
                        ) : (
                          ""
                        )}
                      </Dropdown.Menu>
                    </Dropdown> */}
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
                                handleModalShow("login");
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
                          {/* <li>
                            <Link href="/change-password">Change Password</Link>
                          </li> */}
                          <li>
                            <Link href="/promotions">{t("promotion")}</Link>
                          </li>
                          <li>
                            <Link href="/orders">{t("my_orders")}</Link>
                          </li>
                          <li>
                            <Link href="/wishlist">{t("wishlist")}</Link>
                          </li>{" "}
                          <li>
                            <Link href="/survey">{t("survey")}</Link>
                          </li>
                          <li>
                            <Link href="/complaint">{t("complaint")}</Link>
                          </li>
                          {/* <li>
                            <Link href="/survey">Survey</Link>
                          </li> */}
                          <li>
                            <Link
                              href="#"
                              onClick={() => {
                                logout().then(() => {
                                  window.location.reload();
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
                  {/* <li>
                    <Link
                      href="upload-prescription"
                      className="btn btn-primary btn-sm"
                    >
                      Upload
                    </Link>
                  </li> */}
                </ul>
              </div>
            </div>
          </div>
          <Navlinks />
        </div>
      </div>

      <div className="mobile-header">
        <div className="container-fluid theme-container">
          <div className="row align-items-center">
            <div className="col-auto">
              <ul className="header-left-options">
                <li
                  className="link-item open-sidebar"
                  onClick={() => setShowMobileMenu(true)}
                >
                  <i className="ti-menu"></i>
                </li>
              </ul>
            </div>
            <div className="col text-center">
              <Link href="/">
                <Image
                  src={"/assets/img/logo.png"}
                  alt="Logo"
                  height={40}
                  width={250}
                  className="header-logo"
                />
              </Link>
            </div>
            <div className="col-auto">
              <ul className="header-right-options">
                <Link href={"/cart"} className="link-item">
                  <span className="badge badge-secondary">{cart}</span>
                  <i className="ti-bag"></i>
                </Link>
              </ul>
            </div>
          </div>
          <div
            className={showMobileMenu ? "menu-sidebar show" : "menu-sidebar"}
          >
            <div className="close" onClick={() => setShowMobileMenu(false)}>
              <i className="ti-close"></i>
            </div>

            {isAuth && (
              <div className="welcome d-flex align-items-center">
                <div
                  className="avater btn-soft-primary"
                  style={{
                    textTransform: "uppercase",
                  }}
                >{`${(firstName ? firstName[0] : "") +
                  (lastName ? lastName[0] : "")
                  }`}</div>
                <span>Hi, {name}</span>
              </div>
            )}

            <div className="col mt-3">
              <SearchBar showSearch={false} text={"search_products"} />
            </div>
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
                    <Link href="/promotions">{t("promotions")}</Link>
                  </li>
                  <li>
                    <Link href="/orders">{t("my_orders")}</Link>
                  </li>
                  <li>
                    <Link href="/promotions">{t("promotion")}</Link>
                  </li>
                  <li>
                    <Link href="/wishlist">{t("wishlist")}</Link>
                  </li>
                  {/* <li>
                    <Link href="/survey">Survey</Link>
                  </li> */}
                  <li>
                    <Link href="/complaint">{t("complaint")}</Link>
                  </li>
                </ul>
              </div>
            )}
            {/* <div className="mobileMenuLinks">
              <h6>Category</h6>
              <ul>
                <li>
                  <Link href="/category?cat=P">Pharma</Link>
                </li>
                <li>
                  <Link href="/category?cat=PP">ParaPharma</Link>
                </li>
                <li>
                  <Link href="/category?cat=NP">Non Pharma</Link>
                </li>
              </ul>
            </div> */}
            <div
              style={{
                padding: "1rem 1rem 0rem 1rem",
              }}
            >
              <ChangeLangDropdown />
            </div>
            <div
              className="d-flex align-items-center"
              style={{
                padding: "1rem 1rem 1rem 1rem",
              }}
            >
              {!isAuth ? (
                <>
                  <Link
                    href="#"
                    onClick={() => handleModalShow("login")}
                    className="btn btn-soft-primary btn-md mr-2"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="#"
                    onClick={() => handleModalShow("register")}
                    className="btn btn-primary btn-md"
                  >
                    {t("register")}
                  </Link>
                </>
              ) : (
                <Button
                  variant="link"
                  style={{
                    width: "100%",
                  }}
                  onClick={() => {
                    logout().then(() => {
                      window.location.reload();
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
          onClick={() => setShowMobileMenu(false)}
        ></div>
      </div>
      <LoginModal
        show={showModal === "login"}
        handleClose={handleModalClose}
        handleModalShow={handleModalShow}
      />
      {/* <RegisterModal
        show={showModal === "register"}
        handleClose={handleModalClose}
        handleModalShow={handleModalShow}
      /> */}
      <ForgotModal
        show={showModal === "forgot"}
        handleClose={handleModalClose}
        handleModalShow={handleModalShow}
      />
      {isAuth && <FloatingMenu />}
    </>
  );
}

export default Navbar;
