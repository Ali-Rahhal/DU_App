import Link from "next/link";
import React from "react";

const FloatingMenu = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <section className="fab_con">
      <button
        className={`fab_btn ${open ? "open" : ""}`}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {open ? (
          <div className="fa fa-times"></div>
        ) : (
          <div className="fa fa-bars"></div>
        )}
      </button>
      {open && (
        <div className={`fab_menu ${open ? "active" : ""}`}>
          <Link
            href={"/account"}
            className="fab_menu_item slide-from-right purple_btn"
          >
            <span className="fab_menu_title">Profile</span>
            <div className="fab_menu_item_icon">
              <div className="fa fa-user"></div>
            </div>
          </Link>
          <Link href={"/"} className="fab_menu_item slide-from-right">
            <span className="fab_menu_title">Home</span>
            <div className="fab_menu_item_icon">
              <div className="fa fa-home"></div>
            </div>
          </Link>

          <Link
            href={"/cart"}
            className="fab_menu_item slide-from-right green_btn"
          >
            <span className="fab_menu_title">Cart</span>
            <div className="fab_menu_item_icon">
              <div className="fa fa-shopping-cart"></div>
            </div>
          </Link>

          <Link
            href={"/category"}
            className="fab_menu_item slide-from-right orange_btn"
          >
            <span className="fab_menu_title">Shop</span>
            <div className="fab_menu_item_icon">
              <div className="fa fa-search"></div>
            </div>
          </Link>
        </div>
      )}
    </section>
  );
};

export default FloatingMenu;
