import { useRouter } from "next/router";
import React, { useState } from "react";
import { useTranslations } from "use-intl";

function AccountHeader() {
  const rt = useRouter();
  const [active, setActive] = useState(rt.pathname.split("/")[1]);
  const t = useTranslations();
  return (
    <>
      <div className="accounnt_header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-auto col-12 order-md-2">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <a className="text-nowrap" href="/">
                      <i className="fa fa-home mr-2"></i>Home
                    </a>
                  </li>
                  <li className="breadcrumb-item">
                    <a className="text-nowrap" href="account">
                      <i className="fa fa-home mr-2"></i>Account
                    </a>
                  </li>
                  <li
                    className="breadcrumb-item text-nowrap active"
                    aria-current="page"
                    style={{
                      textTransform: "capitalize",
                    }}
                  >
                    {t(active.replace(/-/g, "_"))}
                  </li>
                </ol>
              </nav>
            </div>
            <div className="order-md-1 text-center text-md-left col-lg col-12">
              <h1
                className="h3 mb-0"
                style={{
                  textTransform: "capitalize",
                }}
              >
                {t(active.replace(/-/g, "_"))}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountHeader;
