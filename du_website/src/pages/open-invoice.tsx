import OpenInvoice from "@/Models/OpenInvoice";
import Layout from "@/components/Layout/Layout";
import AccountLayout from "@/components/dashboard/AccountLayout";
import { currenncyCodeToSymbol } from "@/utils";
import { getOpenInvoices } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";

import React, { useEffect } from "react";

// order_no: string;
//   invoice_date: string;
//   due_date: string;
//   currency: string;
//   order_amount: string;
//   remaining_amount: string;

const OpenInvoices = () => {
  const t = useTranslations();
  const [openInvoices, setOpenInvoices] = React.useState<OpenInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = React.useState<OpenInvoice[]>(
    []
  );
  const [filters, setFilters] = React.useState<number[]>([0, 1, 2, 3]);
  useEffect(() => {
    getOpenInvoices().then((res) => {
      setOpenInvoices(res.data.result);
    });
  }, []);

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
      })
    );
  }, [filters, openInvoices]);

  return (
    <Layout>
      <AccountLayout
        title={t("open_invoices")}
        // subTitle="You have full control to manage your own Account."
        subTitle={t("you_have_full_control_to_manage_your_own_account")}
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
              }}
            >
              <tr>
                <th>Order No</th>
                <th>Type</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Currency</th>
                <th>Order Amount</th>
                <th>Remaining Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => {
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
                      className="py-3 "
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
                      {type}
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
              })}
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
                  : [...filters, 0]
              );
            }}
          >
            <div
              style={{
                padding: 8,
                background: "#69db7c",
              }}
            ></div>
            <p
              style={{
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Due in more than 7 days
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
            }}
            onClick={() => {
              setFilters(
                filters.includes(1)
                  ? filters.filter((filter) => filter !== 1)
                  : [...filters, 1]
              );
            }}
          >
            <div
              style={{
                padding: 8,
                background: "#ffd43b",
              }}
            ></div>
            <p
              style={{
                fontSize: 12,
              }}
            >
              Due in Less than 7 days
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
                  : [...filters, 2]
              );
            }}
          >
            <div
              style={{
                padding: 8,
                background: "#ff8787",
              }}
            ></div>
            <p
              style={{
                fontSize: 12,
              }}
            >
              Past Due Date
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
                  : [...filters, 3]
              );
            }}
          >
            <div
              style={{
                padding: 8,
                background: "#4dabf7",
              }}
            ></div>
            <p
              style={{
                fontSize: 12,
              }}
            >
              Credit
            </p>
          </div>
        </section>
      </AccountLayout>
    </Layout>
  );
};

export default OpenInvoices;
