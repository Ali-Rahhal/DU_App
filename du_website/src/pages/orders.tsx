import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { currenncyCodeToSymbol } from "@/utils";
import { getOrders } from "@/utils/apiCalls";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { Modal } from "react-bootstrap";
import { useTranslations } from "next-intl";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [openBarcodeScanner, setOpenBarcodeScanner] = useState(false);
  const t = useTranslations();

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
    const t = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => {
      t && clearTimeout(t);
    };
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
          <div
            style={{
              width: "100%",
            }}
          >
            <label htmlFor="barcode" className="form-label">
              {t("orders.reference_no")}
            </label>
            <input
              name="barcode"
              required
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

        <div className="card">
          <div
            className="table-responsive"
            style={{
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            <table className="table mb-0 ">
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
                  orders.map((order) => {
                    let tempBrandDescription = "";
                    if (
                      order.brand_description.includes("Non Pharma") ||
                      order.brand_description.includes("Pharma") ||
                      order.brand_description.includes("Para Pharma")
                    ) {
                      tempBrandDescription = "Other";
                    } else {
                      tempBrandDescription = order.brand_description;
                    }

                    let translatedStatus = "";
                    if (order.status_text.includes("Awaiting Approval")) {
                      translatedStatus = t("orders.awaiting_approval");
                    } else if (
                      order.status_text.includes("Awaiting Delivery")
                    ) {
                      translatedStatus = t("orders.awaiting_delivery");
                    } else if (order.status_text.includes("Delivered")) {
                      translatedStatus = t("orders.delivered");
                    } else if (order.status_text.includes("Rejected")) {
                      translatedStatus = t("orders.rejected");
                    } else {
                      translatedStatus = t("orders.awaiting_approval");
                    }

                    return (
                      <tr key={order.id}>
                        <td className="py-3">
                          <Link
                            className="nav-link-style fw-medium fs-sm"
                            href={`/orders-details?id=${order.id}`}
                          >
                            {order.orderNb}
                          </Link>
                        </td>
                        <td className="py-3">{tempBrandDescription}</td>
                        <td className="py-3">
                          {new Date(order.creationDate).toLocaleString(
                            t("orders.locale"),
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="py-3">
                          <span
                            className={`badge m-0 ${getStatusBadgeClass(order.status)}`}
                          >
                            {translatedStatus}
                          </span>
                        </td>
                        <td className="py-3">
                          <span>
                            {currenncyCodeToSymbol(order.currency_code)}{" "}
                            {parseFloat(order.total_amount).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default Orders;
