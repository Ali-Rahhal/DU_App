import SalesInvoiceModel from "@/Models/SalesInvoice";
import Layout from "@/components/Layout/Layout";
import AccountLayout from "@/components/dashboard/AccountLayout";
import { currenncyCodeToSymbol } from "@/utils";
import { getSalesOrder } from "@/utils/apiCalls";
import { exportInvoice } from "@/utils/pdfUtils";
import { useTranslations } from "next-intl";

import React, { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";

import { ALL_PERMISSIONS } from "@/utils/data";
import { useRef } from "react";
import { useRouter } from "next/router";
import { useAccountStore } from "@/store/zustand";

const SalesInvoice = () => {
  // Authorization Check:
  const rt = useRouter();
  const { role, checkPermission } = useAccountStore();
  const hasShownToast = useRef(false);
  const t = useTranslations();

  useEffect(() => {
    if (
      !checkPermission(ALL_PERMISSIONS.SalesInvoice) &&
      !hasShownToast.current
    ) {
      toast.error(t("sales_invoice.no_permission"));
      hasShownToast.current = true;
      rt.push("/");
    }
  }, [role, t]);

  if (!checkPermission(ALL_PERMISSIONS.SalesInvoice)) return null;

  const [salesOrders, setSalesOrders] = React.useState<SalesInvoiceModel[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [filters, setFilters] = React.useState<number[]>([0, 1, 2]);

  useEffect(() => {
    getSalesOrder()
      .then((res) => {
        setSalesOrders(res.data.result);
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || t("sales_invoice.fetch_error"),
        );
      });
  }, [t]);

  const filteredInvoices = useMemo(() => {
    return salesOrders.filter((invoice) => {
      if (filters.includes(0) && invoice.is_paid === "yes") return true;
      if (filters.includes(1) && invoice.is_paid === "partial") return true;
      if (filters.includes(2) && invoice.is_paid === "no") return true;
      return false;
    });
  }, [filters, salesOrders]);

  const getPaymentStatusColor = (isPaid: string) => {
    switch (isPaid) {
      case "yes":
        return "#69db7c";
      case "partial":
        return "#4dabf7";
      case "no":
        return "#ff8787";
      default:
        return "#69db7c";
    }
  };

  const getPaymentStatusText = (isPaid: string) => {
    switch (isPaid) {
      case "yes":
        return t("sales_invoice.paid");
      case "partial":
        return t("sales_invoice.partially_paid");
      case "no":
        return t("sales_invoice.unpaid");
      default:
        return t("sales_invoice.paid");
    }
  };

  return (
    <>
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1000,
            backgroundColor: "rgba(255,255,255,0.4)",
          }}
        >
          <Spinner
            color="#2b2a88"
            variant="primary"
            style={{
              width: "150px",
              height: "150px",
            }}
          />
        </div>
      )}
      <Layout>
        <AccountLayout
          title={t("sales_invoice.title")}
          subTitle={t("sales_invoice.subtitle")}
        >
          <section className="sales-invoices-filters">
            <div
              className={`sales-invoices-filter-item ${
                !filters.includes(0) ? "disabled" : ""
              }`}
              onClick={() => {
                setFilters((prev) =>
                  prev.includes(0) ? prev.filter((f) => f !== 0) : [...prev, 0],
                );
              }}
            >
              <span
                className="sales-invoices-filter-color"
                style={{
                  backgroundColor: getPaymentStatusColor("yes"),
                }}
              />

              <span>{t("sales_invoice.filters.paid")}</span>
            </div>

            <div
              className={`sales-invoices-filter-item ${
                !filters.includes(1) ? "disabled" : ""
              }`}
              onClick={() => {
                setFilters((prev) =>
                  prev.includes(1) ? prev.filter((f) => f !== 1) : [...prev, 1],
                );
              }}
            >
              <span
                className="sales-invoices-filter-color"
                style={{
                  backgroundColor: getPaymentStatusColor("partial"),
                }}
              />

              <span>{t("sales_invoice.filters.partially_paid")}</span>
            </div>

            <div
              className={`sales-invoices-filter-item ${
                !filters.includes(2) ? "disabled" : ""
              }`}
              onClick={() => {
                setFilters((prev) =>
                  prev.includes(2) ? prev.filter((f) => f !== 2) : [...prev, 2],
                );
              }}
            >
              <span
                className="sales-invoices-filter-color"
                style={{
                  backgroundColor: getPaymentStatusColor("no"),
                }}
              />

              <span>{t("sales_invoice.filters.unpaid")}</span>
            </div>
          </section>
          <div className="d-none d-lg-block">
            <div
              style={{
                height: "500px",
                overflowY: "scroll",
                overflowX: "auto",
              }}
            >
              <table className="table open_invoices_table mb-0">
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    backgroundColor: "white",
                  }}
                >
                  <tr>
                    <th>{t("sales_invoice.table.invoice_no")}</th>
                    <th>{t("sales_invoice.table.oracle_invoice_no")}</th>
                    <th>{t("sales_invoice.table.invoice_date")}</th>
                    <th>{t("sales_invoice.table.currency")}</th>
                    <th>{t("sales_invoice.table.order_amount")}</th>
                    <th>{t("sales_invoice.table.remaining_amount")}</th>
                    <th>{t("sales_invoice.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5">
                        <div className="text-muted">
                          <i className="fa fa-file-invoice fa-3x mb-3"></i>
                          <p>{t("sales_invoice.no_invoices")}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => {
                      const color = getPaymentStatusColor(invoice.is_paid);

                      return (
                        <tr key={invoice.invoice_no}>
                          <td
                            className="py-3"
                            style={{
                              fontWeight: "bold",
                              position: "relative",
                              paddingLeft: "20px",
                            }}
                          >
                            <div
                              style={{
                                borderLeft: `3px solid ${color}`,
                                margin: 10,
                                width: "1px",
                                height: "34px",
                                position: "absolute",
                                top: 0,
                                left: 0,
                              }}
                            ></div>
                            {invoice.oracle_number}
                          </td>
                          <td
                            className="py-1"
                            style={{
                              fontWeight: "bold",
                            }}
                          >
                            {invoice.invoice_no}
                          </td>
                          <td
                            className="py-1"
                            style={{
                              fontWeight: "bold",
                            }}
                          >
                            {new Date(invoice.date_added).toLocaleDateString(
                              t("sales_invoice.locale"),
                            )}
                          </td>
                          <td
                            className="py-1"
                            style={{
                              fontWeight: "bold",
                            }}
                          >
                            {invoice.currency}
                          </td>
                          <td
                            className="py-1"
                            style={{
                              fontWeight: "bold",
                              width: "200px",
                            }}
                          >
                            {currenncyCodeToSymbol(invoice.currency)}{" "}
                            {parseFloat(invoice.total_amount).toLocaleString()}
                          </td>
                          <td
                            className="py-1"
                            style={{
                              fontWeight: "bold",
                              width: "200px",
                            }}
                          >
                            {currenncyCodeToSymbol(invoice.currency)}{" "}
                            {parseFloat(
                              invoice.remaining_amount,
                            ).toLocaleString()}
                          </td>
                          <td className="py-1">
                            <i
                              className="fa fa-file-pdf-o"
                              onClick={() => {
                                setLoading(true);
                                exportInvoice(invoice)
                                  .then(() => {
                                    toast.success(
                                      t("sales_invoice.export_success"),
                                    );
                                    setLoading(false);
                                  })
                                  .catch((error) => {
                                    toast.error(
                                      error?.message ||
                                        t("sales_invoice.export_error"),
                                    );
                                    setLoading(false);
                                  });
                              }}
                              style={{
                                fontSize: 20,
                                color: "green",
                                cursor: "pointer",
                              }}
                              title={t("sales_invoice.export_pdf")}
                            ></i>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="d-block d-lg-none sales-invoices-mobile-view">
            {filteredInvoices.length === 0 ? (
              <div className="sales-invoices-mobile-empty">
                <i className="fa fa-file-invoice fa-3x mb-3"></i>

                <p>{t("sales_invoice.no_invoices")}</p>
              </div>
            ) : (
              filteredInvoices.map((invoice) => {
                const color = getPaymentStatusColor(invoice.is_paid);

                return (
                  <div
                    key={invoice.invoice_no}
                    className="sales-invoices-mobile-card"
                    style={{
                      borderLeft: `5px solid ${color}`,
                    }}
                  >
                    <div className="sales-invoices-mobile-card-body">
                      {/* Header */}

                      <div className="sales-invoices-mobile-header">
                        <div>
                          <div className="sales-invoices-mobile-number">
                            #{invoice.oracle_number}
                          </div>

                          <div className="sales-invoices-mobile-status">
                            {getPaymentStatusText(invoice.is_paid)}
                          </div>
                        </div>

                        <div
                          className="sales-invoices-mobile-status-dot"
                          style={{
                            backgroundColor: color,
                          }}
                        />
                      </div>

                      {/* Details */}

                      <div className="sales-invoices-mobile-info">
                        <div className="sales-invoices-mobile-field">
                          <span>
                            {t("sales_invoice.table.oracle_invoice_no")}
                          </span>

                          <strong>{invoice.invoice_no}</strong>
                        </div>

                        <div className="sales-invoices-mobile-field">
                          <span>{t("sales_invoice.table.invoice_date")}</span>

                          <strong>
                            {new Date(invoice.date_added).toLocaleDateString(
                              t("sales_invoice.locale"),
                            )}
                          </strong>
                        </div>

                        <div className="sales-invoices-mobile-field">
                          <span>{t("sales_invoice.table.currency")}</span>

                          <strong>{invoice.currency}</strong>
                        </div>
                      </div>

                      {/* Amounts */}

                      <div className="sales-invoices-mobile-footer">
                        <div>
                          <small>{t("sales_invoice.table.order_amount")}</small>

                          <strong>
                            {currenncyCodeToSymbol(invoice.currency)}{" "}
                            {parseFloat(invoice.total_amount).toLocaleString()}
                          </strong>
                        </div>

                        <div className="text-end">
                          <small>
                            {t("sales_invoice.table.remaining_amount")}
                          </small>

                          <strong>
                            {currenncyCodeToSymbol(invoice.currency)}{" "}
                            {parseFloat(
                              invoice.remaining_amount,
                            ).toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      <button
                        className="sales-invoices-mobile-pdf"
                        onClick={() => {
                          setLoading(true);

                          exportInvoice(invoice)
                            .then(() => {
                              toast.success(t("sales_invoice.export_success"));

                              setLoading(false);
                            })
                            .catch((error) => {
                              toast.error(
                                error?.message ||
                                  t("sales_invoice.export_error"),
                              );

                              setLoading(false);
                            });
                        }}
                      >
                        <i className="fa fa-file-pdf-o me-2"></i>

                        {t("sales_invoice.export_pdf")}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </AccountLayout>
      </Layout>
    </>
  );
};

export default SalesInvoice;
