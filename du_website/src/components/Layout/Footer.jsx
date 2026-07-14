import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import ChangeLangDropdown from "../common/ChangeLangDropdown";
import pkg from "../../../package.json";
import { Spinner } from "react-bootstrap";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";

function Footer() {
  const t = useTranslations();
  const {
    companyHydrated,
    companyLogo,
    companyName,
    companyDescription,
    companyCopyright,
    companyFacebook,
    companyLinkedin,
    companyInstagram,
  } = useCompanyAssets();
  return (
    <>
      <footer className="site-footer footer-padding-lg bg-light">
        <div className="container-fluid theme-container">
          <div className="upper-footer">
            <div className="row justify-content-around">
              <div className="col-lg-4 col-md-4 col-12">
                <div className="widget">
                  <div className="footer-brand">
                    {(companyHydrated && (
                      <Image
                        src={companyLogo}
                        alt={companyName}
                        height={40}
                        width={250}
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
                  </div>
                  <p>{t(companyDescription)}</p>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 col-6">
                <div className="widget">
                  <div className="widget-title">
                    <h3>{t("useful links")}</h3>
                  </div>
                  <ul>
                    <li>
                      <Link href="/">{t("home")}</Link>
                    </li>
                    <li>
                      <Link href="/category">{t("all products")}</Link>
                    </li>
                    {/* <li>
                      <Link href="/category?cat=P">Pharma</Link>
                    </li>
                    <li>
                      <Link href="/category?cat=PP">Para Pharma</Link>
                    </li>
                    <li>
                      <Link href="/category?cat=NP">Non Pharma</Link>
                    </li> */}
                  </ul>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 col-6">
                <div className="widget">
                  <div className="widget-title">
                    <h3>{t("account")}</h3>
                  </div>
                  <ul>
                    <li>
                      <Link href="/account">{t("account info")}</Link>
                    </li>
                    <li>
                      <Link href="/cart">{t("cart")}</Link>
                    </li>
                    <li>
                      <Link href="/orders">{t("my_orders")}</Link>
                    </li>
                    <li>
                      <Link href="/open-invoice">
                        {t("open_invoices.title")}
                      </Link>
                    </li>

                    <li>
                      <Link href="contact">{t("contact_us")}</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 col-6">
                <div className="widget">
                  <div className="widget-title">
                    <h3>{t("policy")}</h3>
                  </div>
                  <ul>
                    <li>
                      <Link href="policy">{t("privacy_policy")}</Link>
                    </li>
                    <li>
                      <Link href="policy">{t("terms_and_conditions")}</Link>
                    </li>
                    <li>
                      <Link href="policy">{t("refund_policy")}</Link>
                    </li>
                    <li>
                      <Link href="policy">{t("ip_policy")}</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 col-6">
                <div className="widget">
                  <div className="widget-title">
                    <h3>{t("social")}</h3>
                  </div>
                  <ul>
                    <li>
                      <Link target="_blank" href={companyFacebook}>
                        Facebook
                      </Link>
                    </li>
                    <li>
                      <Link target="_blank" href={companyInstagram}>
                        Instagram
                      </Link>
                    </li>
                    <li>
                      <Link target="_blank" href={companyLinkedin}>
                        Linkedin
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="lower-footer">
            <div className="row">
              <div className="col-md-6 text-md-left">
                <p className="mb-4 mb-md-0 text-muted">{t(companyCopyright)}</p>
                <p className="mb-4 mb-md-0 text-muted">
                  {t("version") + " " + pkg.version}
                </p>
                <ChangeLangDropdown />
              </div>

              {/* <div className="col-md-6">
                <div className="footer-card text-md-right">
                  <Image
                    className="img-fluid mx-2"
                    src={"/assets/img/payment-methods.png"}
                    alt="Icon"
                    height={28}
                    width={187}
                  />
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
