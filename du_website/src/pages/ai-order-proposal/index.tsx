import { useEffect, useState } from "react";
import Layout from "@/components/Layout/Layout";
import { getAISuggestedProducts, addToCart } from "@/utils/apiCalls";
import { currenncyCodeToSymbol } from "@/utils";
import { useTranslations } from "next-intl";
import { Button, Spinner } from "react-bootstrap";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAccountStore } from "@/store/zustand";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import {
  Bot,
  Sparkles,
  RefreshCw,
  Truck,
  CalendarDays,
  Clock,
  UserRound,
  Package,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

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
  const { companyPlaceholder } = useCompanyAssets();
  const t = useTranslations();

  const loadProposal = async () => {
    try {
      setLoading(true);

      const start = Date.now();
      const res = await getAISuggestedProducts();
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, 3000 - (Date.now() - start))),
      );

      setProducts(res.data.result.products || []);
      setCashVan(res.data.result.cashVan || null);
    } catch {
      toast.error(t("ai_proposal.load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposal();
  }, []);

  const updateQty = (code: string, delta: number) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.item_code === code
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(item.stock, item.quantity + delta),
              ),
            }
          : item,
      ),
    );
  };

  const removeItem = (code: string) =>
    setProducts((prev) => prev.filter((item) => item.item_code !== code));

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

  const totalsByCurrency = products.reduce<Record<string, number>>(
    (totals, item) => {
      const currencyCode = item.currency_code || "USD";

      totals[currencyCode] =
        (totals[currencyCode] || 0) + item.price * item.quantity;

      return totals;
    },
    {},
  );

  if (loading) {
    return (
      <Layout>
        <section className="ai-proposal-page">
          <div className="ai-loading">
            <div className="ai-icon">
              <Bot size={32} />
            </div>
            <span className="ai-badge">
              <Sparkles size={14} /> AI
            </span>
            <h2>{t("ai_proposal.loading_title")}</h2>
            <p>{t("ai_proposal.loading_description")}</p>
            <div className="ai-loader">
              <span />
            </div>

            <div className="ai-loading-steps">
              <p>✓ {t("ai_proposal.step_analyzing")}</p>
              <p>✓ {t("ai_proposal.step_detecting")}</p>
              <p>◌ {t("ai_proposal.step_estimating")}</p>
              <p>◌ {t("ai_proposal.step_calculating")}</p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="ai-proposal-page">
        <div className="container">
          <header className="ai-header">
            <div className="ai-heading">
              <div className="ai-icon">
                <Bot size={27} />
              </div>
              <div>
                <div className="ai-title-row">
                  <h1>{t("ai_proposal.title")}</h1>
                  <span className="ai-badge">
                    <Sparkles size={13} />
                    {t("ai_proposal.ai_generated_badge")}
                  </span>
                </div>
                <p>{t("ai_proposal.subtitle")}</p>
              </div>
            </div>

            <Button
              variant="outline-primary"
              className="ai-regenerate"
              onClick={loadProposal}
              disabled={adding}
            >
              <RefreshCw size={16} />
              {t("ai_proposal.regenerate_btn")}
            </Button>
          </header>

          <section className="ai-cashvan">
            <div className="ai-cashvan-heading">
              <div className="ai-cashvan-icon">
                <Truck size={22} />
              </div>
              <div>
                <h2>{t("ai_proposal.upcoming_visit")}</h2>
                <p>
                  {cashVan
                    ? t("ai_proposal.expected_visit")
                    : t("ai_proposal.no_cashvan_title")}
                </p>
              </div>
            </div>

            {cashVan ? (
              <div className="ai-cashvan-details">
                <div>
                  <UserRound size={17} />
                  <span>{t("ai_proposal.driver")}</span>
                  <strong>
                    {cashVan.driverName} [{cashVan.driverCode}]
                  </strong>
                </div>
                <div>
                  <CalendarDays size={17} />
                  <span>{t("ai_proposal.expected_visit")}</span>
                  <strong>
                    {new Date(cashVan.plannedDate).toLocaleDateString(
                      t("ai_proposal.locale"),
                    )}
                  </strong>
                </div>
                <div>
                  <Clock size={17} />
                  <span>{t("ai_proposal.estimated_arrival")}</span>
                  <strong>{cashVan.estimatedArrival}</strong>
                </div>
              </div>
            ) : (
              <p className="ai-cashvan-message">
                {t("ai_proposal.no_cashvan_description")}
              </p>
            )}
          </section>

          <div className="ai-section-heading">
            <div>
              <h2>{t("ai_proposal.suggested_products")}</h2>
              <p>
                {products.length} {t("ai_proposal.records")}
              </p>
            </div>
            <span className="ai-count">{products.length}</span>
          </div>

          {products.length ? (
            <div className="ai-products">
              {products.map((item) => (
                <article className="ai-product-card" key={item.item_code}>
                  <div className="ai-product-top">
                    <span className="ai-product-code">{item.item_code}</span>
                    <button
                      className="ai-remove"
                      type="button"
                      title={t("ai_proposal.remove_btn")}
                      aria-label={t("ai_proposal.remove_btn")}
                      onClick={() => removeItem(item.item_code)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="ai-product-image">
                    <Image
                      src={item.image || companyPlaceholder}
                      alt={item.name}
                      fill
                      sizes="(max-width: 575px) 45vw, (max-width: 991px) 30vw, 22vw"
                      style={{ objectFit: "contain", padding: 12 }}
                    />
                  </div>

                  <div className="ai-product-body">
                    <h3>{item.name}</h3>
                    <strong className="ai-price">
                      {currenncyCodeToSymbol(item.currency_code || "USD")}{" "}
                      {item.price.toLocaleString()}
                    </strong>

                    <div className="ai-quantity-row">
                      <div className="ai-quantity">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQty(item.item_code, -1)}
                        >
                          <Minus size={14} />
                        </button>
                        <strong>{item.quantity}</strong>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={item.quantity >= item.stock}
                          onClick={() => updateQty(item.item_code, 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="ai-subtotal">
                      <span>{t("ai_proposal.subtotal")}</span>
                      <strong>
                        {currenncyCodeToSymbol(item.currency_code || "USD")}{" "}
                        {(item.price * item.quantity).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="ai-empty">
              <Package size={30} />
              <h3>{t("ai_proposal.suggested_products")}: 0</h3>
              <p>{t("ai_proposal.subtitle")}</p>
              <Button variant="outline-primary" onClick={loadProposal}>
                <RefreshCw size={16} />
                {t("ai_proposal.regenerate_btn")}
              </Button>
            </div>
          )}

          <footer className="ai-summary">
            <div className="ai-summary-count">
              <ShoppingCart size={21} />
              <div>
                <span>{t("ai_proposal.suggested_products")}</span>
                <strong>{products.length}</strong>
              </div>
            </div>

            <div className="ai-summary-total">
              <span>{t("ai_proposal.subtotal")}</span>
              <div className="ai-summary-totals">
                {Object.entries(totalsByCurrency).map(
                  ([currencyCode, total]) => (
                    <strong key={currencyCode}>
                      {currenncyCodeToSymbol(currencyCode)}{" "}
                      {total.toLocaleString()}
                    </strong>
                  ),
                )}
              </div>
            </div>

            <Button
              className="ai-add-btn"
              onClick={addProposalToCart}
              disabled={adding || products.length === 0}
            >
              {adding ? (
                <>
                  <Spinner animation="border" size="sm" />
                  {t("ai_proposal.adding")}
                </>
              ) : (
                <>
                  <ShoppingCart size={17} />
                  {t("ai_proposal.add_all_btn")}
                </>
              )}
            </Button>
          </footer>
        </div>
      </section>
    </Layout>
  );
}
