import OpenInvoice from "@/Models/OpenInvoice";
import Layout from "@/components/Layout/Layout";
import AccountLayout from "@/components/dashboard/AccountLayout";
import { currenncyCodeToSymbol } from "@/utils";
import { getOpenInvoices } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";

import React, { useEffect } from "react";

import { ALL_PERMISSIONS } from "@/utils/data";
import { useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAccountStore } from "@/store/zustand";

const OpenInvoices = () => {
  // Authorization Check:
  const rt = useRouter();
  const { role, checkPermission } = useAccountStore();
  const hasShownToast = useRef(false);
  const t = useTranslations();

  useEffect(() => {
    if (
      !checkPermission(ALL_PERMISSIONS.OpenInvoice) &&
      !hasShownToast.current
    ) {
      toast.error(t("open_invoices.no_permission"));
      hasShownToast.current = true;
      rt.push("/");
    }
  }, [role, t]);

  if (!checkPermission(ALL_PERMISSIONS.OpenInvoice)) return null;

  const [openInvoices, setOpenInvoices] = React.useState<OpenInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = React.useState<OpenInvoice[]>(
    [],
  );
  const [filters, setFilters] = React.useState<number[]>([0, 1, 2, 3]);

  useEffect(() => {
    getOpenInvoices()
      .then((res) => {
        setOpenInvoices(res.data.result);
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || t("open_invoices.fetch_error"),
        );
      });
  }, [t]);

  useEffect(() => {
    setFilteredInvoices(
      openInvoices.filter((invoice) => {
        const dueDate = new Date(invoice.due_date);
        const currentDate = new Date();
        const diff = dueDate.getTime() - currentDate.getTime();
        const remainingDays = Math.ceil(diff / (1000 * 3600 * 24));
        const type = parseFloat(invoice.remaining_amount) < 0 ? "CN" : "SI";

        if (filters.includes(0) && remainingDays > 7 && type === "SI") {
          return true;
        }
        if (
          filters.includes(1) &&
          remainingDays < 7 &&
          remainingDays > 0 &&
          type === "SI"
        ) {
          return true;
        }
        if (filters.includes(2) && remainingDays < 0 && type === "SI") {
          return true;
        }
        if (filters.includes(3) && type === "CN") {
          return true;
        }
        return false;
      }),
    );
  }, [filters, openInvoices]);

  const getFilterColor = (filterType: string) => {
    switch (filterType) {
      case "moreThan7":
        return "#69db7c";
      case "lessThan7":
        return "#ffd43b";
      case "pastDue":
        return "#ff8787";
      case "credit":
        return "#4dabf7";
      default:
        return "#69db7c";
    }
  };

  const getInvoiceType = (invoice: OpenInvoice) => {
    return parseFloat(invoice.remaining_amount) < 0 ? "CN" : "SI";
  };

  const getInvoiceColor = (invoice: OpenInvoice) => {
    const type = getInvoiceType(invoice);

    if (type === "CN") {
      return "#4dabf7";
    }

    const dueDate = new Date(invoice.due_date);
    const currentDate = new Date();

    const diff = dueDate.getTime() - currentDate.getTime();

    const remainingDays = Math.ceil(diff / (1000 * 3600 * 24));

    if (remainingDays < 0) {
      return "#ff8787";
    }

    if (remainingDays < 7) {
      return "#ffd43b";
    }

    return "#69db7c";
  };

  const getRemainingDays = (invoice: OpenInvoice) => {
    const dueDate = new Date(invoice.due_date);
    const currentDate = new Date();

    const diff = dueDate.getTime() - currentDate.getTime();

    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <Layout>
      <AccountLayout
        title={t("open_invoices.title")}
        subTitle={t("open_invoices.subtitle")}
      >
        <section className="open-invoices-filters">
          <div
            className={`open-invoices-filter-item ${
              !filters.includes(0) ? "disabled" : ""
            }`}
            onClick={() => {
              setFilters((prev) =>
                prev.includes(0) ? prev.filter((f) => f !== 0) : [...prev, 0],
              );
            }}
          >
            <span
              className="open-invoices-filter-color"
              style={{
                backgroundColor: getFilterColor("moreThan7"),
              }}
            />

            <span>{t("open_invoices.filters.due_more_than_7_days")}</span>
          </div>

          <div
            className={`open-invoices-filter-item ${
              !filters.includes(1) ? "disabled" : ""
            }`}
            onClick={() => {
              setFilters((prev) =>
                prev.includes(1) ? prev.filter((f) => f !== 1) : [...prev, 1],
              );
            }}
          >
            <span
              className="open-invoices-filter-color"
              style={{
                backgroundColor: getFilterColor("lessThan7"),
              }}
            />

            <span>{t("open_invoices.filters.due_less_than_7_days")}</span>
          </div>

          <div
            className={`open-invoices-filter-item ${
              !filters.includes(2) ? "disabled" : ""
            }`}
            onClick={() => {
              setFilters((prev) =>
                prev.includes(2) ? prev.filter((f) => f !== 2) : [...prev, 2],
              );
            }}
          >
            <span
              className="open-invoices-filter-color"
              style={{
                backgroundColor: getFilterColor("pastDue"),
              }}
            />

            <span>{t("open_invoices.filters.past_due_date")}</span>
          </div>

          <div
            className={`open-invoices-filter-item ${
              !filters.includes(3) ? "disabled" : ""
            }`}
            onClick={() => {
              setFilters(
                filters.includes(3)
                  ? filters.filter((filter) => filter !== 3)
                  : [...filters, 3],
              );
            }}
          >
            <span
              className="open-invoices-filter-color"
              style={{
                backgroundColor: getFilterColor("credit"),
              }}
            />

            <span>{t("open_invoices.filters.credit")}</span>
          </div>
        </section>

        {/* Desktop Table */}
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
                  <th>{t("open_invoices.table.order_no")}</th>
                  <th>{t("open_invoices.table.type")}</th>
                  <th>{t("open_invoices.table.invoice_date")}</th>
                  <th>{t("open_invoices.table.due_date")}</th>
                  <th>{t("open_invoices.table.currency")}</th>
                  <th>{t("open_invoices.table.order_amount")}</th>
                  <th>{t("open_invoices.table.remaining_amount")}</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => {
                  const type = getInvoiceType(invoice);
                  const color = getInvoiceColor(invoice);

                  return (
                    <tr key={invoice.order_no}>
                      <td
                        className="py-3"
                        style={{
                          fontWeight: "bold",
                          borderLeft: `4px solid ${color}`,
                        }}
                      >
                        {invoice.order_no}
                      </td>

                      <td className="fw-bold">
                        {type === "CN"
                          ? t("open_invoices.credit_note")
                          : t("open_invoices.sales_invoice")}
                      </td>

                      <td className="fw-bold">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>

                      <td className="fw-bold">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>

                      <td className="fw-bold">{invoice.currency}</td>

                      <td className="fw-bold">
                        {currenncyCodeToSymbol(invoice.currency)}{" "}
                        {parseFloat(invoice.order_amount).toLocaleString()}
                      </td>

                      <td className="fw-bold">
                        {currenncyCodeToSymbol(invoice.currency)}{" "}
                        {parseFloat(invoice.remaining_amount).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Mobile Cards */}

        <div className="d-block d-lg-none open-invoices-mobile-view">
          {filteredInvoices.length === 0 ? (
            <div className="open-invoices-mobile-empty">
              <i className="fa fa-invoice fa-3x mb-3"></i>

              <p>{t("open_invoices.no_invoices")}</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => {
              const type = getInvoiceType(invoice);
              const color = getInvoiceColor(invoice);
              const remainingDays = getRemainingDays(invoice);

              return (
                <div
                  key={invoice.order_no}
                  className="open-invoices-mobile-card"
                  style={{
                    borderLeft: `5px solid ${color}`,
                  }}
                >
                  <div className="open-invoices-mobile-card-body">
                    <div className="open-invoices-mobile-header">
                      <div>
                        <div className="open-invoices-mobile-order">
                          #{invoice.order_no}
                        </div>

                        <div className="open-invoices-mobile-type">
                          {type === "CN"
                            ? t("open_invoices.credit_note")
                            : t("open_invoices.sales_invoice")}
                        </div>
                      </div>

                      <div
                        className="open-invoices-mobile-status-dot"
                        style={{
                          backgroundColor: color,
                        }}
                      />
                    </div>

                    <div className="open-invoices-mobile-info">
                      <div className="open-invoices-mobile-field">
                        <span>{t("open_invoices.table.invoice_date")}</span>

                        <strong>
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </strong>
                      </div>

                      <div className="open-invoices-mobile-field">
                        <span>{t("open_invoices.table.due_date")}</span>

                        <strong>
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </strong>
                      </div>

                      <div className="open-invoices-mobile-field">
                        <span>{t("open_invoices.table.currency")}</span>

                        <strong>{invoice.currency}</strong>
                      </div>
                    </div>

                    <div className="open-invoices-mobile-footer">
                      <div>
                        <small>{t("open_invoices.table.order_amount")}</small>

                        <strong>
                          {currenncyCodeToSymbol(invoice.currency)}{" "}
                          {parseFloat(invoice.order_amount).toLocaleString()}
                        </strong>
                      </div>

                      <div className="text-end">
                        <small>
                          {t("open_invoices.table.remaining_amount")}
                        </small>

                        <strong>
                          {currenncyCodeToSymbol(invoice.currency)}{" "}
                          {parseFloat(
                            invoice.remaining_amount,
                          ).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {type === "SI" && (
                      <div className="open-invoices-mobile-days">
                        {remainingDays >= 0
                          ? `${remainingDays} days remaining`
                          : `${Math.abs(remainingDays)} days overdue`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default OpenInvoices;
