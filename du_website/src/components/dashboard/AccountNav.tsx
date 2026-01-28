import { useAccountStore } from "@/store/zustand";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

function AccountNav() {
  const [showMenu, setShowMenu] = useState(false);
  const { firstName, lastName, name, code } = useAccountStore();
  const rt = useRouter();
  const [active, setActive] = useState(rt.pathname.split("/")[1]);
  // useEffect(() => {
  //   console.log(rt.pathname.split("/"));
  //   setActive(rt.pathname.split("/")[1]);
  // }, [rt.pathname]);
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
                  <i className="fa fa-user"></i> My Account
                </Link>
              </li>
              <li
                className={
                  "nav-item " + (active === "change-password" ? " active" : "")
                }
              >
                <Link className="nav-link" href="change-password">
                  <i className="fa fa-lock"></i>
                  Password
                </Link>
              </li>

              <li
                className={
                  "nav-item " + (active === "wishlist" ? " active" : "")
                }
              >
                <Link className="nav-link" href="wishlist">
                  <i className="fa fa-heart"></i>
                  Wishlist
                </Link>
              </li>
              <li
                className={"nav-item " + (active === "orders" ? " active" : "")}
              >
                <Link className="nav-link" href="orders">
                  <i className="fa fa-shopping-cart"></i>
                  Order
                </Link>
              </li>
              <li
                className={
                  "nav-item " + (active === "open-invoice" ? " active" : "")
                }
              >
                <Link className="nav-link" href="open-invoice">
                  <i className="fa fa-university"></i>
                  Open Invoices
                </Link>
              </li>
              <li
                className={
                  "nav-item " + (active === "sales-invoice" ? " active" : "")
                }
              >
                <Link className="nav-link" href="sales-invoice">
                  <i className="fa fa-money "></i>
                  Sales Invoices
                </Link>
              </li>
              <li className={"nav-item " + (active === "ddf" ? " active" : "")}>
                <Link className="nav-link" href="#">
                  <i className="fa fa-sign-out"></i> Logout
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
