import Autocomplete from "@/components/common/Autocomplete";
import Layout from "@/components/Layout/Layout";
import SortableAlternatives from "@/components/item-alternatives/SortableAlternatives";
import {
  getProduct,
  getProducts,
  getItemAlternatives,
  updateItemAlternatives,
} from "@/utils/apiCalls";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

const ItemAlternatives = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAlternatives, setSelectedAlternatives] = useState<any[]>([]);

  const loadItemData = async (item) => {
    try {
      setSelectedItem(item);
      const altRes = await getItemAlternatives(item.item_code);

      const altResFull: {
        alternative_item_code: string;
        priority: number;
        name: string;
        image: string;
      }[] = await Promise.all(
        altRes.data.result.map(async (alt) => {
          const altItem = await getProduct(alt.alternative_item_code);
          const data = altItem.data.result;

          return {
            ...alt,
            name: data.name,
            image:
              data.image || process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE,
          };
        }),
      );

      setSelectedAlternatives(altResFull);
    } catch (e) {
      toast.error(e.response.data.message);
    }
  };

  const saveAlternatives = async () => {
    try {
      const alternativesToSend = selectedAlternatives.map((alt) => ({
        alternative_item_code: alt.alternative_item_code,
        priority: alt.priority,
      }));
      await updateItemAlternatives(selectedItem.item_code, alternativesToSend);
      toast.success("Alternatives updated");
    } catch (e) {
      toast.error(e.response.data.message);
    }
  };

  const t = useTranslations();

  return (
    <Layout>
      <div className="container mt-5" style={{ minHeight: "60vh" }}>
        {/* Header */}
        <div className="mb-4">
          <h2 style={{ fontWeight: "bold" }}>{t("item_alternatives")}</h2>
          <p className="text-muted">Manage item alternatives.</p>
        </div>

        <div className="row">
          <div className="col-12 col-md-4 mb-4">
            <h5>Items</h5>
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
              placeholder="Search items..."
            />
          </div>

          <div className="col-12 col-md-8">
            {!selectedItem ? (
              <div className="text-muted">
                Select an item to manage alternatives
              </div>
            ) : (
              <>
                {/* Alternatives */}
                <div className="mb-4">
                  <h5>Alternatives</h5>
                  <div className="text-muted mb-2" style={{ fontSize: 13 }}>
                    💡 Drag to reorder. Top item = highest priority.
                  </div>

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
                      setSelectedAlternatives((prev) => {
                        return vals.map((v, i) => {
                          const existing = prev.find(
                            (p) => p.alternative_item_code === v.item_code,
                          );

                          return {
                            alternative_item_code: v.item_code,
                            name: existing?.name || v.name,
                            image:
                              existing?.image ||
                              v.image ||
                              process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE,
                            priority: i + 1,
                          };
                        });
                      })
                    }
                    placeholder="Search alternatives..."
                    exclude={selectedItem ? [selectedItem.item_code] : []}
                  />

                  {/* Drag & Drop */}
                  <SortableAlternatives
                    alternatives={selectedAlternatives}
                    setAlternatives={setSelectedAlternatives}
                  />

                  <Button className="mt-2" onClick={saveAlternatives}>
                    Save Alternatives
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ItemAlternatives;
