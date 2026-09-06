import React, { useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { FileText, Receipt, Download } from "lucide-react";

import SalesInvoiceModel from "@/Models/SalesInvoice";
import Layout from "@/components/Layout/Layout";
import { currenncyCodeToSymbol } from "@/utils";
import { getSalesOrder } from "@/utils/apiCalls";
import { exportInvoice } from "@/utils/pdfUtils";
import { ALL_PERMISSIONS } from "@/utils/data";
import { useAccountStore } from "@/store/zustand";

const SalesInvoice = () => {
  const router = useRouter();
  const t = useTranslations();

  const { checkPermission, role } = useAccountStore();

  const hasShownToast = useRef(false);

  const [salesOrders, setSalesOrders] = useState<SalesInvoiceModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<number[]>([0, 1, 2]);

  // Authorization
  useEffect(() => {
    if (
      !checkPermission(ALL_PERMISSIONS.SalesInvoice) &&
      !hasShownToast.current
    ) {
      toast.error(t("sales_invoice.no_permission"));
      hasShownToast.current = true;
      router.push("/");
    }
  }, [role, t, router, checkPermission]);

  // Fetch invoices
  useEffect(() => {
    if (!checkPermission(ALL_PERMISSIONS.SalesInvoice)) return;

    const fetchSalesInvoices = async () => {
      try {
        const res = await getSalesOrder();
        setSalesOrders(res.data.result);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || t("sales_invoice.fetch_error"),
        );
      }
    };

    fetchSalesInvoices();
  }, [t, checkPermission]);

  const filteredInvoices = useMemo(() => {
    return salesOrders.filter((invoice) => {
      if (filters.includes(0) && invoice.is_paid === "yes") return true;
      if (filters.includes(1) && invoice.is_paid === "partial") return true;
      if (filters.includes(2) && invoice.is_paid === "no") return true;

      return false;
    });
  }, [filters, salesOrders]);

  const toggleFilter = (filter: number) => {
    setFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((item) => item !== filter)
        : [...prev, filter],
    );
  };

  const getPaymentStatusClass = (isPaid: string) => {
    switch (isPaid) {
      case "yes":
        return "sales-invoices-status-paid";
      case "partial":
        return "sales-invoices-status-partial";
      case "no":
        return "sales-invoices-status-unpaid";
      default:
        return "sales-invoices-status-paid";
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(t("sales_invoice.locale"));
  };

  const handleExport = async (invoice: SalesInvoiceModel) => {
    try {
      setLoading(true);

      await exportInvoice(invoice);

      toast.success(t("sales_invoice.export_success"));
    } catch (error: any) {
      toast.error(error?.message || t("sales_invoice.export_error"));
    } finally {
      setLoading(false);
    }
  };

  if (!checkPermission(ALL_PERMISSIONS.SalesInvoice)) {
    return null;
  }

  return (
    <Layout>
      <div className="sales-invoices-page">
        {loading && (
          <div className="sales-invoices-loading">
            <Spinner
              variant="primary"
              className="sales-invoices-loading-spinner"
            />
          </div>
        )}

        {/* Header */}
        <section className="sales-invoices-page-header">
          <div className="sales-invoices-page-header-content">
            <div className="sales-invoices-page-header-icon">
              <Receipt size={24} />
            </div>

            <div className="sales-invoices-page-heading">
              <h1 className="sales-invoices-page-title">
                {t("sales_invoice.title")}
              </h1>

              <p className="sales-invoices-page-subtitle">
                {t("sales_invoice.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="sales-invoices-filters-card">
          <div className="sales-invoices-filters">
            <button
              type="button"
              className={`sales-invoices-filter-item ${
                !filters.includes(0) ? "disabled" : ""
              }`}
              onClick={() => toggleFilter(0)}
            >
              <span className="sales-invoices-filter-color sales-invoices-filter-paid" />
              <span>{t("sales_invoice.filters.paid")}</span>
            </button>

            <button
              type="button"
              className={`sales-invoices-filter-item ${
                !filters.includes(1) ? "disabled" : ""
              }`}
              onClick={() => toggleFilter(1)}
            >
              <span className="sales-invoices-filter-color sales-invoices-filter-partial" />
              <span>{t("sales_invoice.filters.partially_paid")}</span>
            </button>

            <button
              type="button"
              className={`sales-invoices-filter-item ${
                !filters.includes(2) ? "disabled" : ""
              }`}
              onClick={() => toggleFilter(2)}
            >
              <span className="sales-invoices-filter-color sales-invoices-filter-unpaid" />
              <span>{t("sales_invoice.filters.unpaid")}</span>
            </button>
          </div>
        </section>

        {/* Desktop */}
        <div className="d-none d-lg-block">
          <div className="sales-invoices-table-wrapper">
            <table className="table sales-invoices-table mb-0">
              <thead>
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
                    <td colSpan={7}>
                      <div className="sales-invoices-empty">
                        <FileText size={46} />
                        <p>{t("sales_invoice.no_invoices")}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.invoice_no}>
                      <td
                        className={`sales-invoices-invoice-number ${getPaymentStatusClass(
                          invoice.is_paid,
                        )}`}
                      >
                        {invoice.oracle_number}
                      </td>

                      <td>{invoice.invoice_no}</td>

                      <td>{formatDate(invoice.date_added)}</td>

                      <td>{invoice.currency}</td>

                      <td className="sales-invoices-amount">
                        {currenncyCodeToSymbol(invoice.currency)}{" "}
                        {parseFloat(invoice.total_amount).toLocaleString()}
                      </td>

                      <td className="sales-invoices-amount">
                        {currenncyCodeToSymbol(invoice.currency)}{" "}
                        {parseFloat(invoice.remaining_amount).toLocaleString()}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="sales-invoices-download"
                          onClick={() => handleExport(invoice)}
                          title={t("sales_invoice.export_pdf")}
                        >
                          <Download size={19} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile */}
        <div className="d-block d-lg-none sales-invoices-mobile-view">
          {filteredInvoices.length === 0 ? (
            <div className="sales-invoices-mobile-empty">
              <FileText size={46} />
              <p>{t("sales_invoice.no_invoices")}</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div
                key={invoice.invoice_no}
                className={`sales-invoices-mobile-card ${getPaymentStatusClass(
                  invoice.is_paid,
                )}`}
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

                    <span className="sales-invoices-mobile-status-dot" />
                  </div>

                  {/* Details */}
                  <div className="sales-invoices-mobile-info">
                    <div className="sales-invoices-mobile-field">
                      <span>{t("sales_invoice.table.oracle_invoice_no")}</span>

                      <strong>{invoice.invoice_no}</strong>
                    </div>

                    <div className="sales-invoices-mobile-field">
                      <span>{t("sales_invoice.table.invoice_date")}</span>

                      <strong>{formatDate(invoice.date_added)}</strong>
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
                      <small>{t("sales_invoice.table.remaining_amount")}</small>

                      <strong>
                        {currenncyCodeToSymbol(invoice.currency)}{" "}
                        {parseFloat(invoice.remaining_amount).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="sales-invoices-mobile-pdf"
                    onClick={() => handleExport(invoice)}
                  >
                    <Download size={17} />
                    {t("sales_invoice.export_pdf")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SalesInvoice;
