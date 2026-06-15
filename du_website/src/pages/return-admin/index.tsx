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

const ReturnAdminPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations();

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
              <Accordion alwaysOpen>
                {requests.map((request, index) => (
                  <Accordion.Item
                    eventKey={index.toString()}
                    key={request.transaction_header_id}
                  >
                    <Accordion.Header>
                      <div className="w-100 me-3" style={{ minWidth: 0 }}>
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          <strong>{request.transaction_header_code}</strong>
                          {getStatusBadge(request.transaction_status)}
                        </div>
                        <div className="small text-muted mt-1">
                          {t("return_admin.customer_label")}:{" "}
                          {request.customer_name}
                        </div>
                        <div className="small text-muted">
                          {t("return_admin.invoice_label")}:{" "}
                          {request.invoice_code}
                        </div>
                        <div className="small text-muted">
                          {new Date(request.date_added).toLocaleString(
                            t("return_admin.locale"),
                          )}
                        </div>
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      <div className="mb-3">
                        <strong>{t("return_admin.reason_label")}:</strong>
                        <div className="text-muted">
                          {request.reason || "-"}
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-3">
                        {request.items?.map((item: any) => {
                          const image =
                            item.image ||
                            process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE;

                          return (
                            <Card key={item.transaction_body_id}>
                              <Card.Body>
                                <div className="d-flex gap-3 align-items-center">
                                  <div
                                    style={{
                                      width: 70,
                                      height: 70,
                                      position: "relative",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Image
                                      src={image}
                                      alt={item.item_name}
                                      fill
                                      style={{
                                        objectFit: "contain",
                                      }}
                                      unoptimized
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE;
                                      }}
                                    />
                                  </div>

                                  <div className="flex-grow-1">
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
                              </Card.Body>
                            </Card>
                          );
                        })}
                      </div>

                      {request.transaction_status === 3 && (
                        <div className="mt-4 d-flex gap-2 flex-wrap">
                          <Button
                            variant="success"
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
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>

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
