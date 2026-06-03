import Layout from "@/components/Layout/Layout";
import { getAISuggestedProducts, addToCart } from "@/utils/apiCalls";
import { currenncyCodeToSymbol } from "@/utils";
import { useTranslations } from "next-intl";

import { useEffect, useState } from "react";

import { Row, Col, Card, Button, Spinner, Placeholder } from "react-bootstrap";

import Image from "next/image";

import { toast } from "react-toastify";
import { useAccountStore } from "@/store/zustand";

interface SuggestedProduct {
  item_code: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  currency_code?: string;
  barcode?: string;
}

export default function AIOrderProposalPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [cashVan, setCashVan] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const { refreshCart } = useAccountStore();
  const t = useTranslations();

  const loadProposal = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      const res = await getAISuggestedProducts();
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 3000 - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remaining));
      setProducts(res.data.result.products || []);
      setCashVan(res.data.result.cashVan || null);
    } catch (e) {
      toast.error(t("ai_proposal.load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposal();
  }, []);

  const updateQty = (itemCode: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.item_code === itemCode
          ? {
              ...p,
              quantity: Math.max(1, Math.min(p.stock, p.quantity + delta)),
            }
          : p,
      ),
    );
  };

  const removeItem = (itemCode: string) => {
    setProducts((prev) => prev.filter((p) => p.item_code !== itemCode));
  };

  const addProposalToCart = async () => {
    try {
      setAdding(true);
      for (const item of products) {
        await addToCart(
          item.item_code,
          item.barcode ?? item.item_code,
          item.quantity,
        );
      }
      await refreshCart();
      toast.success(t("ai_proposal.add_success"));
    } catch {
      toast.error(t("ai_proposal.add_error"));
    } finally {
      setAdding(false);
    }
  };

  const total = products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const currency =
    products.length > 0
      ? currenncyCodeToSymbol(products[0].currency_code || "USD")
      : "$";

  if (loading)
    return (
      <Layout>
        <section
          className="d-flex align-items-center justify-content-center mx-3"
          style={{
            minHeight: "80vh",
          }}
        >
          <div
            className="text-center"
            style={{
              maxWidth: 600,
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: "5rem",
                animation: "pulse 1.5s infinite",
              }}
            >
              🤖
            </div>

            <h2 className="fw-bold mt-4">{t("ai_proposal.loading_title")}</h2>

            <p className="text-muted mb-5">
              {t("ai_proposal.loading_description")}
            </p>

            <div className="mb-4">
              <div className="progress" style={{ height: 14 }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  style={{
                    width: "100%",
                  }}
                />
              </div>
            </div>

            <Card className="shadow-sm border-0">
              <Card.Body className="text-start">
                <div className="mb-3">✅ {t("ai_proposal.step_analyzing")}</div>
                <div className="mb-3">✅ {t("ai_proposal.step_detecting")}</div>
                <div className="mb-3">
                  ⏳ {t("ai_proposal.step_estimating")}
                </div>
                <div>⏳ {t("ai_proposal.step_calculating")}</div>
              </Card.Body>
            </Card>
          </div>
        </section>

        <style jsx global>{`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.15);
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
      </Layout>
    );

  return (
    <Layout>
      <section className="py-5">
        <div className="container">
          {/* HEADER */}
          <div className="ai-header mb-4">
            <div>
              <h2 className="mb-1">🤖 {t("ai_proposal.title")}</h2>
              <div
                style={{
                  display: "inline-block",
                  background: "#e7f1ff",
                  color: "#0d6efd",
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {t("ai_proposal.ai_generated_badge")}
              </div>
              <p className="text-muted mb-0">{t("ai_proposal.subtitle")}</p>
            </div>

            <Button variant="outline-primary" size="lg" onClick={loadProposal}>
              🔄 {t("ai_proposal.regenerate_btn")}
            </Button>
          </div>

          {/* CASH VAN */}
          <Card
            className="border-0 mb-4"
            style={{
              borderRadius: 20,
              background: "linear-gradient(135deg,#0d6efd 0%, #4f8cff 100%)",
              color: "white",
            }}
          >
            <Card.Body>
              {cashVan ? (
                <>
                  <h5 className="mb-3">🚚 {t("ai_proposal.upcoming_visit")}</h5>
                  <Row>
                    <Col md={4}>
                      <strong>{t("ai_proposal.driver")}</strong>
                      <div>
                        {cashVan.driverName} [{cashVan.driverCode}]
                      </div>
                    </Col>
                    <Col md={4}>
                      <strong>{t("ai_proposal.expected_visit")}</strong>
                      <div>
                        {new Date(cashVan.plannedDate).toLocaleDateString(
                          t("ai_proposal.locale"),
                        )}
                      </div>
                    </Col>
                    <Col md={4}>
                      <strong>{t("ai_proposal.estimated_arrival")}</strong>
                      <div>{cashVan.estimatedArrival}</div>
                    </Col>
                  </Row>
                </>
              ) : (
                <div className="text-center py-3">
                  <div style={{ fontSize: "3rem" }}>🚚</div>
                  <h5 className="mt-3">{t("ai_proposal.no_cashvan_title")}</h5>
                  <p
                    className="mb-0"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {t("ai_proposal.no_cashvan_description")}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* PRODUCTS */}
          <Row>
            {products.map((item) => {
              const imgSrc =
                item.image || process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE;

              return (
                <Col
                  xl={3}
                  lg={4}
                  md={6}
                  xs={6}
                  key={item.item_code}
                  className="mb-3"
                >
                  <Card className="h-100 shadow-sm border-0 ai-product-card">
                    <div className="ai-product-image">
                      <Image
                        src={imgSrc}
                        alt={item.name}
                        fill
                        style={{
                          objectFit: "contain",
                          padding: "15px",
                        }}
                      />
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <h6
                        style={{
                          minHeight: 50,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.name}
                      </h6>
                      <div
                        className="fw-bold text-primary mb-3"
                        style={{ fontSize: "1.1rem" }}
                      >
                        {currenncyCodeToSymbol(item.currency_code || "USD")}{" "}
                        {item.price.toLocaleString()}
                      </div>
                      <div className="mt-auto">
                        <div className="qty-selector">
                          <Button
                            variant="light"
                            className="qty-btn"
                            onClick={() => updateQty(item.item_code, -1)}
                          >
                            −
                          </Button>
                          <span className="qty-value">{item.quantity}</span>
                          <Button
                            variant="primary"
                            className="qty-btn"
                            onClick={() => updateQty(item.item_code, 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="outline-danger"
                          className="w-100"
                          onClick={() => removeItem(item.item_code)}
                        >
                          {t("ai_proposal.remove_btn")}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* SUMMARY */}
          <Card className="shadow-sm border-0 mt-4">
            <Card.Body>
              <div className="proposal-summary">
                <div>
                  <h5 className="mb-1">
                    {t("ai_proposal.suggested_products")}: {products.length}
                  </h5>
                  <h3 className="text-primary mb-0">
                    {currency} {total.toLocaleString()}
                  </h3>
                </div>
                <Button
                  size="lg"
                  onClick={addProposalToCart}
                  disabled={adding || products.length === 0}
                >
                  {adding ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {t("ai_proposal.adding")}
                    </>
                  ) : (
                    `🛒 ${t("ai_proposal.add_all_btn")}`
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
