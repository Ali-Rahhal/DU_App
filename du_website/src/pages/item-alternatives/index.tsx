import { useState } from "react";

import { Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import {
  ArrowDownUp,
  PackageSearch,
  Save,
  SlidersHorizontal,
} from "lucide-react";

import Autocomplete from "@/components/common/Autocomplete";
import Layout from "@/components/Layout/Layout";
import SortableAlternatives from "@/components/item-alternatives/SortableAlternatives";
import AdminGuard from "@/components/guards/AdminGuard";

import {
  getProduct,
  getProducts,
  getItemAlternatives,
  updateItemAlternatives,
} from "@/utils/apiCalls";

import { useCompanyAssets } from "@/hooks/useCompanyAssets";

const ItemAlternatives = () => {
  const t = useTranslations();
  const { companyPlaceholder } = useCompanyAssets();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAlternatives, setSelectedAlternatives] = useState<any[]>([]);
  const [loadingItem, setLoadingItem] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================
  // Load item data
  // =========================

  const loadItemData = async (item: any) => {
    try {
      setLoadingItem(true);
      setSelectedItem(item);
      setSelectedAlternatives([]);

      const altRes = await getItemAlternatives(item.item_code);

      const altResFull: {
        alternative_item_code: string;
        priority: number;
        name: string;
        image: string;
      }[] = await Promise.all(
        altRes.data.result.map(async (alt: any) => {
          const altItem = await getProduct(alt.alternative_item_code);

          const data = altItem.data.result;

          return {
            ...alt,
            name: data.name,
            image: data.image || companyPlaceholder,
          };
        }),
      );

      setSelectedAlternatives(altResFull);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "An error occurred",
      );
    } finally {
      setLoadingItem(false);
    }
  };

  // =========================
  // Save alternatives
  // =========================

  const saveAlternatives = async () => {
    if (!selectedItem) return;

    try {
      setSaving(true);

      const alternativesToSend = selectedAlternatives.map((alt) => ({
        alternative_item_code: alt.alternative_item_code,
        priority: alt.priority,
      }));

      await updateItemAlternatives(selectedItem.item_code, alternativesToSend);

      toast.success("Alternatives updated");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "An error occurred",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGuard>
      <Layout>
        <div className="item-alternatives-page">
          {/* =====================================================
              Header
          ===================================================== */}

          <section className="item-alternatives-page-header">
            <div className="item-alternatives-page-header-content">
              <div className="item-alternatives-page-header-icon">
                <ArrowDownUp size={24} />
              </div>

              <div className="item-alternatives-page-heading">
                <h1 className="item-alternatives-page-title">
                  {t("item_alternatives.title")}
                </h1>

                <p className="item-alternatives-page-subtitle">
                  {t("item_alternatives.description")}
                </p>
              </div>
            </div>
          </section>

          {/* =====================================================
              Content
          ===================================================== */}

          <div className="item-alternatives-content">
            {/* ===================================================
                Product Selection
            =================================================== */}

            <section className="item-alternatives-selection-card">
              <div className="item-alternatives-card-header">
                <div className="item-alternatives-card-icon">
                  <PackageSearch size={19} />
                </div>

                <div>
                  <h2 className="item-alternatives-card-title">
                    {t("item_alternatives.items")}
                  </h2>

                  <p className="item-alternatives-card-subtitle">
                    {t("item_alternatives.search_description")}
                  </p>
                </div>
              </div>

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
                placeholder={t("item_alternatives.search_items")}
              />

              {selectedItem && (
                <div className="item-alternatives-selected-item">
                  <div className="item-alternatives-selected-image">
                    <img
                      src={selectedItem.image || companyPlaceholder}
                      alt={selectedItem.name}
                    />
                  </div>

                  <div className="item-alternatives-selected-info">
                    <span className="item-alternatives-selected-label">
                      Selected item
                    </span>

                    <strong>{selectedItem.name}</strong>

                    <span>{selectedItem.item_code}</span>
                  </div>
                </div>
              )}
            </section>

            {/* ===================================================
                Alternatives
            =================================================== */}

            <section className="item-alternatives-management-card">
              {!selectedItem ? (
                <div className="item-alternatives-empty">
                  <div className="item-alternatives-empty-icon">
                    <SlidersHorizontal size={27} />
                  </div>

                  <h2>{t("item_alternatives.alternatives")}</h2>

                  <p>{t("item_alternatives.search_description")}</p>
                </div>
              ) : (
                <>
                  <div className="item-alternatives-management-header">
                    <div>
                      <h2 className="item-alternatives-card-title">
                        {t("item_alternatives.alternatives")}
                      </h2>

                      <p className="item-alternatives-card-subtitle">
                        {t("item_alternatives.alternatives_description")}
                      </p>
                    </div>

                    <div className="item-alternatives-count">
                      {selectedAlternatives.length}
                    </div>
                  </div>

                  <div className="item-alternatives-search">
                    <Autocomplete
                      multiple
                      fetchFn={(params) =>
                        getProducts({
                          search: params.search,
                          skip: params.skip,
                          take: params.take,
                        })
                      }
                      value={selectedAlternatives.map((a) => ({
                        item_code: a.alternative_item_code,
                        name: a.name,
                        image: a.image,
                      }))}
                      onChange={(vals) =>
                        setSelectedAlternatives((prev) =>
                          vals.map((v, i) => {
                            const existing = prev.find(
                              (p) => p.alternative_item_code === v.item_code,
                            );

                            return {
                              alternative_item_code: v.item_code,
                              name: existing?.name || v.name,
                              image:
                                existing?.image ||
                                v.image ||
                                companyPlaceholder,
                              priority: i + 1,
                            };
                          }),
                        )
                      }
                      placeholder={t("item_alternatives.search_alternatives")}
                      exclude={selectedItem ? [selectedItem.item_code] : []}
                    />
                  </div>

                  {loadingItem ? (
                    <div className="item-alternatives-loading">
                      <Spinner animation="border" size="sm" />

                      <span>Loading alternatives...</span>
                    </div>
                  ) : (
                    <SortableAlternatives
                      alternatives={selectedAlternatives}
                      setAlternatives={setSelectedAlternatives}
                    />
                  )}

                  <div className="item-alternatives-actions">
                    <div className="item-alternatives-priority-hint">
                      <ArrowDownUp size={14} />

                      <span>Drag items to change their priority.</span>
                    </div>

                    <Button
                      className="item-alternatives-save-button"
                      onClick={saveAlternatives}
                      disabled={saving || loadingItem}
                    >
                      {saving ? (
                        <>
                          <Spinner animation="border" size="sm" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {t("item_alternatives.save")}
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

export default ItemAlternatives;
