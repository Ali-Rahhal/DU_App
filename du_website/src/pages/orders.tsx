import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { currenncyCodeToSymbol } from "@/utils";
import { getOrders } from "@/utils/apiCalls";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");

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

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timer);
  }, [barcode]);

  const getStatusBadgeClass = (status: number) => {
    switch (status) {
      case 3:
        return "bg-soft-warning";

      case 4:
        return "bg-soft-info";

      case 8:
        return "bg-soft-success";

      default:
        return "bg-soft-danger";
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
      <AccountLayout title={t("orders.title")} subTitle={t("orders.subtitle")}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            alignItems: "flex-end",
            gap: "10px",
          }}
        >
          <div style={{ width: "100%" }}>
            <label htmlFor="barcode" className="form-label">
              {t("orders.reference_no")}
            </label>

            <input
              name="barcode"
              type="text"
              placeholder={t("orders.reference_placeholder")}
              className="form-control input-lg rounded"
              style={{
                height: "40px",
              }}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="card d-none d-lg-block">
          <div
            className="table-responsive"
            style={{
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            <table className="table mb-0">
              <thead
                style={{
                  position: "sticky",
                  top: "0",
                  backgroundColor: "white",
                }}
              >
                <tr>
                  <th>{t("orders.table.order_number")}</th>

                  <th>{t("orders.table.category")}</th>

                  <th>{t("orders.table.date_purchased")}</th>

                  <th>{t("orders.table.status")}</th>

                  <th>{t("orders.table.total")}</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <div className="text-muted">
                        <i className="fa fa-shopping-bag fa-3x mb-3"></i>
                        <p>{t("orders.no_orders")}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3">
                        <Link
                          className="nav-link-style fw-medium fs-sm"
                          href={`/orders-details?id=${order.id}`}
                        >
                          {order.orderNb}
                        </Link>
                      </td>

                      <td className="py-3">{getBrandDescription(order)}</td>

                      <td className="py-3">{renderDate(order.creationDate)}</td>

                      <td className="py-3">
                        <span
                          className={`badge m-0 ${getStatusBadgeClass(order.status)}`}
                        >
                          {getTranslatedStatus(order)}
                        </span>
                      </td>

                      <td className="py-3">
                        {currenncyCodeToSymbol(order.currency_code)}{" "}
                        {parseFloat(order.total_amount).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Mobile Cards */}
        <div className="orders-mobile-view d-block d-lg-none">
          {orders.length === 0 ? (
            <div className="orders-mobile-empty-card">
              <div className="text-muted text-center py-5">
                <i className="fa fa-shopping-bag fa-3x mb-3"></i>

                <p>{t("orders.no_orders")}</p>
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders-details?id=${order.id}`}
                className="text-decoration-none"
              >
                <div className="orders-mobile-card">
                  <div className="orders-mobile-card-body">
                    {/* Header */}
                    <div className="orders-mobile-header">
                      <div className="orders-mobile-number">
                        #{order.orderNb}
                      </div>

                      <span
                        className={`badge orders-mobile-status ${getStatusBadgeClass(order.status)}`}
                      >
                        {getTranslatedStatus(order)}
                      </span>
                    </div>

                    {/* Information */}
                    <div className="orders-mobile-info">
                      <div className="orders-mobile-field">
                        <span className="orders-mobile-label">
                          {t("orders.table.category")}
                        </span>

                        <span className="orders-mobile-value">
                          {getBrandDescription(order)}
                        </span>
                      </div>

                      <div className="orders-mobile-field">
                        <span className="orders-mobile-label">
                          {t("orders.table.date_purchased")}
                        </span>

                        <span className="orders-mobile-value">
                          {renderDate(order.creationDate)}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="orders-mobile-footer">
                      <span className="orders-mobile-total-label">
                        {t("orders.table.total")}
                      </span>

                      <span className="orders-mobile-total">
                        {currenncyCodeToSymbol(order.currency_code)}{" "}
                        {parseFloat(order.total_amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default Orders;
