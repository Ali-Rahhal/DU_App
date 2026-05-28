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

  return (
    <Layout>
      <AccountLayout
        title={t("open_invoices.title")}
        subTitle={t("open_invoices.subtitle")}
      >
        <div
          style={{ height: "500px", overflowY: "scroll", overflowX: "auto" }}
        >
          <table className="table open_invoices_table mb-0 ">
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
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="text-muted">
                      <i className="fa fa-invoice fa-3x mb-3"></i>
                      <p>{t("open_invoices.no_invoices")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const dueDate = new Date(invoice.due_date);
                  const currentDate = new Date();
                  const diff = dueDate.getTime() - currentDate.getTime();
                  const remainingDays = Math.ceil(diff / (1000 * 3600 * 24));
                  const type =
                    parseFloat(invoice.remaining_amount) < 0 ? "CN" : "SI";
                  const color =
                    type === "CN"
                      ? "#4dabf7"
                      : remainingDays < 0
                        ? "#ff8787"
                        : remainingDays < 7
                          ? "#ffd43b"
                          : "#69db7c";

                  return (
                    <tr key={invoice.order_no}>
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
                        {invoice.order_no}
                      </td>
                      <td
                        className="py-1"
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        {type === "CN"
                          ? t("open_invoices.credit_note")
                          : t("open_invoices.sales_invoice")}
                      </td>
                      <td
                        className="py-1"
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td
                        className="py-1"
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        {new Date(invoice.due_date).toLocaleDateString()}
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
                        {parseFloat(invoice.order_amount).toLocaleString()}
                      </td>
                      <td
                        className="py-1"
                        style={{
                          fontWeight: "bold",
                          width: "200px",
                        }}
                      >
                        {currenncyCodeToSymbol(invoice.currency)}{" "}
                        {parseFloat(invoice.remaining_amount).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <section
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            padding: 20,
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignContent: "center",
              alignItems: "flex-start",
              marginRight: 20,
              gap: 10,
              cursor: "pointer",
              textDecoration: !filters.includes(0) ? "line-through" : "none",
            }}
            onClick={() => {
              setFilters(
                filters.includes(0)
                  ? filters.filter((filter) => filter !== 0)
                  : [...filters, 0],
              );
            }}
          >
            <div
              style={{
                padding: 8,
                background: getFilterColor("moreThan7"),
              }}
            ></div>
            <p
              style={{
                fontSize: 12,
                cursor: "pointer",
                margin: 0,
              }}
            >
              {t("open_invoices.filters.due_more_than_7_days")}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignContent: "center",
              alignItems: "flex-start",
              marginRight: 20,
              gap: 10,
              textDecoration: !filters.includes(1) ? "line-through" : "none",
              cursor: "pointer",
            }}
            onClick={() => {
              setFilters(
                filters.includes(1)
                  ? filters.filter((filter) => filter !== 1)
                  : [...filters, 1],
              );
            }}
          >
            <div
              style={{
                padding: 8,
                background: getFilterColor("lessThan7"),
              }}
            ></div>
            <p
              style={{
                fontSize: 12,
                margin: 0,
              }}
            >
              {t("open_invoices.filters.due_less_than_7_days")}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignContent: "center",
              alignItems: "flex-start",
              marginRight: 20,
              gap: 10,
              cursor: "pointer",
              transition: "all 0.3s",
              textDecoration: !filters.includes(2) ? "line-through" : "none",
            }}
            onClick={() => {
              setFilters(
                filters.includes(2)
                  ? filters.filter((filter) => filter !== 2)
                  : [...filters, 2],
              );
            }}
          >
            <div
              style={{
                padding: 8,
                background: getFilterColor("pastDue"),
              }}
            ></div>
            <p
              style={{
                fontSize: 12,
                margin: 0,
              }}
            >
              {t("open_invoices.filters.past_due_date")}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignContent: "center",
              alignItems: "flex-start",
              marginRight: 20,
              gap: 10,
              cursor: "pointer",
              transition: "all 0.3s",
              textDecoration: !filters.includes(3) ? "line-through" : "none",
            }}
            onClick={() => {
              setFilters(
                filters.includes(3)
                  ? filters.filter((filter) => filter !== 3)
                  : [...filters, 3],
              );
            }}
          >
            <div
              style={{
                padding: 8,
                background: getFilterColor("credit"),
              }}
            ></div>
            <p
              style={{
                fontSize: 12,
                margin: 0,
              }}
            >
              {t("open_invoices.filters.credit")}
            </p>
          </div>
        </section>
      </AccountLayout>
    </Layout>
  );
};

export default OpenInvoices;
