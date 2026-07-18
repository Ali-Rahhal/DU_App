import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { currenncyCodeToSymbol } from "@/utils";
import { getReturnableInvoices } from "@/utils/apiCalls";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Badge, Button, Spinner } from "react-bootstrap";
import { useTranslations } from "next-intl";

const Returns = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  return (
    <Layout>
      <AccountLayout
        title={t("returns.title")}
        subTitle={t("returns.subtitle")}
      >
        <div className="card d-none d-lg-block">
          <div
            className="table-responsive"
            style={{
              maxHeight: "600px",
              overflowY: "auto",
            }}
          >
            <table className="table mb-0">
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "white",
                  zIndex: 10,
                }}
              >
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
                    <td colSpan={6} className="text-center py-5">
                      <Spinner />
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="text-muted">
                        <i className="fa fa-undo fa-3x mb-3"></i>
                        <p>{t("returns.no_invoices")}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.transaction_header_id}>
                      <td className="py-3">
                        <strong>{invoice.invoice_code}</strong>
                      </td>

                      <td className="py-3">
                        {new Date(invoice.invoice_date).toLocaleDateString(
                          t("returns.locale"),
                        )}
                      </td>

                      <td className="py-3">
                        {currenncyCodeToSymbol(invoice.currency_code)}{" "}
                        {parseFloat(invoice.total_amount).toLocaleString()}
                      </td>

                      <td className="py-3">
                        {invoice.returnWindowDays - invoice.daysSinceInvoice >=
                        0 ? (
                          <span className="badge bg-soft-success">
                            {invoice.returnWindowDays -
                              invoice.daysSinceInvoice}{" "}
                            {t("returns.days_left")}
                          </span>
                        ) : (
                          <span className="badge bg-soft-danger">
                            {t("returns.expired")}
                          </span>
                        )}
                      </td>

                      <td className="py-3">
                        {invoice.hasPendingReturnRequest ? (
                          <Badge bg="warning" className="text-black">
                            {t("returns.pending_request")}
                          </Badge>
                        ) : invoice.canReturn ? (
                          <Link
                            href={`/returns/${invoice.transaction_header_id}`}
                          >
                            <Button size="sm">{t("returns.return_btn")}</Button>
                          </Link>
                        ) : (
                          <Badge bg="danger" className="text-white">
                            {t("returns.window_expired")}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Mobile Cards */}
        <div className="returns-mobile-view d-block d-lg-none">
          {loading ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <Spinner />
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="text-muted">
                  <i className="fa fa-undo fa-3x mb-3"></i>
                  <p>{t("returns.no_invoices")}</p>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >
              {invoices.map((invoice) => {
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
                          {invoice.invoice_code}
                        </div>

                        {remainingDays >= 0 ? (
                          <span className="badge bg-soft-success">
                            {remainingDays} {t("returns.days_left")}
                          </span>
                        ) : (
                          <span className="badge bg-soft-danger">
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
                          <Badge bg="warning" className="text-black">
                            {t("returns.pending_request")}
                          </Badge>
                        ) : invoice.canReturn ? (
                          <Link
                            href={`/returns/${invoice.transaction_header_id}`}
                          >
                            <Button size="sm" className="returns-mobile-button">
                              <i className="fa fa-undo me-2"></i>
                              {t("returns.return_btn")}
                            </Button>
                          </Link>
                        ) : (
                          <Badge bg="danger">
                            {t("returns.window_expired")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default Returns;
