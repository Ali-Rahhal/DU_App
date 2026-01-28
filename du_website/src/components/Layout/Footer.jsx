import Image from "next/image";
import Link from "next/link";
import React from "react";
function Footer() {
  return (
    <>
      <footer className="site-footer footer-padding-lg bg-light">
        <div className="container-fluid theme-container">
          <div className="upper-footer">
            <div className="row justify-content-around">
              <div className="col-lg-4 col-md-4 col-12">
                <div className="widget">
                  <div className="footer-brand">
                    <Image
                      src={"/assets/img/logo.png"}
                      alt="Logo"
                      height={40}
                      width={250}
                    />
                  </div>
                  <p>
                    Droguerie de L'Union Pharmaceutical Company is a leading
                    pharmaceutical company in Lebanon. We are committed to
                    providing high-quality, affordable, and innovative solutions
                    to our customers.
                  </p>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 col-6">
                <div className="widget">
                  <div className="widget-title">
                    <h3>Usefull Links</h3>
                  </div>
                  <ul>
                    <li>
                      <Link href="/">Home</Link>
                    </li>
                    <li>
                      <Link href="/category">All Products</Link>
                    </li>
                    <li>
                      <Link href="/category?cat=P">Pharma</Link>
                    </li>
                    <li>
                      <Link href="/category?cat=PP">Para Pharma</Link>
                    </li>
                    <li>
                      <Link href="/category?cat=NP">Non Pharma</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 col-6">
                <div className="widget">
                  <div className="widget-title">
                    <h3>Account</h3>
                  </div>
                  <ul>
                    <li>
                      <Link href="/account">Account Info</Link>
                    </li>
                    <li>
                      <Link href="/cart">Cart</Link>
                    </li>
                    <li>
                      <Link href="/orders">My Orders</Link>
                    </li>
                    <li>
                      <Link href="/open-invoice">Open Invoices</Link>
                    </li>

                    <li>
                      <Link href="contact">Contact Us</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 col-6">
                <div className="widget">
                  <div className="widget-title">
                    <h3>Policy</h3>
                  </div>
                  <ul>
                    <li>
                      <Link href="policy">Privacy policy</Link>
                    </li>
                    <li>
                      <Link href="policy">Terms and Conditions</Link>
                    </li>
                    <li>
                      <Link href="policy">Return Policy</Link>
                    </li>
                    <li>
                      <Link href="policy">Refund Policy</Link>
                    </li>
                    <li>
                      <Link href="policy">Ip Policy</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-2 col-md-2 col-6">
                <div className="widget">
                  <div className="widget-title">
                    <h3>Social</h3>
                  </div>
                  <ul>
                    <li>
                      <Link
                        target="_blank"
                        href="https://www.facebook.com/Unionhealthcarelb/"
                      >
                        Facebook
                      </Link>
                    </li>
                    <li>
                      <Link
                        target="_blank"
                        href="https://www.instagram.com/unionhealthcare/"
                      >
                        Instagram
                      </Link>
                    </li>

                    <li>
                      <Link
                        target="_blank"
                        href="https://www.linkedin.com/company/unionhealthcarelb/"
                      >
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
                <p className="mb-4 mb-md-0 text-muted">
                  Copyright © 2024 DU | All rights reserved.
                </p>
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
