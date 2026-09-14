import Autocomplete from "@/components/common/Autocomplete";
import Layout from "@/components/Layout/Layout";

import { useAccountStore } from "@/store/zustand";

import {
  getProducts,
  getRestockConfig,
  updateRestockConfig,
  restockItem,
} from "@/utils/apiCalls";

import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { PackageSearch, RefreshCw, Save, Warehouse } from "lucide-react";

const Restock = () => {
  const t = useTranslations();
  const { refreshCart } = useAccountStore();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [minStock, setMinStock] = useState<any>(0);
  const [currentStock, setCurrentStock] = useState<any | null>(null);

  const [loadingItem, setLoadingItem] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restocking, setRestocking] = useState(false);

  const loadItemData = async (item: any) => {
    if (!item) {
      setSelectedItem(null);
      setMinStock(0);
      setCurrentStock(null);
      return;
    }

    try {
      setLoadingItem(true);
      setSelectedItem(item);
      setCurrentStock(0);
      setMinStock(0);

      const restockRes = await getRestockConfig(item.item_code);

      setMinStock(restockRes.data.result?.min_stock || 0);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "An error occurred",
      );
    } finally {
      setLoadingItem(false);
    }
  };

  const saveRestock = async () => {
    if (!selectedItem) return;

    try {
      setSaving(true);

      await updateRestockConfig(selectedItem.item_code, minStock);

      toast.success("Restock config saved");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "An error occurred",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRestock = async () => {
    if (!selectedItem || currentStock === null) return;

    try {
      setRestocking(true);

      const res = await restockItem(selectedItem.item_code, currentStock);

      await refreshCart();

      toast.success(res.data.message);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "An error occurred",
      );
    } finally {
      setRestocking(false);
    }
  };

  return (
    <Layout>
      <div className="restock-page">
        <section className="restock-page-header">
          <div className="restock-page-header-content">
            <div className="restock-page-header-icon">
              <RefreshCw size={24} />
            </div>

            <div className="restock-page-heading">
              <h1 className="restock-page-title">{t("restock.title")}</h1>

              <p className="restock-page-subtitle">
                {t("restock.description")}
              </p>
            </div>
          </div>
        </section>

        <div className="restock-content">
          {/* Product selection */}
          <section className="restock-selection-card">
            <div className="restock-card-header">
              <div className="restock-card-header-icon">
                <PackageSearch size={19} />
              </div>

              <div>
                <h2 className="restock-card-title">{t("restock.items")}</h2>

                <p className="restock-card-subtitle">
                  {t("restock.search_description")}
                </p>
              </div>
            </div>

            <div className="restock-search">
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
                placeholder={t("restock.search_items")}
              />
            </div>

            {selectedItem && (
              <div className="restock-selected-item">
                <div className="restock-selected-item-icon">
                  <Warehouse size={18} />
                </div>

                <div className="restock-selected-item-info">
                  <span className="restock-selected-item-label">
                    Selected item
                  </span>

                  <strong>{selectedItem.name}</strong>

                  <span>{selectedItem.item_code}</span>
                </div>
              </div>
            )}
          </section>

          {/* Restock configuration */}
          <section className="restock-config-card">
            <div className="restock-config-header">
              <div>
                <h2 className="restock-config-title">{t("restock.title")}</h2>

                <p className="restock-config-subtitle">
                  {t("restock.restock_description")}
                </p>
              </div>
            </div>

            {!selectedItem ? (
              <div className="restock-empty">
                <div className="restock-empty-icon">
                  <PackageSearch size={24} />
                </div>

                <h3>{t("restock.search_items")}</h3>

                <p>{t("restock.search_description")}</p>
              </div>
            ) : loadingItem ? (
              <div className="restock-loading">
                <Spinner animation="border" size="sm" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="restock-form">
                <div className="restock-form-section">
                  <div className="restock-form-section-header">
                    <div>
                      <h3>{t("restock.minimum_stock")}</h3>
                    </div>
                  </div>

                  <Form.Group className="restock-field">
                    <Form.Control
                      type="number"
                      min="0"
                      value={minStock}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setMinStock("");
                        } else {
                          setMinStock(Math.max(0, Number(val)));
                        }
                      }}
                      onBlur={() => {
                        if (minStock === "") setMinStock(0);
                      }}
                    />
                  </Form.Group>

                  <Button
                    className="restock-save-button"
                    onClick={saveRestock}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {t("restock.save")}
                      </>
                    )}
                  </Button>
                </div>

                <div className="restock-divider" />

                <div className="restock-form-section">
                  <div className="restock-form-section-header">
                    <div>
                      <h3>{t("restock.current_quantity")}</h3>
                    </div>
                  </div>

                  <Form.Group className="restock-field">
                    <Form.Control
                      type="number"
                      min="0"
                      value={currentStock ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setCurrentStock("");
                        } else {
                          setCurrentStock(Math.max(0, Number(val)));
                        }
                      }}
                      onBlur={() => {
                        if (currentStock === "") setCurrentStock(0);
                      }}
                    />
                  </Form.Group>

                  <Button
                    variant="success"
                    className="restock-now-button"
                    onClick={handleRestock}
                    disabled={restocking || currentStock === null}
                  >
                    {restocking ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Restocking...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        {t("restock.restock_now")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Restock;
