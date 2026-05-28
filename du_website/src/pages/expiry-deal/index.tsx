import Autocomplete from "@/components/common/Autocomplete";
import Layout from "@/components/Layout/Layout";
import { useAccountStore } from "@/store/zustand";
import { getProducts, getExpiryDeal, updateExpiryDeal } from "@/utils/apiCalls";
import { ROLES } from "@/utils/data";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

const ExpiryDeal = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [expiryMonths, setExpiryMonths] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Authorization Check:
  const rt = useRouter();
  const { role, checkRole } = useAccountStore();
  const hasShownToast = useRef(false);
  useEffect(() => {
    if (!checkRole(ROLES.Admin) && !hasShownToast.current) {
      toast.error("Only Admins can access this page");
      hasShownToast.current = true;
      rt.push("/");
    }
  }, [role]);
  if (!checkRole(ROLES.Admin)) return null;

  // =========================
  // Load item data
  // =========================
  const loadItemData = async (item) => {
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

  const t = useTranslations();

  return (
    <Layout>
      <div className="container mt-5" style={{ minHeight: "60vh" }}>
        <div className="mb-4">
          <h2 style={{ fontWeight: "bold" }}>{t("expiry_deal.title")}</h2>
          <p className="text-muted">{t("expiry_deal.description")}</p>
        </div>

        <div className="row">
          {/* LEFT */}
          <div className="col-12 col-md-4 mb-4">
            <h5>{t("expiry_deal.items")}</h5>
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

          {/* RIGHT */}
          <div className="col-12 col-md-8">
            {!selectedItem ? (
              <div className="text-muted">
                {t("expiry_deal.search_description")}
              </div>
            ) : (
              <div className="mb-4">
                <h5>{t("expiry_deal.expiry_rule")}</h5>

                <div className="text-muted mb-3" style={{ fontSize: 13 }}>
                  {t("expiry_deal.expiry_rule_description")}
                  <strong>{expiryMonths || 0}</strong> {t("expiry_deal.months")}{" "}
                  → <strong>{discount || 0}%</strong>{" "}
                  {t("expiry_deal.discount")}
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>{t("expiry_deal.expiry_threshold")}</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={expiryMonths}
                    onChange={(e) =>
                      setExpiryMonths(Math.max(0, Number(e.target.value)))
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t("expiry_deal.discount_title")}</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(
                        Math.min(100, Math.max(0, Number(e.target.value))),
                      )
                    }
                  />
                </Form.Group>

                <Button onClick={saveDeal} disabled={loading}>
                  {loading ? t("expiry_deal.saving") : t("expiry_deal.save")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExpiryDeal;
