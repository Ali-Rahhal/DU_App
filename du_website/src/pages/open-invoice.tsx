import OpenInvoice from "@/Models/OpenInvoice";
import Layout from "@/components/Layout/Layout";

import { currenncyCodeToSymbol } from "@/utils";
import { getOpenInvoices } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";

import React, { useEffect, useRef, useState } from "react";

import { ALL_PERMISSIONS } from "@/utils/data";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAccountStore } from "@/store/zustand";

import { CalendarDays, Clock3, FileText, Receipt } from "lucide-react";

const OpenInvoices = () => {
  // =========================================================
  // Authorization
  // =========================================================

  const router = useRouter();
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
      router.push("/");
    }
  }, [role, t, router, checkPermission]);

  // =========================================================
  // State
  // =========================================================

  const [openInvoices, setOpenInvoices] = useState<OpenInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<OpenInvoice[]>([]);
  const [filters, setFilters] = useState<number[]>([0, 1, 2, 3]);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // Fetch invoices
  // =========================================================

  const fetchOpenInvoices = async () => {
    try {
      setLoading(true);

      const res = await getOpenInvoices();

      setOpenInvoices(res.data.result || []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || t("open_invoices.fetch_error"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkPermission(ALL_PERMISSIONS.OpenInvoice)) return;

    fetchOpenInvoices();
  }, [t, role]);

  // =========================================================
  // Filter invoices
  // =========================================================

  useEffect(() => {
    setFilteredInvoices(
      openInvoices.filter((invoice) => {
        const dueDate = new Date(invoice.due_date);
        const currentDate = new Date();

        const diff = dueDate.getTime() - currentDate.getTime();

        const remainingDays = Math.ceil(diff / (1000 * 3600 * 24));

        const type = parseFloat(invoice.remaining_amount) < 0 ? "CN" : "SI";

        // Due in more than 7 days
        if (filters.includes(0) && remainingDays > 7 && type === "SI") {
          return true;
        }

        // Due within 7 days
        if (
          filters.includes(1) &&
          remainingDays < 7 &&
          remainingDays > 0 &&
          type === "SI"
        ) {
          return true;
        }

        // Past due
        if (filters.includes(2) && remainingDays < 0 && type === "SI") {
          return true;
        }

        // Credit note
        if (filters.includes(3) && type === "CN") {
          return true;
        }

        return false;
      }),
    );
  }, [filters, openInvoices]);

  // =========================================================
  // Helpers
  // =========================================================

  const toggleFilter = (filter: number) => {
    setFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((item) => item !== filter)
        : [...prev, filter],
    );
  };

  const getInvoiceType = (invoice: OpenInvoice) => {
    return parseFloat(invoice.remaining_amount) < 0 ? "CN" : "SI";
  };

  const getRemainingDays = (invoice: OpenInvoice) => {
    const dueDate = new Date(invoice.due_date);
    const currentDate = new Date();

    const diff = dueDate.getTime() - currentDate.getTime();

    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getInvoiceStatus = (invoice: OpenInvoice) => {
    const type = getInvoiceType(invoice);

    if (type === "CN") {
      return "credit";
    }

    const remainingDays = getRemainingDays(invoice);

    if (remainingDays < 0) {
      return "past-due";
    }

    if (remainingDays < 7) {
      return "due-soon";
    }

    return "upcoming";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  // =========================================================
  // Permission
  // =========================================================

  if (!checkPermission(ALL_PERMISSIONS.OpenInvoice)) {
    return null;
  }

  // =========================================================
  // Render
  // =========================================================

  return (
    <Layout>
      <div className="open-invoices-page">
        {/* =====================================================
            Page Header
            ===================================================== */}

        <section className="open-invoices-page-header">
          <div className="open-invoices-page-header-content">
            <div className="open-invoices-page-header-icon">
              <Receipt size={24} />
            </div>

            <div className="open-invoices-page-heading">
              <h1 className="open-invoices-page-title">
                {t("open_invoices.title")}
              </h1>

              <p className="open-invoices-page-subtitle">
                {t("open_invoices.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            Filters
            ===================================================== */}

        <section className="open-invoices-filters-card">
          <div className="open-invoices-filters-heading">
            <span>{t("open_invoices.filters.title")}</span>
          </div>

          <div className="open-invoices-filters">
            <button
              type="button"
              className={`open-invoices-filter-item ${
                !filters.includes(0) ? "disabled" : ""
              }`}
              onClick={() => toggleFilter(0)}
            >
              <span className="open-invoices-filter-color open-invoices-filter-upcoming" />

              <span>{t("open_invoices.filters.due_more_than_7_days")}</span>
            </button>

            <button
              type="button"
              className={`open-invoices-filter-item ${
                !filters.includes(1) ? "disabled" : ""
              }`}
              onClick={() => toggleFilter(1)}
            >
              <span className="open-invoices-filter-color open-invoices-filter-due-soon" />

              <span>{t("open_invoices.filters.due_less_than_7_days")}</span>
            </button>

            <button
              type="button"
              className={`open-invoices-filter-item ${
                !filters.includes(2) ? "disabled" : ""
              }`}
              onClick={() => toggleFilter(2)}
            >
              <span className="open-invoices-filter-color open-invoices-filter-past-due" />

              <span>{t("open_invoices.filters.past_due_date")}</span>
            </button>

            <button
              type="button"
              className={`open-invoices-filter-item ${
                !filters.includes(3) ? "disabled" : ""
              }`}
              onClick={() => toggleFilter(3)}
            >
              <span className="open-invoices-filter-color open-invoices-filter-credit" />

              <span>{t("open_invoices.filters.credit")}</span>
            </button>
          </div>
        </section>

        {/* =====================================================
            Results
            ===================================================== */}

        <section className="open-invoices-results-section">
          {/* Desktop Table */}

          <div className="open-invoices-table-container d-none d-lg-block">
            <div className="open-invoices-table-wrapper">
              <table className="open-invoices-table">
                <thead className="open-invoices-table-head">
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
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="open-invoices-table-loading">
                        <div className="open-invoices-loading-spinner">
                          <div className="spinner-border text-primary" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="open-invoices-table-empty">
                        <div className="open-invoices-empty-state">
                          <div className="open-invoices-empty-icon">
                            <FileText size={27} />
                          </div>

                          <p className="open-invoices-empty-title">
                            {t("open_invoices.no_invoices")}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => {
                      const type = getInvoiceType(invoice);
                      const status = getInvoiceStatus(invoice);

                      return (
                        <tr
                          key={invoice.order_no}
                          className={`open-invoices-table-row open-invoices-status-${status}`}
                        >
                          <td>
                            <div className="open-invoices-order-number">
                              {invoice.order_no}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`open-invoices-type-badge open-invoices-type-${type.toLowerCase()}`}
                            >
                              {type === "CN"
                                ? t("open_invoices.credit_note")
                                : t("open_invoices.sales_invoice")}
                            </span>
                          </td>

                          <td>
                            <div className="open-invoices-table-detail">
                              <CalendarDays size={15} />
                              <span>{formatDate(invoice.invoice_date)}</span>
                            </div>
                          </td>

                          <td>
                            <div className="open-invoices-table-detail">
                              <Clock3 size={15} />
                              <span>{formatDate(invoice.due_date)}</span>
                            </div>
                          </td>

                          <td>
                            <span className="open-invoices-currency">
                              {invoice.currency}
                            </span>
                          </td>

                          <td>
                            <span className="open-invoices-amount">
                              {currenncyCodeToSymbol(invoice.currency)}{" "}
                              {parseFloat(
                                invoice.order_amount,
                              ).toLocaleString()}
                            </span>
                          </td>

                          <td>
                            <span className="open-invoices-remaining">
                              {currenncyCodeToSymbol(invoice.currency)}{" "}
                              {parseFloat(
                                invoice.remaining_amount,
                              ).toLocaleString()}
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

          {/* =====================================================
              Mobile Cards
              ===================================================== */}

          <div className="d-block d-lg-none open-invoices-mobile-view">
            {loading ? (
              <div className="open-invoices-mobile-empty">
                <div className="open-invoices-loading-spinner">
                  <div className="spinner-border text-primary" />
                </div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="open-invoices-mobile-empty">
                <div className="open-invoices-empty-icon">
                  <FileText size={26} />
                </div>

                <p>{t("open_invoices.no_invoices")}</p>
              </div>
            ) : (
              filteredInvoices.map((invoice) => {
                const type = getInvoiceType(invoice);
                const status = getInvoiceStatus(invoice);
                const remainingDays = getRemainingDays(invoice);

                return (
                  <div
                    key={invoice.order_no}
                    className={`open-invoices-mobile-card open-invoices-status-${status}`}
                  >
                    <div className="open-invoices-mobile-card-body">
                      {/* Header */}

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

                        <span className="open-invoices-mobile-status-dot" />
                      </div>

                      {/* Details */}

                      <div className="open-invoices-mobile-info">
                        <div className="open-invoices-mobile-field">
                          <span>{t("open_invoices.table.invoice_date")}</span>

                          <strong>{formatDate(invoice.invoice_date)}</strong>
                        </div>

                        <div className="open-invoices-mobile-field">
                          <span>{t("open_invoices.table.due_date")}</span>

                          <strong>{formatDate(invoice.due_date)}</strong>
                        </div>

                        <div className="open-invoices-mobile-field">
                          <span>{t("open_invoices.table.currency")}</span>

                          <strong>{invoice.currency}</strong>
                        </div>
                      </div>

                      {/* Amounts */}

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

                      {/* Remaining Days */}

                      {type === "SI" && (
                        <div className="open-invoices-mobile-days">
                          <Clock3 size={14} />

                          <span>
                            {remainingDays >= 0
                              ? `${remainingDays} days remaining`
                              : `${Math.abs(remainingDays)} days overdue`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default OpenInvoices;
