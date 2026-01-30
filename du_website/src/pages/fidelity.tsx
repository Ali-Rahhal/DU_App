import Layout from "@/components/Layout/Layout";
import { useAccountStore } from "@/store/zustand";
import React from "react";
import dynamic from "next/dynamic";
import lottie from "../assets/gift.json";
import Image from "next/image";
import { ProgressBar, Table } from "react-bootstrap";
import { useTranslations } from "next-intl";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
const Fidelity = () => {
  const { firstName, lastName, name, code } = useAccountStore();
  const t = useTranslations("");
  return (
    <Layout>
      <div className="fidelity_con">
        <section className="fidelity_top_con">
          <div
            className="card no_card"
            style={{
              gap: "1rem",
              padding: " 1rem ",
            }}
          >
            <div className="card_title">
              {/* Fidelity Program */}
              {t("fidelity_program")}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div className="row no-gutters align-items-center">
                <div className="col-auto">
                  <div
                    className="avater btn-soft-primary"
                    style={{
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                    onClick={() => { }}
                  >{`${(firstName ? firstName[0] : "") +
                    (lastName ? lastName[0] : "")
                    }`}</div>
                </div>
                <div className="col-auto">
                  <h6 className="d-block font-weight-bold mb-0">{name}</h6>
                  <small className="text-muted">{code}</small>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                borderRadius: "8px 0 0 8px",
                backgroundColor: "#edf4ff",
              }}
            >
              <div
                style={{
                  paddingLeft: "1rem",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                230 pts
              </div>
              <button
                className="btn btn-primary"
                style={{
                  borderRadius: "0 8px 8px 0",
                  padding: "0.5rem 1rem",
                  height: "100%",
                }}
                onClick={() => {
                  // rt.push("/fidelity");
                }}
              >
                {/* Refer a friend */}
                {t("refer_a_friend")}
              </button>
            </div>
          </div>
          <div
            className="card"
            style={{
              backgroundColor: "#edf4ff",
              padding: "1rem",
              display: "grid",
              gridTemplateColumns: "1fr 0.5fr",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div className="card_title">How to earn points?</div>
              <ul className="list-group">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  {/* Sign up */}
                  {t("register")}
                  <span className="badge badge-primary badge-pill">+100</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  {/* Order */}
                  {t("order")}
                  <span className="badge badge-primary badge-pill">+10</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  {/* Referral */}
                  {t("referral")}
                  <span className="badge badge-primary badge-pill">+50</span>
                </li>
              </ul>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <Lottie
                animationData={lottie}
                style={{
                  width: "100%",
                  maxWidth: "200px",
                  height: "100%",
                  minHeight: "200px",
                  margin: "0 auto",
                }}
                loop={true}
              />
            </div>
          </div>
        </section>
        <section className="fidelity_middle_con">
          <div className="card_title">
            🔥
            {/* Hot Rewards */}
            {t("hot_rewards")}
          </div>
          <div className="hot_offers">
            <div className="card">
              <div
                className="card-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  alignItems: "flex-start",
                }}
              >
                <div className="card_title">LAIT ENTIER</div>
                <div
                  style={{
                    margin: "0 auto",
                  }}
                >
                  <Image
                    src="http://cloud.quayomobility.ca:15711/sfa_delice/images/products/LD001.jpeg"
                    width={200}
                    height={200}
                    alt=""
                  />
                </div>
                <div className="card-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
                  non odio nec justo.
                </div>
                <div className="points">500 pts</div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <ProgressBar now={38} className="progress_bar" />
                  <div className="points">38%</div>
                </div>
                <button className="btn btn-primary w-100 disabled">
                  {t("redeem")}
                </button>
              </div>
            </div>
            <div className="card">
              <div
                className="card-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  alignItems: "flex-start",
                }}
              >
                <div className="card_title">LAIT ENRICHI DELISSO</div>
                <div
                  style={{
                    margin: "0 auto",
                  }}
                >
                  <Image
                    src="http://cloud.quayomobility.ca:15711/sfa_delice/images/products/LD003.jpeg"
                    width={200}
                    height={200}
                    alt=""
                  />
                </div>
                <div className="card-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
                  non odio nec justo.
                </div>
                <div className="points">300 pts</div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <ProgressBar now={76} className="progress_bar" />
                  <div className="points">76%</div>
                </div>
                <button className="btn btn-primary w-100 disabled">
                  {t("redeem")}
                </button>
              </div>
            </div>
            <div className="card">
              <div
                className="card-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  alignItems: "flex-start",
                }}
              >
                <div className="card_title">LAIT PAQUET DELICE PLUS</div>
                <div
                  style={{
                    margin: "0 auto",
                  }}
                >
                  <Image
                    src="http://cloud.quayomobility.ca:15711/sfa_delice/images/products/LD007.jpeg"
                    width={200}
                    height={200}
                    alt=""
                  />
                </div>
                <div className="card-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
                  non odio nec justo.
                </div>
                <div className="points">500 pts</div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <ProgressBar now={38} className="progress_bar" />
                  <div className="points">38%</div>
                </div>
                <button className="btn btn-primary w-100 disabled">
                  {t("redeem")}
                </button>
              </div>
            </div>
          </div>
        </section>{" "}
        <section className="fidelity_bottom_con">
          <div className="table_con">
            <div className="card_title">
              {/* Choose from our wide range of products */}
              {t("choose_from_our_wide_range_of_products")}
            </div>
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Points</th>
                  <th scope="col">Progress</th>
                  <th scope="col">{t("redeem")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        src="http://cloud.quayomobility.ca:15711/sfa_delice/images/products/LD001.jpeg"
                        width={50}
                        height={50}
                        alt=""
                      />
                      <div>LAIT ENTIER</div>
                    </div>
                  </td>
                  <td>
                    {" "}
                    <span className="points">500</span>
                  </td>
                  <td>
                    <ProgressBar now={38} />
                  </td>
                  <td>
                    <button className="btn btn-primary">{t("redeem")}</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        src="http://cloud.quayomobility.ca:15711/sfa_delice/images/products/LD003.jpeg"
                        width={50}
                        height={50}
                        alt=""
                      />
                      <div>LAIT ENTIER</div>
                    </div>
                  </td>
                  <td>
                    {" "}
                    <span className="points">500</span>
                  </td>
                  <td>
                    <ProgressBar now={38} />
                  </td>
                  <td>
                    <button className="btn btn-primary">{t("redeem")}</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        src="http://cloud.quayomobility.ca:15711/sfa_delice/images/products/LD007.jpeg"
                        width={50}
                        height={50}
                        alt=""
                      />
                      <div>LAIT ENTIER</div>
                    </div>
                  </td>
                  <td>
                    <span className="points">500</span>
                  </td>
                  <td>
                    <ProgressBar now={38} />
                  </td>
                  <td>
                    <button className="btn btn-primary">{t("redeem")}</button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Fidelity;
