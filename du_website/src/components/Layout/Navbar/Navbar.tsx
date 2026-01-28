import { Button, Dropdown } from "react-bootstrap";
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
function Navbar() {
  //   const { cart } = useSelector((state) => state.cart);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showModal, setShowModal] = useState("");

  const handleModalClose = (e) => setShowModal(e);
  const handleModalShow = (e) => setShowModal(e);

  // const [cartItemsCount, setCartItemsCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

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
    let total = 0;
    for (const c of cartItems) {
      total =
        total +
        Number(c.quantity) *
          Number(c.discountedPrice ? c.discountedPrice : c.price);
    }
    setSubtotal(total);
  }, [cart, cartItems]);
  useEffect(() => {
    refreshCart();
  }, []);
  return (
    <>
      <div className="header">
        <div className="container-fluid theme-container">
          <div className="top-header">
            <div className="row align-items-center">
              <div className="col-auto">
                <Link href="/">
                  <Image
                    src={"/assets/img/logo_cropped.png"}
                    alt="Logo"
                    height={40}
                    width={250}
                    className="header-logo"
                  />
                </Link>
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
                          Login
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
                          Logout
                        </Link>
                      </li>
                    </>
                  )}
                  <li className="dropdown head-cart-content">
                    <Dropdown>
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
                    </Dropdown>
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
                            <Link href="/dashboard">Dashboard</Link>
                          </li>
                          <li>
                            <Link href="/account">Account</Link>
                          </li>
                          <li>
                            <Link href="/cart">Cart</Link>
                          </li>
                          {/* <li>
                            <Link href="/change-password">Change Password</Link>
                          </li> */}

                          <li>
                            <Link href="/orders">My Orders</Link>
                          </li>

                          <li>
                            <Link href="/wishlist">Wish List</Link>
                          </li>
                          <li>
                            <Link href="/survey">Survey</Link>
                          </li>
                          <li>
                            <Link href="/complaint">Complaint</Link>
                          </li>
                          <li>
                            <Link href="#">Logout</Link>
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
                >{`${
                  (firstName ? firstName[0] : "") +
                  (lastName ? lastName[0] : "")
                }`}</div>
                <span>Hi, {name}</span>
              </div>
            )}

            <div className="col mt-3">
              <SearchBar showSearch={false} text="Search For Products" />
            </div>
            {isAuth && (
              <div className="mobileMenuLinks mb-4 mt-2">
                <h6>Account Info</h6>
                <ul>
                  <li>
                    <Link href="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link href="/account">Account</Link>
                  </li>
                  <li>
                    <Link href="/cart">Cart</Link>
                  </li>
                  <li>
                    <Link href="/orders">My Orders</Link>
                  </li>
                  <li>
                    <Link href="/wishlist">Wish List</Link>
                  </li>
                  <li>
                    <Link href="/survey">Survey</Link>
                  </li>
                  <li>
                    <Link href="/complaint">Complaint</Link>
                  </li>
                </ul>
              </div>
            )}
            <div className="mobileMenuLinks">
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
            </div>
            <div className="welcome d-flex align-items-center">
              {!isAuth ? (
                <>
                  <Link
                    href="#"
                    onClick={() => handleModalShow("login")}
                    className="btn btn-soft-primary btn-md"
                  >
                    Login
                  </Link>
                  <Link
                    href="#"
                    onClick={() => handleModalShow("register")}
                    className="btn btn-primary btn-md"
                  >
                    Register
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
                  Logout
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
    </>
  );
}

export default Navbar;
