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
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

const Restock = () => {
  const { refreshCart } = useAccountStore();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [minStock, setMinStock] = useState(0);
  const [currentStock, setCurrentStock] = useState<number | null>(null);

  const loadItemData = async (item) => {
    try {
      setSelectedItem(item);
      setCurrentStock(0);

      const restockRes = await getRestockConfig(item.item_code);
      setMinStock(restockRes.data.result?.min_stock || 0);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "An error occurred",
      );
    }
  };

  const saveRestock = async () => {
    try {
      await updateRestockConfig(selectedItem.item_code, minStock);
      toast.success("Restock config saved");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "An error occurred",
      );
    }
  };

  const handleRestock = async () => {
    try {
      const res = await restockItem(selectedItem.item_code, currentStock);
      await refreshCart();
      toast.success(res.data.message);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "An error occurred",
      );
    }
  };

  const t = useTranslations();

  return (
    <Layout>
      <div className="container mt-5" style={{ minHeight: "60vh" }}>
        {/* Header */}
        <div className="mb-4">
          <h2 style={{ fontWeight: "bold" }}>{t("restock")}</h2>
          <p className="text-muted">
            Manage automatic restocking of your inventory.
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
                {/* Restock */}
                <div>
                  <h5>Restock</h5>
                    <div className="text-muted mb-3" style={{ fontSize: 13 }}>
                    💡 Set a minimum stock level and restock quantity to automatically maintain your inventory.
                    </div>

                  <Form.Group className="mb-2">
                    <Form.Label>Minimum Stock</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={minStock}
                      onChange={(e) =>
                        setMinStock(Math.max(0, Number(e.target.value)))
                      }
                    />
                  </Form.Group>
                  <div className="mb-2">
                    <Button onClick={saveRestock}>Save</Button>
                  </div>

                  <Form.Group className="mb-2">
                    <Form.Label>Current Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={currentStock}
                      onChange={(e) => setCurrentStock(Number(e.target.value))}
                    />
                  </Form.Group>
                  <div className="mb-2">
                    <Button variant="success" onClick={handleRestock}>
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

export default Restock;
