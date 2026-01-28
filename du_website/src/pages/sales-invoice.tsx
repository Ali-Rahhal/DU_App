import SalesInvoiceModel from "@/Models/SalesInvoice";
import Layout from "@/components/Layout/Layout";
import AccountLayout from "@/components/dashboard/AccountLayout";
import { currenncyCodeToSymbol } from "@/utils";
import { getSalesOrder } from "@/utils/apiCalls";
import dynamic from "next/dynamic";
import { exportInvoice } from "@/utils/pdfUtils";

import React, { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
// order_no: string;
//   invoice_date: string;
//   due_date: string;
//   currency: string;
//   order_amount: string;
//   remaining_amount: string;

const SalesInvoice = () => {
  const [salesOrders, setSalesOrders] = React.useState<SalesInvoiceModel[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  //   const [filteredInvoices, setFilteredInvoices] = React.useState<
  //     SalesInvoiceModel[]
  //   >([]);
  const [filters, setFilters] = React.useState<number[]>([0, 1, 2]);
  useEffect(() => {
    getSalesOrder().then((res) => {
      console.log(res.data);
      setSalesOrders(res.data.result);
    });
  }, []);

  //   useEffect(() => {
  //     const d = salesOrders.filter((invoice) => {
  //       if (filters.includes(0) && invoice.is_paid === "yes") return true;
  //       if (filters.includes(1) && invoice.is_paid === "partial") return true;
  //       if (filters.includes(2) && invoice.is_paid === "no") return true;
  //       return false;
  //     });
  //     console.log(d);
  //     setFilteredInvoices((p) => d);
  //   }, [filters, salesOrders]);
  const filteredInvoices = useMemo(() => {
    return salesOrders.filter((invoice) => {
      if (filters.includes(0) && invoice.is_paid === "yes") return true;
      if (filters.includes(1) && invoice.is_paid === "partial") return true;
      if (filters.includes(2) && invoice.is_paid === "no") return true;
      return false;
    });
  }, [filters, salesOrders]);
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
            color="#4e97fd"
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
          title="Sales Invoices"
          subTitle="You have full control to manage your own Account."
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
                  <th>Invoice No </th>
                  <th>Invoice No (Oracle)</th>

                  <th>Invoice Date</th>

                  <th>Currency</th>
                  <th>Order Amount</th>
                  <th>Remaining Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  // const dueDate = new Date(invoice.due_date);
                  // const currentDate = new Date();
                  // const diff = dueDate.getTime() - currentDate.getTime();
                  // const remainingDays = Math.ceil(diff / (1000 * 3600 * 24));
                  // const type =
                  //   parseFloat(invoice.remaining_amount) < 0 ? "CN" : "SI";
                  // const color =
                  //   type === "CN"
                  //     ? "#4dabf7"
                  //     : remainingDays < 0
                  //     ? "#ff8787"
                  //     : remainingDays < 7
                  //     ? "#ffd43b"
                  //     : "#69db7c";
                  const color =
                    invoice.is_paid === "yes"
                      ? "#7cd3be"
                      : invoice.is_paid === "partial"
                      ? "#71c0ef"
                      : "#ff8787";
                  return (
                    <tr key={invoice.oracle_number}>
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
                        {new Date(invoice.date_added).toLocaleDateString()}
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
                        {parseFloat(invoice.remaining_amount).toLocaleString()}
                      </td>
                      <td className="py-1">
                        <i
                          className="fa Example of file-pdf-o fa-file-pdf-o "
                          onClick={() => {
                            setLoading(true);
                            exportInvoice(invoice).then(() => {
                              toast.success("Invoice Exported Successfully");
                              setLoading(false);
                            });
                          }}
                          style={{
                            fontSize: 20,
                            color: "green",
                            cursor: "pointer",
                          }}
                        ></i>
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
                Paid
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
                  background: "#4dabf7",
                }}
              ></div>
              <p
                style={{
                  fontSize: 12,
                }}
              >
                Partially Paid
              </p>
            </div>{" "}
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
                Un-Paid
              </p>
            </div>
          </section>
        </AccountLayout>
      </Layout>
    </>
  );
};

export default SalesInvoice;
