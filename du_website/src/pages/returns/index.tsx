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
        <div className="card">
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
      </AccountLayout>
    </Layout>
  );
};

export default Returns;
