import Layout from "@/components/Layout/Layout";
import ReturnRequestModal from "@/components/returnsPage/ReturnRequestModal";

import { currenncyCodeToSymbol } from "@/utils";
import { getReturnableInvoices } from "@/utils/apiCalls";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Badge, Button, Spinner } from "react-bootstrap";
import { useTranslations } from "next-intl";

import { Undo2, CalendarDays, Receipt, ChevronRight } from "lucide-react";

const Returns = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null,
  );

  const [showReturnRequest, setShowReturnRequest] = useState(false);

  const t = useTranslations();

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const res = await getReturnableInvoices();

      setInvoices(res.data.result || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("returns.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleReturnClick = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setShowReturnRequest(true);
  };

  const handleCloseReturnRequest = () => {
    setShowReturnRequest(false);
    setSelectedInvoiceId(null);
  };

  const handleReturnSuccess = async () => {
    await fetchInvoices();
  };

  return (
    <Layout>
      <div className="returns-page">
        {/* =====================================================
            PAGE HEADER
            ===================================================== */}

        <section className="returns-page-header">
          <div className="returns-page-header-content">
            <div className="returns-page-header-icon">
              <Undo2 size={24} />
            </div>

            <div className="returns-page-heading">
              <h1 className="returns-page-title">{t("returns.title")}</h1>

              <p className="returns-page-subtitle">{t("returns.subtitle")}</p>
            </div>
          </div>
        </section>

        {/* =====================================================
            DESKTOP
            ===================================================== */}

        <div className="returns-table-container d-none d-lg-block">
          <div className="returns-table-wrapper">
            <table className="returns-table">
              <thead className="returns-table-head">
                <tr>
                  <th>{t("returns.table.invoice_code")}</th>

                  <th>{t("returns.table.date")}</th>

                  <th>{t("returns.table.total_amount")}</th>

                  <th>{t("returns.table.return_window")}</th>

                  <th>{t("returns.table.action")}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="returns-table-empty">
                      <Spinner />
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="returns-table-empty">
                      <div className="returns-empty-state">
                        <div className="returns-empty-icon">
                          <Undo2 size={30} />
                        </div>

                        <h3 className="returns-empty-title">
                          {t("returns.no_invoices")}
                        </h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    const remainingDays =
                      invoice.returnWindowDays - invoice.daysSinceInvoice;

                    return (
                      <tr
                        key={invoice.transaction_header_id}
                        className="returns-table-row"
                      >
                        <td>
                          <span className="returns-invoice-code">
                            {invoice.invoice_code}
                          </span>
                        </td>

                        <td>
                          <div className="returns-date">
                            <CalendarDays size={16} />

                            <span>
                              {new Date(
                                invoice.invoice_date,
                              ).toLocaleDateString(t("returns.locale"))}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="returns-total">
                            {currenncyCodeToSymbol(invoice.currency_code)}{" "}
                            {parseFloat(invoice.total_amount).toLocaleString()}
                          </span>
                        </td>

                        <td>
                          {remainingDays >= 0 ? (
                            <span className="returns-window-success">
                              {remainingDays} {t("returns.days_left")}
                            </span>
                          ) : (
                            <span className="returns-window-danger">
                              {t("returns.expired")}
                            </span>
                          )}
                        </td>

                        <td>
                          {invoice.hasPendingReturnRequest ? (
                            <Badge bg="warning" className="text-black">
                              {t("returns.pending_request")}
                            </Badge>
                          ) : invoice.canReturn ? (
                            <Button
                              size="sm"
                              className="returns-action-button"
                              onClick={() =>
                                handleReturnClick(invoice.transaction_header_id)
                              }
                            >
                              <Undo2 size={15} />

                              {t("returns.return_btn")}
                            </Button>
                          ) : (
                            <Badge bg="danger">
                              {t("returns.window_expired")}
                            </Badge>
                          )}
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
            MOBILE
            ===================================================== */}

        <div className="returns-mobile-view d-block d-lg-none">
          {loading ? (
            <div className="returns-mobile-empty">
              <Spinner />
            </div>
          ) : invoices.length === 0 ? (
            <div className="returns-mobile-empty">
              <div className="returns-empty-icon">
                <Undo2 size={30} />
              </div>

              <h3 className="returns-empty-title">
                {t("returns.no_invoices")}
              </h3>
            </div>
          ) : (
            invoices.map((invoice) => {
              const remainingDays =
                invoice.returnWindowDays - invoice.daysSinceInvoice;

              return (
                <div
                  key={invoice.transaction_header_id}
                  className="returns-mobile-card"
                >
                  <div className="returns-mobile-card-body">
                    {/* Header */}

                    <div className="returns-mobile-header">
                      <div className="returns-mobile-number">
                        <Receipt size={16} />

                        <span>{invoice.invoice_code}</span>
                      </div>

                      {remainingDays >= 0 ? (
                        <span className="returns-window-success">
                          {remainingDays} {t("returns.days_left")}
                        </span>
                      ) : (
                        <span className="returns-window-danger">
                          {t("returns.expired")}
                        </span>
                      )}
                    </div>

                    {/* Info */}

                    <div className="returns-mobile-info">
                      <div className="returns-mobile-field">
                        <span className="returns-mobile-label">
                          {t("returns.table.date")}
                        </span>

                        <span className="returns-mobile-value">
                          {new Date(invoice.invoice_date).toLocaleDateString(
                            t("returns.locale"),
                          )}
                        </span>
                      </div>

                      <div className="returns-mobile-field">
                        <span className="returns-mobile-label">
                          {t("returns.table.total_amount")}
                        </span>

                        <span className="returns-mobile-value fw-bold">
                          {currenncyCodeToSymbol(invoice.currency_code)}{" "}
                          {parseFloat(invoice.total_amount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}

                    <div className="returns-mobile-footer">
                      {invoice.hasPendingReturnRequest ? (
                        <Badge bg="warning" text="white">
                          {t("returns.pending_request")}
                        </Badge>
                      ) : invoice.canReturn ? (
                        <Button
                          size="sm"
                          className="returns-mobile-button"
                          onClick={() =>
                            handleReturnClick(invoice.transaction_header_id)
                          }
                        >
                          <Undo2 size={15} />

                          {t("returns.return_btn")}

                          <ChevronRight size={16} />
                        </Button>
                      ) : (
                        <Badge bg="danger" text="white">
                          {t("returns.window_expired")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* =====================================================
            RETURN REQUEST MODAL
            ===================================================== */}

        <ReturnRequestModal
          show={showReturnRequest}
          invoiceId={selectedInvoiceId}
          onHide={handleCloseReturnRequest}
          onSuccess={handleReturnSuccess}
        />
      </div>
    </Layout>
  );
};

export default Returns;
