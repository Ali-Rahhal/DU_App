import Autocomplete from "@/components/common/Autocomplete";
import Layout from "@/components/Layout/Layout";
import SortableAlternatives from "@/components/stock-management/SortableAlternatives";
import {
  getProduct,
  getProducts,
  getItemAlternatives,
  updateItemAlternatives,
  getRestockConfig,
  updateRestockConfig,
  restockItem,
} from "@/utils/apiCalls";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

const StockManagement = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAlternatives, setSelectedAlternatives] = useState<any[]>([]);
  const [restock, setRestock] = useState({
    min_stock: 0,
    reorder_quantity: 0,
    auto_trigger: false,
  });
  const [currentStock, setCurrentStock] = useState<number | null>(null);

  const loadItemData = async (item) => {
    try {
      setSelectedItem(item);
      setCurrentStock(item.stock ?? 0);
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

      const restockRes = await getRestockConfig(item.item_code);
      setRestock(
        restockRes.data.result || {
          min_stock: 0,
          reorder_quantity: 0,
          auto_trigger: false,
        },
      );
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

  const saveRestock = async () => {
    try {
      await updateRestockConfig(selectedItem.item_code, restock);
      toast.success("Restock config saved");
    } catch (e) {
      toast.error(e.response.data.message);
    }
  };

  const handleRestock = async () => {
    try {
      await restockItem(selectedItem.item_code);
      toast.success("Stock increased");

      setCurrentStock((prev) => (prev || 0) + restock.reorder_quantity);
    } catch (e) {
      toast.error(e.response.data.message);
    }
  };

  return (
    <Layout>
      <div className="container mt-5" style={{ minHeight: "60vh" }}>
        {/* Header */}
        <div className="mb-4">
          <h2 style={{ fontWeight: "bold" }}>Stock Management</h2>
          <p className="text-muted">
            Manage item alternatives and automatic restocking rules.
          </p>
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
              <div className="text-muted">Select an item to manage stock</div>
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

                {/* Restock */}
                <div>
                  <h5>Restock</h5>
                  <div className="text-muted mb-2" style={{ fontSize: 13 }}>
                    💡 Auto trigger can be used later for automation jobs.
                  </div>

                  <div className="mb-2">
                    <strong>Current Stock:</strong>{" "}
                    <span
                      style={{
                        color:
                          currentStock !== null &&
                          currentStock <= restock.min_stock
                            ? "red"
                            : "green",
                        fontWeight: "bold",
                      }}
                    >
                      {currentStock}
                    </span>
                  </div>

                  <Form.Group className="mb-2">
                    <Form.Label>Minimum Stock</Form.Label>
                    <Form.Control
                      type="number"
                      value={restock.min_stock}
                      onChange={(e) =>
                        setRestock({
                          ...restock,
                          min_stock: Number(e.target.value),
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Reorder Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={restock.reorder_quantity}
                      onChange={(e) =>
                        setRestock({
                          ...restock,
                          reorder_quantity: Number(e.target.value),
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Check
                    type="checkbox"
                    label="Auto trigger"
                    checked={restock.auto_trigger}
                    onChange={(e) =>
                      setRestock({
                        ...restock,
                        auto_trigger: e.target.checked,
                      })
                    }
                  />

                  <div className="my-3 d-flex flex-wrap">
                    <Button
                      onClick={saveRestock}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="success"
                      onClick={handleRestock}
                      disabled={!restock.reorder_quantity}
                    >
                      Restock Now
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StockManagement;
