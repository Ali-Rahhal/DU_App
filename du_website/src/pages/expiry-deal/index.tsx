import { useState } from "react";

import { Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import {
  CalendarClock,
  Percent,
  PackageSearch,
  Save,
  Info,
} from "lucide-react";

import Autocomplete from "@/components/common/Autocomplete";
import Layout from "@/components/Layout/Layout";
import AdminGuard from "@/components/guards/AdminGuard";

import { getProducts, getExpiryDeal, updateExpiryDeal } from "@/utils/apiCalls";

const ExpiryDeal = () => {
  const t = useTranslations();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [expiryMonths, setExpiryMonths] = useState<any>(0);
  const [discount, setDiscount] = useState<any>(0);
  const [loading, setLoading] = useState(false);

  // =========================
  // Load item data
  // =========================

  const loadItemData = async (item: any) => {
    try {
      setSelectedItem(item);
      setExpiryMonths(0);
      setDiscount(0);

      const res = await getExpiryDeal(item.item_code);

      if (res.data.result) {
        setExpiryMonths(res.data.result.expiry_threshold_months || 0);

        setDiscount(res.data.result.discount_percentage || 0);
      }
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "An error occurred",
      );
    }
  };

  // =========================
  // Save
  // =========================

  const saveDeal = async () => {
    if (!selectedItem) return;

    if (expiryMonths < 0) {
      return toast.error("Expiry months must be >= 0");
    }

    if (discount < 0 || discount > 100) {
      return toast.error("Discount must be between 0 and 100");
    }

    try {
      setLoading(true);

      await updateExpiryDeal(selectedItem.item_code, expiryMonths, discount);

      toast.success("Expiry deal saved");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <Layout>
        <div className="expiry-deal-page">
          {/* =====================================================
              Header
          ===================================================== */}

          <section className="expiry-deal-page-header">
            <div className="expiry-deal-page-header-content">
              <div className="expiry-deal-page-header-icon">
                <CalendarClock size={24} />
              </div>

              <div className="expiry-deal-page-heading">
                <h1 className="expiry-deal-page-title">
                  {t("expiry_deal.title")}
                </h1>

                <p className="expiry-deal-page-subtitle">
                  {t("expiry_deal.description")}
                </p>
              </div>
            </div>
          </section>

          {/* =====================================================
              Content
          ===================================================== */}

          <div className="expiry-deal-content">
            {/* ===================================================
                Item Selection
            =================================================== */}

            <section className="expiry-deal-selection-card">
              <div className="expiry-deal-card-header">
                <div className="expiry-deal-card-icon">
                  <PackageSearch size={19} />
                </div>

                <div>
                  <h2 className="expiry-deal-card-title">
                    {t("expiry_deal.items")}
                  </h2>

                  <p className="expiry-deal-card-subtitle">
                    {t("expiry_deal.search_description")}
                  </p>
                </div>
              </div>

              <div className="expiry-deal-search">
                <Autocomplete
                  fetchFn={(params) =>
                    getProducts({
                      search: params.search,
                      skip: params.skip,
                      take: params.take,
                    })
                  }
                  value={selectedItem}
                  onChange={(item) => loadItemData(item)}
                  placeholder={t("expiry_deal.search_items")}
                />
              </div>

              {selectedItem && (
                <div className="expiry-deal-selected-item">
                  <div className="expiry-deal-selected-item-icon">
                    <PackageSearch size={17} />
                  </div>

                  <div className="expiry-deal-selected-item-info">
                    <span className="expiry-deal-selected-item-label">
                      Selected item
                    </span>

                    <strong>
                      {selectedItem.name ||
                        selectedItem.item_name ||
                        selectedItem.item_code}
                    </strong>

                    <span>{selectedItem.item_code}</span>
                  </div>
                </div>
              )}
            </section>

            {/* ===================================================
                Settings
            =================================================== */}

            <section className="expiry-deal-settings-card">
              {!selectedItem ? (
                <div className="expiry-deal-empty">
                  <div className="expiry-deal-empty-icon">
                    <CalendarClock size={27} />
                  </div>

                  <h2>{t("expiry_deal.expiry_rule")}</h2>

                  <p>{t("expiry_deal.search_description")}</p>
                </div>
              ) : (
                <>
                  <div className="expiry-deal-settings-header">
                    <div>
                      <h2 className="expiry-deal-card-title">
                        {t("expiry_deal.expiry_rule")}
                      </h2>

                      <p className="expiry-deal-card-subtitle">
                        {t("expiry_deal.expiry_rule_description")}
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="expiry-deal-summary">
                    <div className="expiry-deal-summary-item">
                      <div className="expiry-deal-summary-icon expiry-deal-summary-icon-months">
                        <CalendarClock size={17} />
                      </div>

                      <div>
                        <span>Threshold</span>
                        <strong>
                          {expiryMonths || 0} {t("expiry_deal.months")}
                        </strong>
                      </div>
                    </div>

                    <div className="expiry-deal-summary-item">
                      <div className="expiry-deal-summary-icon expiry-deal-summary-icon-discount">
                        <Percent size={17} />
                      </div>

                      <div>
                        <span>{t("expiry_deal.discount")}</span>

                        <strong>{discount || 0}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="expiry-deal-form">
                    <Form.Group className="expiry-deal-form-group">
                      <Form.Label>
                        {t("expiry_deal.expiry_threshold")}
                      </Form.Label>

                      <div className="expiry-deal-input-wrapper">
                        <Form.Control
                          type="number"
                          min="0"
                          value={expiryMonths}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setExpiryMonths("");
                            } else {
                              setExpiryMonths(Math.max(0, Number(val)));
                            }
                          }}
                          onBlur={() => {
                            if (expiryMonths === "") setExpiryMonths(0);
                          }}
                        />

                        <span>{t("expiry_deal.months")}</span>
                      </div>
                    </Form.Group>

                    <Form.Group className="expiry-deal-form-group">
                      <Form.Label>{t("expiry_deal.discount_title")}</Form.Label>

                      <div className="expiry-deal-input-wrapper">
                        <Form.Control
                          type="number"
                          min="0"
                          max="100"
                          value={discount}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setDiscount("");
                            } else {
                              setDiscount(
                                Math.min(
                                  100,
                                  Math.max(0, Number(e.target.value)),
                                ),
                              );
                            }
                          }}
                          onBlur={() => {
                            if (discount === "") setDiscount(0);
                          }}
                        />

                        <span>%</span>
                      </div>
                    </Form.Group>
                  </div>

                  {/* Save */}
                  <div className="expiry-deal-actions">
                    <Button
                      className="expiry-deal-save-button"
                      onClick={saveDeal}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" />
                          {t("expiry_deal.saving")}
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {t("expiry_deal.save")}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </Layout>
    </AdminGuard>
  );
};

export default ExpiryDeal;
