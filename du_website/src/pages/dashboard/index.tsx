import dashboardData from "@/Models/dashboardData";

import Layout from "@/components/Layout/Layout";
import OrderDetailsModal from "@/components/ordersPage/OrderDetailsModal";

import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import { useAccountStore } from "@/store/zustand";

import { statusIdToText } from "@/utils";
import { getDashboardData } from "@/utils/apiCalls";

import { useTranslations } from "next-intl";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";

import { useEffect, useState } from "react";
import { Modal, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";

const ApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const Dashboard = () => {
  const { firstName, lastName, name, code } = useAccountStore();

  const [dashboardData, setDashboardData] = useState<dashboardData>();
  const [openVisitModal, setOpenVisitModal] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const rt = useRouter();
  const t = useTranslations();

  const { companyPlaceholder } = useCompanyAssets();

  useEffect(() => {
    getDashboardData().then((res) => {
      setDashboardData({
        ...res.data.result,
      });
    });
  }, []);

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrderId(null);
  };

  if (!dashboardData) {
    return (
      <Layout>
        <div className="dashboard-loading">
          <Spinner animation="border" variant="primary" role="status" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* =========================================================
          DASHBOARD HEADER
          ========================================================= */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-user">
            <button
              type="button"
              className="dashboard-header-avatar btn-soft-primary"
              onClick={() => rt.push("/account")}
              aria-label="Open account"
            >
              {`${firstName ? firstName[0] : ""}${lastName ? lastName[0] : ""}`}
            </button>

            <div className="dashboard-user-info">
              <h6>{name}</h6>
              <small>{code}</small>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          REQUEST VISIT MODAL
          ========================================================= */}
      <Modal
        show={openVisitModal}
        onHide={() => setOpenVisitModal(false)}
        centered
        className="dashboard-visit-modal"
      >
        <Modal.Header>
          <Modal.Title>{t("dashboard.request_a_visit")}</Modal.Title>

          <button
            type="button"
            className="dashboard-modal-close"
            onClick={() => setOpenVisitModal(false)}
            aria-label="Close"
          >
            <i className="ti-close"></i>
          </button>
        </Modal.Header>

        <Modal.Body>
          <div className="dashboard-form-group">
            <label htmlFor="visitDate">{t("dashboard.visit_date")}</label>

            <input
              required
              type="date"
              id="visitDate"
              className="form-control"
            />
          </div>

          <div className="dashboard-form-group">
            <label htmlFor="visitTime">{t("dashboard.visit_time")}</label>

            <input type="time" id="visitTime" className="form-control" />
          </div>

          <div className="dashboard-form-group">
            <label htmlFor="visitReason">{t("dashboard.visit_reason")}</label>

            <textarea
              required
              id="visitReason"
              className="form-control"
              placeholder={t("dashboard.enter_visit_reason")}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setOpenVisitModal(false);
              toast.success("Visit Request Sent Successfully");
            }}
          >
            {t("dashboard.request_visit")}
          </button>
        </Modal.Footer>
      </Modal>

      {/* =========================================================
          DASHBOARD CONTENT
          ========================================================= */}
      <div className="dashboard-content">
        {/* =======================================================
            ACTIONS
            ======================================================= */}
        <section className="dashboard-actions">
          <div
            className="dashboard-action-card"
            onClick={() => rt.push("/category")}
          >
            <div className="dashboard-action-content">
              <strong>{t("dashboard.plaace_an_order")}</strong>

              <p>
                <small>{t("dashboard.browse_products_and_place_orders")}</small>
              </p>
            </div>

            <div className="dashboard-action-icon dashboard-action-icon--order">
              <i className="ti-shopping-cart"></i>
            </div>
          </div>

          <div
            className="dashboard-action-card"
            onClick={() => setOpenVisitModal(true)}
          >
            <div className="dashboard-action-content">
              <strong>{t("dashboard.request_a_visit")}</strong>

              <p>
                <small>{t("dashboard.request_a_visit_from_a_sales_rep")}</small>
              </p>
            </div>

            <div className="dashboard-action-icon dashboard-action-icon--visit">
              <i className="ti-calendar"></i>
            </div>
          </div>
        </section>

        {/* =======================================================
            STATISTICS
            ======================================================= */}
        <section className="dashboard-stats-grid">
          {/* Total Outstanding */}
          <article className="dashboard-stat-card">
            <div className="dashboard-stat-header dashboard-stat-header--warning">
              <div className="dashboard-stat-icon">
                <i className="ti-flag-alt"></i>
              </div>

              <p className="dashboard-stat-title">
                {t("dashboard.total_outstanding")}
              </p>
            </div>

            <div className="dashboard-stat-value">
              {dashboardData.stats.total_outstanding}
            </div>
          </article>

          {/* Past Dues */}
          <article className="dashboard-stat-card">
            <div className="dashboard-stat-header dashboard-stat-header--danger">
              <div className="dashboard-stat-icon">
                <i className="ti-info-alt"></i>
              </div>

              <p className="dashboard-stat-title">{t("dashboard.past_dues")}</p>
            </div>

            <div className="dashboard-stat-value">
              {dashboardData.stats.past_due}
            </div>
          </article>

          {/* YTD Sales */}
          <article className="dashboard-stat-card">
            <div className="dashboard-stat-header dashboard-stat-header--primary">
              <div className="dashboard-stat-icon">
                <i className="ti-stats-up"></i>
              </div>

              <p className="dashboard-stat-title">{t("dashboard.ytd_sales")}</p>
            </div>

            <div className="dashboard-stat-value">
              {dashboardData.stats.ytd_sales}
            </div>
          </article>

          {/* Last YTD Sales */}
          <article className="dashboard-stat-card">
            <div className="dashboard-stat-header dashboard-stat-header--secondary">
              <div className="dashboard-stat-icon">
                <i className="ti-stats-up"></i>
              </div>

              <p className="dashboard-stat-title">
                {t("dashboard.last_ytd_sales")}
              </p>
            </div>

            <div className="dashboard-stat-value">
              {dashboardData.stats.last_ytd_sales}
            </div>
          </article>
        </section>

        {/* =======================================================
            DETAILS
            ======================================================= */}
        <section className="dashboard-details-grid">
          {/* Last Collection */}
          <article className="dashboard-detail-card">
            <h3 className="dashboard-detail-title">
              {t("dashboard.last_collection_details")}
            </h3>

            <div className="dashboard-detail-box">
              <div className="dashboard-detail-main">
                <h5>{dashboardData?.openInvoice?.payment_amount || "N/A"}</h5>

                <p>
                  {t("dashboard.paid_for")}{" "}
                  {dashboardData?.openInvoice?.paid_for || "N/A"}
                </p>

                <div className="dashboard-detail-type">
                  <i className="ti-receipt"></i>

                  <span>{t("dashboard.payment_method")}</span>

                  <strong>
                    {dashboardData?.openInvoice?.payment_type || "N/A"}
                  </strong>
                </div>
              </div>

              <div className="dashboard-detail-date">
                <h6>{t("dashboard.payment_on")}</h6>

                <p>{dashboardData?.openInvoice?.payment_on || "N/A"}</p>
              </div>
            </div>
          </article>

          {/* Last Order */}
          <article className="dashboard-detail-card">
            <h3 className="dashboard-detail-title">
              {t("dashboard.last_order_details")}
            </h3>

            <div className="dashboard-detail-box">
              <div className="dashboard-detail-main">
                <h5>
                  {dashboardData?.transaction_header?.order_amount || "N/A"}
                </h5>

                <p>
                  {t("dashboard.last_order")}{" "}
                  {dashboardData?.transaction_header?.order_code || "N/A"}
                </p>

                <div className="dashboard-detail-type">
                  <i className="ti-receipt"></i>

                  <span>{t("dashboard.placed_on")}</span>

                  <strong>
                    {dashboardData?.transaction_header?.placed_on || "N/A"}
                  </strong>
                </div>
              </div>

              <div className="dashboard-detail-date">
                <h6>{t("dashboard.next_planned_visit")}</h6>

                <p>
                  {dashboardData?.transaction_header?.next_planned_visit ||
                    "N/A"}
                </p>

                <h6>{t("dashboard.sales_rep")}</h6>

                <p>{dashboardData?.transaction_header?.sales_rep || "N/A"}</p>
              </div>
            </div>
          </article>
        </section>

        {/* =======================================================
            TABLES
            ======================================================= */}
        <section className="dashboard-tables-grid">
          {/* =====================================================
              RECENT ORDERS
              ===================================================== */}
          <article className="dashboard-table-card">
            <div className="dashboard-table-header">
              <p className="dashboard-table-title">
                {t("dashboard.recent_orders")}
              </p>

              <div className="dashboard-table-icon">
                <i className="ti-stats-up"></i>
              </div>
            </div>

            {/* Desktop */}
            <div className="dashboard-table-desktop">
              <Table size="sm">
                <thead>
                  <tr>
                    <th>{t("dashboard.sales_number")}</th>

                    <th>{t("dashboard.order_date")}</th>

                    <th>{t("dashboard.status")}</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardData.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="dashboard-table-empty">
                        No Recent Orders
                      </td>
                    </tr>
                  ) : (
                    dashboardData.recentOrders.map((order, index) => {
                      const status = statusIdToText(order.transaction_status);

                      return (
                        <tr key={index}>
                          <td>
                            <button
                              type="button"
                              className="dashboard-order-link"
                              onClick={() =>
                                handleOrderClick(order.transaction_header_id)
                              }
                            >
                              {order.sales_number}
                            </button>
                          </td>

                          <td>{order.order_date}</td>

                          <td>
                            <div
                              className="dashboard-status"
                              style={{
                                color: status.color,
                              }}
                            >
                              <i
                                className={status.icon}
                                style={{
                                  color: status.color,
                                }}
                              ></i>

                              <span>
                                {t(
                                  "statuses." +
                                    status.text
                                      ?.toLowerCase()
                                      .replace(" ", "_"),
                                ) || status.text}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="dashboard-table-mobile">
              {dashboardData.recentOrders.length === 0 ? (
                <div className="dashboard-mobile-empty">No Recent Orders</div>
              ) : (
                dashboardData.recentOrders.map((order, index) => {
                  const status = statusIdToText(order.transaction_status);

                  return (
                    <button
                      type="button"
                      className="dashboard-mobile-order"
                      key={index}
                      onClick={() =>
                        handleOrderClick(order.transaction_header_id)
                      }
                    >
                      <div className="dashboard-mobile-order-header">
                        <span className="dashboard-mobile-number">
                          #{order.sales_number}
                        </span>

                        <span
                          className="dashboard-mobile-status"
                          style={{
                            color: status.color,
                            backgroundColor: `${status.color}15`,
                          }}
                        >
                          <i className={status.icon}></i>

                          {t(
                            "statuses." +
                              status.text?.toLowerCase().replace(" ", "_"),
                          ) || status.text}
                        </span>
                      </div>

                      <div className="dashboard-mobile-info">
                        <span>{t("dashboard.order_date")}</span>

                        <strong>{order.order_date}</strong>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </article>

          {/* =====================================================
              NEXT DELIVERIES
              ===================================================== */}
          <article className="dashboard-table-card">
            <div className="dashboard-table-header">
              <p className="dashboard-table-title">Next Deliveries Due</p>

              <div className="dashboard-table-icon">
                <i className="ti-truck"></i>
              </div>
            </div>

            {/* Desktop */}
            <div className="dashboard-table-desktop">
              <Table size="sm">
                <thead>
                  <tr>
                    <th>{t("dashboard.delivery_number")}</th>

                    <th>{t("dashboard.due_date")}</th>

                    <th>{t("dashboard.status")}</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardData.nextDeliveryDues.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="dashboard-table-empty">
                        {t("dashboard.no_recent_deliveries")}
                      </td>
                    </tr>
                  ) : (
                    dashboardData.nextDeliveryDues.map((delivery, index) => {
                      const status = statusIdToText(
                        delivery.transaction_status,
                      );

                      return (
                        <tr key={index}>
                          <td>{delivery.delivery_number}</td>

                          <td>{delivery.due_date}</td>

                          <td>
                            <div
                              className="dashboard-status"
                              style={{
                                color: status.color,
                              }}
                            >
                              <i
                                className={status.icon}
                                style={{
                                  color: status.color,
                                }}
                              ></i>

                              <span>
                                {t(
                                  "statuses." +
                                    status.text
                                      ?.toLowerCase()
                                      .replace(" ", "_"),
                                ) || status.text}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="dashboard-table-mobile">
              {dashboardData.nextDeliveryDues.length === 0 ? (
                <div className="dashboard-mobile-empty">
                  {t("dashboard.no_recent_deliveries")}
                </div>
              ) : (
                dashboardData.nextDeliveryDues.map((delivery, index) => {
                  const status = statusIdToText(delivery.transaction_status);

                  return (
                    <div className="dashboard-mobile-delivery" key={index}>
                      <div className="dashboard-mobile-delivery-header">
                        <span className="dashboard-mobile-number">
                          #{delivery.delivery_number}
                        </span>

                        <span
                          className="dashboard-mobile-status"
                          style={{
                            color: status.color,
                            backgroundColor: `${status.color}15`,
                          }}
                        >
                          <i className={status.icon}></i>

                          {t(
                            "statuses." +
                              status.text?.toLowerCase().replace(" ", "_"),
                          ) || status.text}
                        </span>
                      </div>

                      <div className="dashboard-mobile-info">
                        <span>{t("dashboard.due_date")}</span>

                        <strong>{delivery.due_date}</strong>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>

          {/* =====================================================
              OUTSTANDING PAYMENTS
              ===================================================== */}
          <article className="dashboard-table-card">
            <div className="dashboard-table-header">
              <p className="dashboard-table-title">
                {t("dashboard.outstanding_payment")}
              </p>

              <div className="dashboard-table-icon">
                <i className="ti-receipt"></i>
              </div>
            </div>

            {/* Desktop */}
            <div className="dashboard-table-desktop">
              <Table size="sm">
                <thead>
                  <tr>
                    <th>{t("dashboard.invoice_number")}</th>

                    <th>{t("dashboard.due_date")}</th>

                    <th>{t("dashboard.amount")}</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboardData.collectionHeaders.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="dashboard-table-empty">
                        No Outstanding Payments
                      </td>
                    </tr>
                  ) : (
                    dashboardData.collectionHeaders.map((collection, index) => (
                      <tr key={index}>
                        <td>{collection.invoice_number}</td>

                        <td>{collection.due_date}</td>

                        <td className="dashboard-payment-amount">
                          {collection.amount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="dashboard-table-mobile">
              {dashboardData.collectionHeaders.length === 0 ? (
                <div className="dashboard-mobile-empty">
                  No Outstanding Payments
                </div>
              ) : (
                dashboardData.collectionHeaders.map((collection, index) => (
                  <div className="dashboard-mobile-payment" key={index}>
                    <div className="dashboard-mobile-payment-header">
                      <span className="dashboard-mobile-number">
                        #{collection.invoice_number}
                      </span>

                      <strong>{collection.amount}</strong>
                    </div>

                    <div className="dashboard-mobile-info">
                      <span>{t("dashboard.due_date")}</span>

                      <strong>{collection.due_date}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        {/* =======================================================
            CHARTS
            ======================================================= */}
        <section className="dashboard-charts-grid">
          {/* =====================================================
              PRODUCTS SOLD BY CATEGORY
              ===================================================== */}
          <article className="dashboard-chart-card">
            <div className="dashboard-chart-header">
              <div className="dashboard-chart-icon">
                <i className="ti-flag-alt"></i>
              </div>

              <p className="dashboard-chart-title">
                {t("dashboard.products_sold_by_category")}
              </p>
            </div>

            {dashboardData.productsByCategory.length === 0 ? (
              <div className="dashboard-chart-empty">
                <p>{t("dashboard.no_products_sold")}</p>
              </div>
            ) : (
              <div className="dashboard-chart-container">
                <ApexChart
                  options={{
                    chart: {
                      id: "products-sold-by-category",
                    },
                    labels: dashboardData.productsByCategory.map(
                      (item) => item.category,
                    ),
                    legend: {
                      show: true,
                      position: "bottom",
                    },
                  }}
                  series={dashboardData.productsByCategory.map((item) =>
                    parseFloat(item.val),
                  )}
                  type="donut"
                  height={350}
                />
              </div>
            )}
          </article>

          {/* =====================================================
              TOP PRODUCTS BOUGHT
              ===================================================== */}
          <article className="dashboard-chart-card">
            <div className="dashboard-chart-header">
              <div className="dashboard-chart-icon">
                <i className="ti-package"></i>
              </div>

              <p className="dashboard-chart-title">
                {t("dashboard.top_products_bought")}
              </p>
            </div>

            {dashboardData.productSales.length === 0 ? (
              <div className="dashboard-chart-empty">
                <p>{t("dashboard.no_products_bought")}</p>
              </div>
            ) : (
              <div className="dashboard-product-list">
                {dashboardData.productSales.map((item, index) => (
                  <div className="dashboard-product-item" key={index}>
                    <div className="dashboard-product-info">
                      <Image
                        src={item.image_url || companyPlaceholder}
                        alt=""
                        width={50}
                        height={50}
                      />

                      <p>{item.item}</p>
                    </div>

                    <p
                      className={`dashboard-product-variation ${
                        item.variation >= 0
                          ? "dashboard-product-variation--positive"
                          : "dashboard-product-variation--negative"
                      }`}
                    >
                      {item.sold_quantity} {t("dashboard.sold")} (
                      {item.variation}%)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* =====================================================
              SEASONAL SALES VARIATION
              ===================================================== */}
          <article className="dashboard-chart-card">
            <div className="dashboard-chart-header">
              <div className="dashboard-chart-icon">
                <i className="ti-calendar"></i>
              </div>

              <p className="dashboard-chart-title">
                {t("dashboard.seasonal_sales_variation")}
              </p>
            </div>

            {dashboardData.seasonalVariation.length === 0 ? (
              <div className="dashboard-chart-empty">
                <p>{t("dashboard.no_products_sold")}</p>
              </div>
            ) : (
              <div className="dashboard-chart-container">
                <ApexChart
                  options={{
                    chart: {
                      id: "sales-variation",
                    },
                    xaxis: {
                      categories: dashboardData.seasonalVariation.map(
                        (item) => item.month,
                      ),
                    },
                  }}
                  series={[
                    {
                      name: t("dashboard.total_sales"),
                      data: dashboardData.seasonalVariation.map(
                        (item) => item.TotalSales,
                      ),
                    },
                    {
                      name: t("dashboard.total_returns"),
                      data: dashboardData.seasonalVariation.map(
                        (item) => item.TotalReturns,
                      ),
                    },
                  ]}
                  type="bar"
                  height={350}
                />
              </div>
            )}
          </article>
        </section>
      </div>
      <OrderDetailsModal
        orderId={selectedOrderId}
        show={showOrderDetails}
        onHide={handleCloseOrderDetails}
      />
    </Layout>
  );
};

export default Dashboard;
