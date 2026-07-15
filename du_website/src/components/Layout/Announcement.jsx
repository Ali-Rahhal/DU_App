import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

function Announcement() {
  const [show, setShow] = useState(true);
  const t = useTranslations();
  const rt = useRouter();

  if (!show) return null;

  return (
    <div
      className="announcement-header cursor-pointer"
      onClick={() => rt.push("/promotions")}
    >
      <div className="container-fluid">
        <div className="pro-description">
          <div className="pro-info">
            {t("prom_1")}
            <strong> {t("prom_2")} </strong>
            {t("prom_3")}

            <div className="pro-link-dropdown">
              <a href="/shop">{t("shop_now")}</a>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShow(false);
            }}
            type="button"
            className="close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default Announcement;
