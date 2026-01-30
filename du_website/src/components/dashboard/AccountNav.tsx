import { useAccountStore, useAuthStore } from "@/store/zustand";
import { ALL_PERMISSIONS } from "@/utils/data";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

function AccountNav() {
  const [showMenu, setShowMenu] = useState(false);
  const { firstName, lastName, name, code, type, checkPermission } =
    useAccountStore();
  const rt = useRouter();
  const [active, setActive] = useState(rt.pathname.split("settings./")[1]);
  // useEffect(() => {
  //   console.log(rt.pathname.split("settings./"));
  //   setActive(rt.pathname.split("settings./")[1]);
  // }, [rt.pathname]);
  const t = useTranslations();
  const { isAuth, logout } = useAuthStore();
  return (
    <>
      <nav className="navbar navbar-expand-md mb-4 mb-lg-0 sidenav">
        <a
          className="d-xl-none d-lg-none d-md-none text-inherit fw-bold"
          href="#"
        ></a>

        <button
          className="navbar-toggler d-md-none rounded bg-primary text-light"
          type="button"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="ti-menu"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${showMenu ? "show" : ""}`}
          id="sidenav"
        >
          <div className="navbar-nav flex-column">
            <div className="border-bottom">
              <div className="m-4">
                <div className="row no-gutters align-items-center">
                  <div className="col-auto">
                    <div
                      className="avater btn-soft-primary"
                      style={{
                        textTransform: "uppercase",
                      }}
                    >{`${
                      (firstName ? firstName[0] : "") +
                      (lastName ? lastName[0] : "")
                    }`}</div>
                  </div>
                  <div className="col-auto">
                    <h6 className="d-block font-weight-bold mb-0">{name}</h6>
                    <small className="text-muted">{code}</small>
                  </div>
                </div>
              </div>
            </div>
            <ul className="list-unstyled mb-0">
              <li
                className={"nav-item" + (active === "account" ? " active" : "")}
              >
                <Link className="nav-link" href="account">
                  <i className="fa fa-user"></i>
                  {/* My Account */}
                  {t("my_account")}
                </Link>
              </li>
              {type !== 2 ? (
                <li
                  className={
                    "nav-item " +
                    (active === "change-password" ? " active" : "")
                  }
                >
                  <Link className="nav-link" href="change-password">
                    <i className="fa fa-lock"></i>
                    {t("change_password")}
                  </Link>
                </li>
              ) : null}

              <li
                className={
                  "nav-item " + (active === "wishlist" ? " active" : "")
                }
              >
                <Link className="nav-link" href="wishlist">
                  <i className="fa fa-heart"></i>
                  {/* Wishlist */}
                  {t("wishlist")}
                </Link>
              </li>
              <li
                className={"nav-item " + (active === "orders" ? " active" : "")}
              >
                <Link className="nav-link" href="orders">
                  <i className="fa fa-shopping-cart"></i>
                  {/* Order */}
                  {t("order")}
                </Link>
              </li>
              <li
                className={
                  "nav-item " + (active === "open-invoice" ? " active" : "")
                }
              >
                <Link className="nav-link" href="open-invoice">
                  <i className="fa fa-university"></i>
                  {/* Open Invoices */}
                  {t("open_invoices")}
                </Link>
              </li>
              <li
                className={
                  "nav-item " + (active === "sales-invoice" ? " active" : "")
                }
              >
                <Link className="nav-link" href="sales-invoice">
                  <i className="fa fa-money "></i>
                  {/* Sales Invoices */}
                  {t("sales_invoices")}
                </Link>
              </li>
              {/* {checkPermission(ALL_PERMISSIONS.COMPLAINT) ? (
                <li
                  className={
                    "nav-item " + (active === "my-complaints" ? " active" : "")
                  }
                >
                  <Link className="nav-link" href="my-complaints">
                    <i className="fa fa-exclamation-triangle"></i>

                    {t("my_complaints")}
                  </Link>
                </li>
              ) : null} */}
              {type !== 2 ? (
                <li
                  className={
                    "nav-item " + (active === "child-accounts" ? " active" : "")
                  }
                >
                  <Link className="nav-link" href="child-accounts">
                    <i className="fa fa-building" aria-hidden="true"></i>

                    {/* Sales Invoices */}
                    {t("child_accounts")}
                  </Link>
                </li>
              ) : null}
              <li className={"nav-item " + (active === "ddf" ? " active" : "")}>
                <Link
                  className="nav-link"
                  href="#"
                  onClick={() => {
                    logout().then(() => {
                      window.location.reload();
                    });
                  }}
                >
                  <i className="fa fa-sign-out"></i>
                  {t("logout")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default AccountNav;
