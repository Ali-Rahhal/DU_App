import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

function Announcement() {
  const [show, setShow] = useState(true);
  const t = useTranslations();
  const rt = useRouter();
  return (
    <>
      {show && (
        <div
          className="alert alert-warning alert-dismissible fade show announcement-header cursor-pointer"
          onClick={() => rt.push("/promotions")}
          role="alert"
        >
          <div className="container-fluid">
            <div className="pro-description">
              <div className="pro-info">
                {t("prom_1")}
                <strong> {t("prom_2")} </strong> {t("prom_3")}
                <div className="pro-link-dropdown js-toppanel-link-dropdown">
                  <a href="/shop" className="pro-dropdown-toggle">
                    {t("shop_now")}
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
