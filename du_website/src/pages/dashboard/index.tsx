import dashboardData from "@/Models/dashboardData";
import Layout from "@/components/Layout/Layout";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import { useAccountStore } from "@/store/zustand";
import { statusIdToText } from "@/utils";
import { getDashboardData, getFidelityPoints } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Modal, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const index = () => {
  const { firstName, lastName, name, code } = useAccountStore();
  const [dashboardData, setDashboardData] = useState<dashboardData>();
  const [openVisitModal, setOpenVisitModal] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);

  const rt = useRouter();
  const t = useTranslations();
  const { companyPlaceholder } = useCompanyAssets();
  // const [active, setActive] = useState(rt.pathname.split("/")[1]);
  var pieChart = {
    options: {
      chart: {
        id: "basic-bar",
      },
    },
    series: [44, 55, 41, 17, 15],
    labels: ["A", "B", "C", "D", "E"],
  };
  useEffect(() => {
    getDashboardData().then((res) => {
      setDashboardData({
        ...res.data.result,
      });
    });

    getFidelityPoints().then((res) => {
      setAvailablePoints(res.data.result.availablePoints);
    });
  }, []);
  if (!dashboardData)
    return (
      <Layout>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <Spinner
            animation="border"
            style={{
              width: "150px",
              height: "150px",
            }}
            variant="primary"
            role="status"
          ></Spinner>
        </div>
      </Layout>
    );
  return (
    <Layout>
      <div className="dashboard_header pb-0">
        <div className="navbar-nav flex-column">
          <div className="">
            <div
              className="m-4"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
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
                    onClick={() => {
                      rt.push("/account");
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
              {/* <div className="row no-gutters align-items-center">
                <div className="col-auto">
                  <div
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    {t("dashboard.fidelity_points")}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      borderRadius: "8px 0 0 8px",
                      backgroundColor: "#edf4ff",
                      width: "300px",
                    }}
                  >
                    <div
                      style={{
                        paddingLeft: "1rem",
                        fontWeight: "bold",
                      }}
                    >
                      {availablePoints} pts
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{
                        borderRadius: "0 8px 8px 0",
                        padding: "0.5rem 1rem",
                      }}
                      onClick={() => {
                        rt.push("/fidelity");
                      }}
                    >
                      {t("dashboard.redeem")}
                    </button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <Modal
        show={openVisitModal}
        onHide={() => setOpenVisitModal(false)}
        style={{
          fontFamily: "Poppins",
        }}
      >
        <Modal.Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Modal.Title>
            {/* Request a Visit */}
            {t("dashboard.request_a_visit")}
          </Modal.Title>
          <button className="close" onClick={() => setOpenVisitModal(false)}>
            <span aria-hidden="true">×</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="visitDate">
              {/* Visit Date */}
              {t("dashboard.visit_date")}
            </label>
            <input
              required
              type="date"
              id="visitDate"
              className="form-control"
              placeholder="Enter Visit Date"
            />
          </div>
          <div className="form-group">
            <label htmlFor="visitTime">
              {/* Visit Time */}
              {t("dashboard.visit_time")}
            </label>
            <input
              type="time"
              id="visitTime"
              className="form-control"
              placeholder="Enter Visit Time"
            />
          </div>
          <div className="form-group">
            <label htmlFor="visitReason">
              {/* Visit Reason */}
              {t("dashboard.visit_reason")}
            </label>
            <textarea
              required
              id="visitReason"
              className="form-control"
              // placeholder="Enter Visit Reason"
              placeholder={t("dashboard.enter_visit_reason")}
            ></textarea>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-primary"
            onClick={() => {
              setOpenVisitModal(false);
              toast.success("Visit Request Sent Successfully");
            }}
          >
            {/* Request Visit */}
            {t("dashboard.request_visit")}
          </button>
        </Modal.Footer>
      </Modal>

      <div className="dashboard_content">
        <div className="grid grid_1">
          <section className="cta_con">
            <div
              className="card"
              onClick={() => {
                rt.push("/category");
              }}
            >
              <div className="cta_header">
                <strong>{t("dashboard.plaace_an_order")}</strong>
                <p>
                  <small>
                    {/* Browse Products and Place Orders */}
                    {t("dashboard.browse_products_and_place_orders")}
                  </small>
                </p>
              </div>
              <div className="cta_body">
                <i className="ti-shopping-cart"></i>
              </div>
            </div>
            <div
              className="card"
              onClick={() => {
                setOpenVisitModal(true);
              }}
            >
              <div className="cta_header">
                <strong>
                  {/* Request a visit */}
                  {t("dashboard.request_a_visit")}
                </strong>
                <p>
                  <small>
                    {/* Request a visit from a sales rep */}
                    {t("dashboard.request_a_visit_from_a_sales_rep")}
                  </small>
                </p>
              </div>
              <div
                className="cta_body"
                style={{
                  backgroundColor: "#ffd43b",
                }}
              >
                <i className="ti-calendar"></i>
              </div>
            </div>
          </section>
          <section className="card">
            <div className="card_header_1">
              <div
                className="border_box"
                style={{
                  borderColor: "#ffd43b",
                }}
              >
                <div className="icon">
                  <i
                    className="ti-flag-alt"
                    style={{
                      color: "#ffd43b",
                    }}
                  ></i>
                </div>
                <p className="header_text">
                  {/* Total Outstanding */}
                  {t("dashboard.total_outstanding")}
                </p>
              </div>
            </div>
            <div className="card_body_1">
              {dashboardData?.stats.total_outstanding}
            </div>
          </section>
          <section className="card">
            <div className="card_header_1">
              <div
                className="border_box"
                style={{
                  borderColor: "#c92a2a",
                }}
              >
                <div className="icon">
                  <i
                    className="ti-info-alt"
                    style={{
                      color: "#c92a2a",
                    }}
                  ></i>
                </div>
                <p className="header_text">
                  {/* Past Dues */}
                  {t("dashboard.past_dues")}
                </p>
              </div>
            </div>
            <div className="card_body_1">{dashboardData.stats.past_due}</div>
          </section>
          <section className="card">
            <div className="card_header_1">
              <div
                className="border_box"
                style={{
                  borderColor: "#1971c2",
                }}
              >
                <div className="icon">
                  <i
                    className="ti-stats-up"
                    style={{
                      color: "#1971c2",
                    }}
                  ></i>
                </div>
                <p className="header_text">
                  {/* Y-T-D Sales */}
                  {t("dashboard.ytd_sales")}
                </p>
              </div>
            </div>
            <div className="card_body_1">{dashboardData.stats.ytd_sales}</div>
          </section>
          <section className="card">
            <div className="card_header_1">
              <div
                className="border_box"
                style={{
                  borderColor: "#0b7285",
                }}
              >
                <div className="icon">
                  <i
                    className="ti-stats-up"
                    style={{
                      color: "#0b7285",
                    }}
                  ></i>
                </div>
                <p className="header_text">
                  {/* Last Y-T-D Sales */}
                  {t("dashboard.last_ytd_sales")}
                </p>
              </div>
            </div>
            <div className="card_body_1">
              {dashboardData.stats.last_ytd_sales}
            </div>
          </section>
        </div>
        <div className="grid grid_3">
          <div className="detail_card">
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {/* Last Collection Details */}
              {t("dashboard.last_collection_details")}
            </p>
            <div className="card">
              <div>
                <h5>{dashboardData?.openInvoice?.payment_amount || "N/A"}</h5>
                <p>
                  {/* Paid For  */}
                  {t("dashboard.paid_for")}{" "}
                  {dashboardData?.openInvoice?.paid_for || "N/A"}
                </p>
                <div className="type">
                  <i className="ti-receipt"></i>
                  <p>
                    {/* Payment Method */}
                    {t("dashboard.payment_method")}
                  </p>
                  <p
                    style={{
                      color: "#2b8a3e",
                    }}
                  >
                    {dashboardData?.openInvoice?.payment_type || "N/A"}
                  </p>
                </div>
              </div>
              <div className="date">
                <h6>
                  {/* Payment On */}
                  {t("dashboard.payment_on")}
                </h6>
                <p>{dashboardData?.openInvoice?.payment_on || "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="detail_card">
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {/* Last Order Details */}
              {t("dashboard.last_order_details")}
            </p>
            <div className="card card_2">
              <div>
                <h5>
                  {dashboardData?.transaction_header?.order_amount ||
                    "N/A"}{" "}
                </h5>
                <p>
                  {/* Last Order */}
                  {t("dashboard.last_order")}{" "}
                  {dashboardData?.transaction_header?.order_code || "N/A"}
                </p>
                <div className="type">
                  <i
                    className="ti-receipt"
                    style={{
                      color: "#2b8a3e",
                    }}
                  ></i>
                  <p>
                    {/* Placed On */}
                    {t("dashboard.placed_on")}
                  </p>
                  <p
                    style={{
                      color: "#2b8a3e",
                    }}
                  >
                    {dashboardData?.transaction_header?.placed_on || "N/A"}
                  </p>
                </div>
              </div>
              <div className="date">
                <h6>
                  {/* Next Planned Visit */}
                  {t("dashboard.next_planned_visit")}
                </h6>
                <p>
                  {dashboardData?.transaction_header?.next_planned_visit ||
                    "N/A"}
                </p>
                <h6>
                  {/* Sales Rep */}
                  {t("dashboard.sales_rep")}
                </h6>
                <p>{dashboardData?.transaction_header?.sales_rep || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid_2">
          <div className="table_cont">
            <div className="table_header">
              <p className="table_title">
                {/* Recent Orders */}
                {t("dashboard.recent_orders")}
              </p>
              <div className="icon">
                <i className="ti-stats-up"></i>
              </div>
            </div>
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <th>
                    {/* Sales Number */}
                    {t("dashboard.sales_number")}
                  </th>
                  <th>
                    {/* Order Date */}
                    {t("dashboard.order_date")}
                  </th>
                  <th>
                    {/* Status */}
                    {t("dashboard.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3}>No Recent Orders</td>
                  </tr>
                ) : null}
                {dashboardData.recentOrders.map((order, index) => {
                  const status = statusIdToText(order.transaction_status);
                  return (
                    <tr key={index}>
                      <td>
                        <Link
                          href={`/orders-details?id=${order.transaction_header_id}`}
                        >
                          {order.sales_number}
                        </Link>
                      </td>
                      <td>{order.order_date}</td>
                      <td>
                        <div
                          style={{
                            color: status.color,
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <i
                            className={status.icon}
                            style={{ color: status.color, fontSize: "1.1rem" }}
                          ></i>{" "}
                          <span
                            style={{
                              maxWidth: "200px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {" "}
                            {/* {status.text} */}
                            {t(
                              "statuses." +
                                status.text?.toLowerCase().replace(" ", "_"),
                            ) || status.text}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          <div className="table_cont">
            <div className="table_header">
              <p className="table_title">Next Deliveries Due</p>
              <div className="icon">
                <i className="ti-truck"></i>
              </div>
            </div>
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <th>
                    {/* Delivery Number */}
                    {t("dashboard.delivery_number")}
                  </th>
                  <th>
                    {/* Due Date */}
                    {t("dashboard.due_date")}
                  </th>
                  <th> {t("dashboard.status")}</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.nextDeliveryDues.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      rowSpan={5}
                      style={{
                        textAlign: "center",
                      }}
                    >
                      {/* No Recent Deliveries */}
                      {t("dashboard.no_recent_deliveries")}
                    </td>
                  </tr>
                ) : null}
                {dashboardData.nextDeliveryDues.map((delivery, index) => {
                  const status = statusIdToText(delivery.transaction_status);
                  return (
                    <tr key={index}>
                      <td>{delivery.delivery_number}</td>
                      <td>{delivery.due_date}</td>
                      <td>
                        <div
                          style={{
                            color: status.color,
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <i
                            className={status.icon}
                            style={{ color: status.color, fontSize: "1.1rem" }}
                          ></i>{" "}
                          <span
                            style={{
                              maxWidth: "200px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {" "}
                            {t(
                              "statuses." +
                                status.text?.toLowerCase().replace(" ", "_"),
                            ) || status.text}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          <div className="table_cont">
            <div className="table_header">
              <p className="table_title">
                {/* Outstanding Payment */}
                {t("dashboard.outstanding_payment")}
              </p>
              <div className="icon">
                <i className="ti-receipt"></i>
              </div>
            </div>
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <th>
                    {/* Invoice Number */}
                    {t("dashboard.invoice_number")}
                  </th>
                  <th>{t("dashboard.due_date")}</th>
                  <th>{t("dashboard.amount")}</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.collectionHeaders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      rowSpan={5}
                      style={{
                        textAlign: "center",
                      }}
                    >
                      No Outstanding Payments
                    </td>
                  </tr>
                ) : null}
                {dashboardData.collectionHeaders.map((collection, index) => (
                  <tr key={index}>
                    <td>{collection.invoice_number}</td>
                    <td>{collection.due_date}</td>
                    <td
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      {collection.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
        <section className="grid grid_2">
          <div
            className="card"
            style={{
              justifyContent: "flex-start",
            }}
          >
            <div className="card_header_1">
              <div
                className="border_box"
                style={{
                  borderColor: "transparent",
                }}
              >
                <div className="icon">
                  <i
                    className="ti-flag-alt"
                    style={{
                      color: "#0b7285",
                    }}
                  ></i>
                </div>
                <p className="header_text">
                  {/* Products Sold By Category  */}
                  {t("dashboard.products_sold_by_category")}
                </p>
              </div>
            </div>
            {dashboardData?.productsByCategory.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  maxHeight: "350px",
                  height: "350px",
                }}
              >
                <p style={{ color: "gray" }}>
                  {/* No Products Sold */}
                  {t("dashboard.no_products_sold")}
                </p>
              </div>
            ) : (
              <ApexChart
                options={{
                  chart: {
                    id: "Products Sold By Category",
                  },
                  labels: dashboardData?.productsByCategory.map(
                    (item) => item.category,
                  ),
                  legend: {
                    show: true,
                    position: "bottom",
                  },
                }}
                // series={dashboardData.productsByCategory.map((item) => ({
                //   name: item.category,
                //   data: item.val,
                // }))}
                series={dashboardData.productsByCategory.map((item) =>
                  parseFloat(item.val),
                )}
                type="donut"
                height={350}
              />
            )}
          </div>
          <div
            className="card"
            style={{
              justifyContent: "flex-start",
            }}
          >
            <div className="card_header_1">
              <div
                className="border_box"
                style={{
                  borderColor: "transparent",
                }}
              >
                <div className="icon">
                  <i
                    className="ti-package"
                    style={{
                      color: "#0b7285",
                    }}
                  ></i>
                </div>
                <p className="header_text">
                  {/* Top Products Bought */}
                  {t("dashboard.top_products_bought")}
                </p>
              </div>
            </div>
            {dashboardData?.productSales.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "40vh",
                }}
              >
                <p style={{ color: "gray" }}>
                  {/* No Products Bought */}
                  {t("dashboard.no_products_bought")}
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",

                  flexDirection: "column",
                  maxHeight: "350px",
                  overflowY: "auto",
                }}
              >
                {dashboardData?.productSales.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",

                        gap: "10px",
                      }}
                    >
                      <Image
                        src={item.image_url || companyPlaceholder}
                        alt=""
                        // style={{
                        //   width: "50px",
                        //   height: "50px",
                        // }}
                        width={50}
                        height={50}
                      />
                      <p
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                          maxWidth: "300px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.item}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: item.variation >= 0 ? "#2b8a3e" : "#c92a2a",
                      }}
                    >
                      {item.sold_quantity} {/* Sold */} {t("dashboard.sold")} (
                      {item.variation}%)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            className="card"
            style={{
              justifyContent: "flex-start",
            }}
          >
            <div className="card_header_1">
              <div
                className="border_box"
                style={{
                  borderColor: "transparent",
                }}
              >
                <div className="icon">
                  <i
                    className="ti-calendar"
                    style={{
                      color: "#0b7285",
                    }}
                  ></i>
                </div>
                <p className="header_text">
                  {/* Seasonal Sales Variation */}
                  {t("dashboard.seasonal_sales_variation")}
                </p>
              </div>
            </div>
            <ApexChart
              options={{
                chart: {
                  id: "Sales Variation",
                },
                xaxis: {
                  categories: dashboardData.seasonalVariation.map(
                    (item) => item.month,
                  ),
                },
              }}
              series={[
                {
                  // name: "Total Sales",
                  name: t("dashboard.total_sales"),
                  data: dashboardData.seasonalVariation.map(
                    (item) => item.TotalSales,
                  ),
                },
                {
                  // name: "Total Returns",
                  name: t("dashboard.total_returns"),
                  data: dashboardData.seasonalVariation.map(
                    (item) => item.TotalReturns,
                  ),
                },
              ]}
              // options={lineChart.options}
              // series={lineChart.series}
              type="bar"
              height={350}
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};
//   return (
//     <Layout>
//       <div>index</div>
//     </Layout>
//   );
// };

export default index;

// export const getServerSideProps = async () => {};
