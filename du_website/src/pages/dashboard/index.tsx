import dashboardData from "@/Models/dashboardData";
import Layout from "@/components/Layout/Layout";
import { useAccountStore } from "@/store/zustand";
import { statusIdToText } from "@/utils";
import { getDashboardData } from "@/utils/apiCalls";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Spinner, Table } from "react-bootstrap";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const index = () => {
  const { firstName, lastName, name, code } = useAccountStore();
  const [dashboardData, setDashboardData] = useState<dashboardData>();
  const rt = useRouter();
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
            <div className="m-4">
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
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard_content">
        <div className="grid grid_1">
          <section className="cta_con">
            <div
              className="card"
              onClick={() => {
                // http://localhost:4501/category
                rt.push("/category");
              }}
            >
              <div className="cta_header">
                <strong>Place an order</strong>
                <p>
                  <small>Browse Products and Place Orders</small>
                </p>
              </div>
              <div className="cta_body">
                <i className="ti-shopping-cart"></i>
              </div>
            </div>
            <div className="card">
              <div className="cta_header">
                <strong>Place a Return Request</strong>
                <p>
                  <small>Create a Return Request</small>
                </p>
              </div>
              <div
                className="cta_body"
                style={{
                  backgroundColor: "#e67700",
                }}
              >
                <i className="ti-back-left"></i>
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
                <p className="header_text">Total Outstanding</p>
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
                <p className="header_text">Past Dues</p>
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
                <p className="header_text">Y-T-D Sales</p>
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
                <p className="header_text">Last Y-T-D Sales</p>
              </div>
            </div>
            <div className="card_body_1">
              {dashboardData.stats.last_ytd_sales}
            </div>
          </section>
        </div>
        <div className="grid grid_2">
          <div className="table_cont">
            <div className="table_header">
              <p className="table_title">Recent Orders</p>
              <div className="icon">
                <i className="ti-stats-up"></i>
              </div>
            </div>
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <th>Sales Number</th>
                  <th>Order Date</th>
                  <th>Status</th>
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
                            {status.text}
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
                  <th>Delivery Number</th>
                  <th>Due Date</th>
                  <th>Status</th>
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
                      No Recent Deliveries
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
                            {status.text}
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
              <p className="table_title">Outstanding Payment</p>
              <div className="icon">
                <i className="ti-receipt"></i>
              </div>
            </div>
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Due Date</th>
                  <th>Amount</th>
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
        <div className="grid grid_3">
          <div className="detail_card">
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              Last Collection Details
            </p>
            <div className="card">
              <div>
                <h5>{dashboardData?.openInvoice?.payment_amount || "N/A"}</h5>
                <p>Paid For {dashboardData?.openInvoice?.paid_for || "N/A"}</p>
                <div className="type">
                  <i className="ti-receipt"></i>
                  <p>Payment Method</p>
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
                <h6>Payment On</h6>
                <p>{dashboardData?.openInvoice?.payment_on || "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="detail_card">
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              Last Order Details
            </p>
            <div className="card card_2">
              <div>
                <h5>
                  {dashboardData?.transaction_header?.order_amount || "N/A"}{" "}
                </h5>
                <p>
                  Last Order{" "}
                  {dashboardData?.transaction_header?.order_code || "N/A"}
                </p>
                <div className="type">
                  <i
                    className="ti-receipt"
                    style={{
                      color: "#2b8a3e",
                    }}
                  ></i>
                  <p>Placed On</p>
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
                <h6>Next Planned Visit</h6>
                <p>
                  {dashboardData?.transaction_header?.next_planned_visit ||
                    "N/A"}
                </p>
                <h6>Sales Rep</h6>
                <p>{dashboardData?.transaction_header?.sales_rep || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
        <section className="grid grid_2">
          <div className="card">
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
                <p className="header_text">Products Sold By Category </p>
              </div>
            </div>
            {dashboardData?.productsByCategory.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "40vh",
                }}
              >
                <p style={{ color: "gray" }}>No Products Sold</p>
              </div>
            ) : (
              <ApexChart
                options={{
                  chart: {
                    id: "Products Sold By Category",
                  },
                  labels: dashboardData?.productsByCategory.map(
                    (item) => item.category
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
                  parseFloat(item.val)
                )}
                type="donut"
                height={350}
              />
            )}
          </div>
          <div className="card">
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
                <p className="header_text">Top Products Bought</p>
              </div>
            </div>
            {dashboardData?.productsByCategory.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "40vh",
                }}
              >
                <p style={{ color: "gray" }}>No Products Bought</p>
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
                {dashboardData.productSales.map((item, index) => (
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
                      <img
                        src={
                          item.image_url ||
                          process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
                        }
                        alt=""
                        style={{
                          width: "50px",
                          height: "50px",
                        }}
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
                        color: item.variation > 0 ? "#2b8a3e" : "#c92a2a",
                      }}
                    >
                      {item.sold_quantity} Sold ({item.variation}%)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card">
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
                <p className="header_text">Seasonal Sales Variation </p>
              </div>
            </div>
            <ApexChart
              options={{
                chart: {
                  id: "Sales Variation",
                },
                xaxis: {
                  categories: dashboardData.seasonalVariation.map(
                    (item) => item.month
                  ),
                },
              }}
              series={[
                {
                  name: "Total Sales",
                  data: dashboardData.seasonalVariation.map(
                    (item) => item.TotalSales
                  ),
                },
                {
                  name: "Total Returns",
                  data: dashboardData.seasonalVariation.map(
                    (item) => item.TotalReturns
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
