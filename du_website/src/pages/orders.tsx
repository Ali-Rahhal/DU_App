import Layout from "@/components/Layout/Layout";
import { currenncyCodeToSymbol } from "@/utils";
import { getOrders } from "@/utils/apiCalls";
import OrderDetailsModal from "@/components/ordersPage/OrderDetailsModal";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";

import {
  Search,
  ShoppingBag,
  CalendarDays,
  Tag,
  ChevronRight,
} from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const t = useTranslations();
  const { companyHydrated, companyId } = useCompanyAssets();

  const fetchOrders = async () => {
    await getOrders(barcode)
      .then((res) => {
        setOrders(res.data.result);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || t("orders.fetch_error"));
      });
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrderId(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timer);
  }, [barcode]);

  const getStatusBadgeClass = (status: number) => {
    switch (status) {
      case 3:
        return "orders-status-warning";

      case 4:
        return "orders-status-info";

      case 8:
        return "orders-status-success";

      default:
        return "orders-status-danger";
    }
  };

  const getBrandDescription = (order: any) => {
    if (companyHydrated && companyId === "VI") {
      if (
        order.brand_description.includes("Non Pharma") ||
        order.brand_description.includes("Pharma") ||
        order.brand_description.includes("Para Pharma")
      ) {
        return t("orders.other");
      }
    }

    return order.brand_description;
  };

  const getTranslatedStatus = (order: any) => {
    if (order.status_text.includes("Awaiting Approval")) {
      return t("orders.awaiting_approval");
    }

    if (order.status_text.includes("Awaiting Delivery")) {
      return t("orders.awaiting_delivery");
    }

    if (order.status_text.includes("Delivered")) {
      return t("orders.delivered");
    }

    if (order.status_text.includes("Rejected")) {
      return t("orders.rejected");
    }

    return t("orders.awaiting_approval");
  };

  const renderDate = (date: string) => {
    return new Date(date).toLocaleString(t("orders.locale"), {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className="orders-page">
        {/* =====================================================
            PAGE HEADER
            ===================================================== */}

        <section className="orders-page-header">
          <div className="orders-page-header-content">
            <div className="orders-page-header-icon">
              <ShoppingBag size={24} />
            </div>

            <div className="orders-page-heading">
              <h1 className="orders-page-title">{t("orders.title")}</h1>

              <p className="orders-page-subtitle">{t("orders.subtitle")}</p>
            </div>
          </div>
        </section>

        {/* =====================================================
            SEARCH
            ===================================================== */}

        <section className="orders-search-card">
          <div className="orders-search-header">
            <div className="orders-search-icon">
              <Search size={19} />
            </div>

            <div>
              <h2 className="orders-search-title">
                {t("orders.reference_no")}
              </h2>

              <p className="orders-search-description">
                {t("orders.reference_placeholder")}
              </p>
            </div>
          </div>

          <div className="orders-search-field">
            <Search size={18} className="orders-search-field-icon" />

            <input
              id="barcode"
              name="barcode"
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder={t("orders.reference_placeholder")}
              className="orders-search-input"
            />

            {barcode && (
              <button
                type="button"
                className="orders-search-clear"
                onClick={() => setBarcode("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </section>

        {/* =====================================================
            ORDERS TABLE
            ===================================================== */}

        <section className="orders-results-section">
          {/* Desktop */}
          <div className="orders-table-container d-none d-lg-block">
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead className="orders-table-head">
                  <tr>
                    <th>{t("orders.table.order_number")}</th>

                    <th>{t("orders.table.category")}</th>

                    <th>{t("orders.table.date_purchased")}</th>

                    <th>{t("orders.table.status")}</th>

                    <th>{t("orders.table.total")}</th>

                    <th className="orders-table-action-column" />
                  </tr>
                </thead>

                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="orders-table-empty">
                        <div className="orders-empty-state">
                          <div className="orders-empty-icon">
                            <ShoppingBag size={30} />
                          </div>

                          <h3 className="orders-empty-title">
                            {t("orders.no_orders")}
                          </h3>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="orders-table-row"
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <td>
                          <span className="orders-order-number">
                            #{order.orderNb}
                          </span>
                        </td>

                        <td>
                          <div className="orders-category">
                            <Tag size={16} />
                            <span>{getBrandDescription(order)}</span>
                          </div>
                        </td>

                        <td>
                          <div className="orders-date">
                            <CalendarDays size={16} />
                            <span>{renderDate(order.creationDate)}</span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`orders-status-badge ${getStatusBadgeClass(
                              order.status,
                            )}`}
                          >
                            {getTranslatedStatus(order)}
                          </span>
                        </td>

                        <td>
                          <span className="orders-total">
                            {currenncyCodeToSymbol(order.currency_code)}{" "}
                            {parseFloat(order.total_amount).toLocaleString()}
                          </span>
                        </td>

                        <td className="orders-table-action-column">
                          <ChevronRight
                            size={18}
                            className="orders-row-arrow"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* =================================================
              MOBILE
              ================================================= */}

          <div className="orders-mobile-list d-block d-lg-none">
            {orders.length === 0 ? (
              <div className="orders-mobile-empty">
                <div className="orders-empty-icon">
                  <ShoppingBag size={30} />
                </div>

                <h3 className="orders-empty-title">{t("orders.no_orders")}</h3>
              </div>
            ) : (
              orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className="orders-mobile-card"
                  onClick={() => handleOrderClick(order.id)}
                >
                  <div className="orders-mobile-card-header">
                    <span className="orders-mobile-number">
                      #{order.orderNb}
                    </span>

                    <span
                      className={`orders-status-badge ${getStatusBadgeClass(
                        order.status,
                      )}`}
                    >
                      {getTranslatedStatus(order)}
                    </span>
                  </div>

                  <div className="orders-mobile-details">
                    <div className="orders-mobile-detail">
                      <div className="orders-mobile-detail-label">
                        <Tag size={14} />
                        <span>{t("orders.table.category")}</span>
                      </div>

                      <span className="orders-mobile-detail-value">
                        {getBrandDescription(order)}
                      </span>
                    </div>

                    <div className="orders-mobile-detail">
                      <div className="orders-mobile-detail-label">
                        <CalendarDays size={14} />
                        <span>{t("orders.table.date_purchased")}</span>
                      </div>

                      <span className="orders-mobile-detail-value">
                        {renderDate(order.creationDate)}
                      </span>
                    </div>
                  </div>

                  <div className="orders-mobile-footer">
                    <div>
                      <span className="orders-mobile-total-label">
                        {t("orders.table.total")}
                      </span>

                      <span className="orders-mobile-total">
                        {currenncyCodeToSymbol(order.currency_code)}{" "}
                        {parseFloat(order.total_amount).toLocaleString()}
                      </span>
                    </div>

                    <ChevronRight size={20} className="orders-mobile-arrow" />
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <OrderDetailsModal
          orderId={selectedOrderId}
          show={showOrderDetails}
          onHide={handleCloseOrderDetails}
        />
      </div>
    </Layout>
  );
};

export default Orders;
