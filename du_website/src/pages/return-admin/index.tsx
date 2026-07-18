import Layout from "@/components/Layout/Layout";
import AccountLayout from "@/components/dashboard/AccountLayout";
import {
  getReturnRequests,
  approveOrRejectReturnRequest,
} from "@/utils/apiCalls";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Accordion, Badge, Button, Card, Spinner } from "react-bootstrap";
import AdminGuard from "@/components/guards/AdminGuard";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";

const ReturnAdminPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations();
  const { companyPlaceholder } = useCompanyAssets();
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getReturnRequests(1, 20);
        setRequests(res.data.result.requests || []);
        setTotalPages(res.data.result.totalPages || 1);
      } catch (e) {
        toast.error(t("return_admin.load_error"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [t]);

  const loadPage = async () => {
    try {
      setPageLoading(true);
      const res = await getReturnRequests(page, 20);
      setRequests(res.data.result.requests || []);
      setTotalPages(res.data.result.totalPages || 1);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (page === 1) return;
    loadPage();
  }, [page]);

  const handleDecision = async (
    transactionHeaderId: number,
    approved: boolean,
  ) => {
    try {
      setProcessingId(transactionHeaderId);
      await approveOrRejectReturnRequest({
        transaction_header_id: transactionHeaderId,
        approved,
      });
      toast.success(
        approved
          ? t("return_admin.approve_success")
          : t("return_admin.reject_success"),
      );
      await loadPage();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || t("return_admin.process_error"),
      );
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 3:
        return <Badge bg="warning">{t("return_admin.status_pending")}</Badge>;
      case 4:
        return <Badge bg="success">{t("return_admin.status_approved")}</Badge>;
      case 9:
        return <Badge bg="danger">{t("return_admin.status_rejected")}</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const toggleItems = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <AdminGuard>
      <Layout>
        <AccountLayout
          title={t("return_admin.title")}
          subTitle={t("return_admin.subtitle")}
        >
          {loading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <h5>{t("return_admin.no_requests")}</h5>
              </Card.Body>
            </Card>
          ) : (
            <>
              <div className="d-none d-lg-block">
                <Card className="return-admin-table-card">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0 return-admin-table">
                      <thead>
                        <tr>
                          <th>{t("return_admin.return_code")}</th>
                          <th>{t("return_admin.customer_label")}</th>
                          <th>{t("return_admin.invoice_label")}</th>
                          <th>{t("return_admin.status")}</th>
                          <th>{t("return_admin.date")}</th>
                          <th className="text-center">
                            {t("return_admin.actions")}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {requests.map((request) => (
                          <>
                            <tr key={request.transaction_header_id}>
                              <td>
                                <strong>
                                  {request.transaction_header_code}
                                </strong>
                              </td>

                              <td>{request.customer_name}</td>

                              <td>{request.invoice_code}</td>

                              <td>
                                {getStatusBadge(request.transaction_status)}
                              </td>

                              <td>
                                {new Date(
                                  request.date_added,
                                ).toLocaleDateString(t("return_admin.locale"))}
                              </td>

                              <td>
                                <div className="d-flex justify-content-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() =>
                                      toggleRow(request.transaction_header_id)
                                    }
                                  >
                                    <i
                                      className={
                                        expandedRows.includes(
                                          request.transaction_header_id,
                                        )
                                          ? "fa fa-eye-slash"
                                          : "fa fa-eye"
                                      }
                                    ></i>
                                  </Button>

                                  {request.transaction_status === 3 && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="success"
                                        disabled={
                                          processingId ===
                                          request.transaction_header_id
                                        }
                                        onClick={() =>
                                          handleDecision(
                                            request.transaction_header_id,
                                            true,
                                          )
                                        }
                                      >
                                        ✓
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="danger"
                                        disabled={
                                          processingId ===
                                          request.transaction_header_id
                                        }
                                        onClick={() =>
                                          handleDecision(
                                            request.transaction_header_id,
                                            false,
                                          )
                                        }
                                      >
                                        ✕
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Details Row */}

                            <tr>
                              <td colSpan={6} className="p-0 border-0">
                                {expandedRows.includes(
                                  request.transaction_header_id,
                                ) && (
                                  <div>
                                    <div className="return-admin-details">
                                      <div className="mb-3">
                                        <strong>
                                          {t("return_admin.reason_label")}:
                                        </strong>

                                        <div className="text-muted">
                                          {request.reason || "-"}
                                        </div>
                                      </div>

                                      <div className="return-admin-items">
                                        {request.items?.map((item: any) => (
                                          <div
                                            key={item.transaction_body_id}
                                            className="return-admin-item"
                                          >
                                            <Image
                                              src={
                                                item.image || companyPlaceholder
                                              }
                                              alt={item.item_name}
                                              width={60}
                                              height={60}
                                              unoptimized
                                            />

                                            <div>
                                              <div className="fw-bold">
                                                {item.item_name}
                                              </div>

                                              <small className="text-muted">
                                                {item.item_code}
                                              </small>

                                              <div>
                                                {t(
                                                  "return_admin.quantity_label",
                                                )}
                                                :
                                                <strong className="ms-2">
                                                  {item.quantity}
                                                </strong>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              <div className="return-admin-mobile-view d-block d-lg-none">
                {requests.map((request) => (
                  <div
                    className="return-admin-mobile-card"
                    key={request.transaction_header_id}
                  >
                    <div className="return-admin-mobile-card-body">
                      <div className="return-admin-mobile-header">
                        <div>
                          <div className="return-admin-mobile-title">
                            {request.invoice_code}
                          </div>

                          <div className="return-admin-mobile-subtitle">
                            {request.customer_name}
                          </div>
                        </div>

                        {getStatusBadge(request.transaction_status)}
                      </div>

                      <div className="return-admin-mobile-info">
                        <div className="return-admin-mobile-field">
                          <span>{t("return_admin.date")}</span>

                          <strong>
                            {new Date(request.date_added).toLocaleDateString(
                              t("return_admin.locale"),
                            )}
                          </strong>
                        </div>

                        <div className="return-admin-mobile-field">
                          <span>{t("return_admin.reason_label")}</span>

                          <strong>{request.reason || "-"}</strong>
                        </div>
                      </div>

                      <hr />

                      <div className="return-mobile-actions">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            toggleItems(request.transaction_header_id)
                          }
                        >
                          <i className="fa fa-eye me-2"></i>
                          {expandedItems.includes(request.transaction_header_id)
                            ? t("return_admin.hide_items")
                            : t("return_admin.view_items")}
                        </Button>
                      </div>

                      {expandedItems.includes(
                        request.transaction_header_id,
                      ) && (
                        <div className="return-mobile-items mt-3">
                          {request.items?.map((item: any) => {
                            const image = item.image || companyPlaceholder;

                            return (
                              <div
                                key={item.transaction_body_id}
                                className="return-mobile-item"
                              >
                                <div className="return-mobile-item-image">
                                  <Image
                                    src={image}
                                    alt={item.item_name}
                                    fill
                                    style={{
                                      objectFit: "contain",
                                    }}
                                    unoptimized
                                    onError={(e) => {
                                      e.currentTarget.src = companyPlaceholder;
                                    }}
                                  />
                                </div>

                                <div className="return-mobile-item-info">
                                  <div className="fw-bold">
                                    {item.item_name}
                                  </div>

                                  <div className="text-muted small">
                                    {item.item_code}
                                  </div>

                                  <div className="mt-1">
                                    {t("return_admin.quantity_label")}:
                                    <strong className="ms-2">
                                      {item.quantity}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {request.transaction_status === 3 && (
                        <div className="return-admin-mobile-actions">
                          <Button
                            variant="success"
                            className="w-100"
                            disabled={
                              processingId === request.transaction_header_id
                            }
                            onClick={() =>
                              handleDecision(
                                request.transaction_header_id,
                                true,
                              )
                            }
                          >
                            {processingId === request.transaction_header_id ? (
                              <Spinner size="sm" />
                            ) : (
                              t("return_admin.approve_btn")
                            )}
                          </Button>

                          <Button
                            variant="danger"
                            className="w-100"
                            disabled={
                              processingId === request.transaction_header_id
                            }
                            onClick={() =>
                              handleDecision(
                                request.transaction_header_id,
                                false,
                              )
                            }
                          >
                            {t("return_admin.reject_btn")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                <button
                  className="btn btn-outline-primary"
                  disabled={page === 1 || pageLoading}
                  onClick={() => setPage(1)}
                  style={{ minWidth: "40px", height: "40px" }}
                  title={t("return_admin.first_page")}
                >
                  <i className="ti-angle-double-left"></i>
                </button>

                <button
                  className="btn btn-outline-primary"
                  disabled={page === 1 || pageLoading}
                  onClick={() => setPage(page - 1)}
                  style={{ minWidth: "40px", height: "40px" }}
                  title={t("return_admin.previous_page")}
                >
                  <i className="ti-angle-left"></i>
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + idx;
                  return p <= totalPages ? (
                    <button
                      key={p}
                      className={`btn ${p === page ? "btn-primary" : "btn-outline-primary"}`}
                      disabled={pageLoading}
                      onClick={() => setPage(p)}
                      style={{ minWidth: "40px", height: "40px" }}
                    >
                      {p}
                    </button>
                  ) : null;
                })}

                <button
                  className="btn btn-outline-primary"
                  disabled={page === totalPages || pageLoading}
                  onClick={() => setPage(page + 1)}
                  style={{ minWidth: "40px", height: "40px" }}
                  title={t("return_admin.next_page")}
                >
                  <i className="ti-angle-right"></i>
                </button>

                <button
                  className="btn btn-outline-primary"
                  disabled={page === totalPages || pageLoading}
                  onClick={() => setPage(totalPages)}
                  style={{ minWidth: "40px", height: "40px" }}
                  title={t("return_admin.last_page")}
                >
                  <i className="ti-angle-double-right"></i>
                </button>
              </div>

              {pageLoading && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                  <Spinner animation="border" size="sm" />
                  <small className="text-muted">
                    {t("return_admin.loading")}
                  </small>
                </div>
              )}
            </>
          )}
        </AccountLayout>
      </Layout>
    </AdminGuard>
  );
};

export default ReturnAdminPage;
