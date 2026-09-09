import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Spinner } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa6";

import ChangeLangDropdown from "../common/ChangeLangDropdown";
import pkg from "../../../package.json";
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
    <footer className="site-footer">
      <div className="container-fluid theme-container">
        <div className="upper-footer">
          {/* Brand */}
          <div className="footer-brand-section">
            <div className="footer-brand">
              {companyHydrated ? (
                <Image
                  src={companyLogo}
                  alt={companyName}
                  width={220}
                  height={36}
                />
              ) : (
                <Spinner
                  animation="border"
                  style={{
                    width: "28px",
                    height: "28px",
                  }}
                />
              )}
            </div>

            <p className="footer-description">
              {companyHydrated ? t(companyDescription) : "Loading..."}
            </p>

            {companyHydrated && (
              <div className="footer-socials">
                <Link
                  href={companyFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="footer-social-link"
                >
                  <FaFacebook size={15} />
                </Link>

                <Link
                  href={companyInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="footer-social-link"
                >
                  <FaInstagram size={15} />
                </Link>

                <Link
                  href={companyLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="footer-social-link"
                >
                  <FaLinkedin size={15} />
                </Link>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="footer-links-section">
            <div className="footer-widget">
              <h3 className="footer-widget-title">{t("footer.policy")}</h3>

              <ul className="footer-links">
                <li>
                  <Link href="/policy">{t("footer.privacy_policy")}</Link>
                </li>

                <li>
                  <Link href="/policy">{t("footer.terms_and_conditions")}</Link>
                </li>

                <li>
                  <Link href="/policy">{t("footer.refund_policy")}</Link>
                </li>

                <li>
                  <Link href="/policy">{t("footer.ip_policy")}</Link>
                </li>
              </ul>
            </div>

            <div className="footer-widget footer-contact-widget">
              <h3 className="footer-widget-title">{t("footer.social")}</h3>

              <ul className="footer-links">
                <li>
                  <Link href="/contact">{t("footer.contact_us")}</Link>
                </li>

                {companyHydrated && (
                  <>
                    <li>
                      <Link
                        href={companyFacebook}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Facebook
                      </Link>
                    </li>

                    <li>
                      <Link
                        href={companyInstagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Instagram
                      </Link>
                    </li>

                    <li>
                      <Link
                        href={companyLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="lower-footer">
          <div className="footer-bottom-left">
            <p>{companyHydrated ? t(companyCopyright) : "Loading..."}</p>

            <span className="footer-divider">•</span>

            <p>
              {t("footer.version")} {pkg.version}
            </p>
          </div>

          <div className="footer-bottom-right">
            <ChangeLangDropdown />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
