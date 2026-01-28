import { useState } from "react";

function Announcement() {
  const [show, setShow] = useState(true);
  return (
    <>
      {show && (
        <div
          className="alert alert-warning alert-dismissible fade show announcement-header"
          role="alert"
        >
          <div className="container-fluid">
            <div className="pro-description">
              <div className="pro-info">
                Get<strong> UP TO 40% OFF </strong> With Our Promotions
                <div className="pro-link-dropdown js-toppanel-link-dropdown">
                  <a href="/shop" className="pro-dropdown-toggle">
                    SHOP NOW
                  </a>
                </div>
              </div>
              <button
                onClick={() => setShow(false)}
                type="button"
                className="close"
                data-dismiss="alert"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Announcement;
