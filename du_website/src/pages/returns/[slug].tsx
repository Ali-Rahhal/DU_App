import Layout from "@/components/Layout/Layout";
import AccountLayout from "@/components/dashboard/AccountLayout";
import { createReturnRequest, getPurchasedItems } from "@/utils/apiCalls";
import { currenncyCodeToSymbol } from "@/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Card, Form, Spinner, Badge } from "react-bootstrap";
import { toast } from "react-toastify";

export async function getServerSideProps(context: any) {
  const { slug } = context.query;
  const id = slug;
  const cookie = context.req.headers.cookie || "";

  try {
    const res = await getPurchasedItems(Number(id), cookie);
    return {
      props: {
        invoiceId: Number(id),
        items: res.data.result || [],
      },
    };
  } catch {
    return {
      props: {
        invoiceId: Number(id),
        items: [],
      },
    };
  }
}

type Item = {
  transaction_body_id: number;
  item_code: string;
  item_name: string;
  purchased_quantity: number;
  quantityRestriction: number;
  item_default_price: string;
  total_final_price: string;
  image: string | null;
};

const ReturnRequestPage = ({
  invoiceId,
  items,
}: {
  invoiceId: number;
  items: Item[];
}) => {
  const t = useTranslations();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleItem = (item: Item) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[item.item_code]) {
        delete copy[item.item_code];
      } else {
        copy[item.item_code] = 1;
      }
      return copy;
    });
  };

  const updateQuantity = (itemCode: string, qty: number, maxQty: number) => {
    qty = Math.max(1, qty);
    qty = Math.min(maxQty, qty);
    setSelectedItems((prev) => ({
      ...prev,
      [itemCode]: qty,
    }));
  };

  const submitRequest = async () => {
    const payloadItems = Object.entries(selectedItems).map(
      ([item_code, quantity]) => ({
        item_code,
        quantity,
      }),
    );

    if (!payloadItems.length) {
      toast.error(t("returns.return_request.select_item_error"));
      return;
    }

    if (!reason.trim()) {
      toast.error(t("returns.return_request.reason_error"));
      return;
    }

    try {
      setLoading(true);
      await createReturnRequest({
        invoice_transaction_header_id: invoiceId,
        reason,
        items: payloadItems,
      });
      toast.success(t("returns.return_request.success_message"));
      router.push("/returns");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || t("returns.return_request.error_message"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <AccountLayout
        title={t("returns.return_request.title")}
        subTitle={`${t("returns.return_request.invoice")} #${invoiceId}`}
      >
        <div className="mb-4">
          <h5>{t("returns.return_request.select_items_title")}</h5>
          <p className="text-muted mb-0">
            {t("returns.return_request.select_items_description")}
          </p>
        </div>

        <div className="d-flex flex-column gap-3">
          {items.map((item) => {
            const selected = selectedItems[item.item_code] !== undefined;
            const maxQty = Math.min(
              item.purchased_quantity,
              item.quantityRestriction,
            );
            const image =
              item.image || process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE;

            return (
              <Card
                key={item.item_code}
                className={`border ${
                  selected ? "border-primary shadow-sm" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => toggleItem(item)}
              >
                <Card.Body>
                  <div className="d-flex gap-3">
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={image}
                        alt={item.item_name}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-1">{item.item_name}</h6>
                        {selected && (
                          <Badge bg="primary" text="light">
                            {t("returns.return_request.selected")}
                          </Badge>
                        )}
                      </div>

                      <div className="text-muted small mb-2">
                        {item.item_code}
                      </div>

                      <div className="small">
                        {t("returns.return_request.purchased_qty")}:{" "}
                        <strong>{item.purchased_quantity}</strong>
                      </div>

                      <div className="small">
                        {t("returns.return_request.return_limit")}:{" "}
                        <strong>{maxQty}</strong>
                      </div>

                      {selected && (
                        <div
                          className="mt-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Form.Label>
                            {t("returns.return_request.quantity_to_return")}
                          </Form.Label>
                          <Form.Control
                            type="number"
                            min={1}
                            max={maxQty}
                            value={selectedItems[item.item_code]}
                            onChange={(e) =>
                              updateQuantity(
                                item.item_code,
                                Number(e.target.value),
                                maxQty,
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>

        <Card className="mt-4">
          <Card.Body>
            <Form.Group>
              <Form.Label>
                {t("returns.return_request.return_reason")}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("returns.return_request.reason_placeholder")}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <div className="mt-4 d-grid">
          <Button size="lg" onClick={submitRequest} disabled={loading}>
            {loading ? (
              <Spinner size="sm" />
            ) : (
              t("returns.return_request.submit_btn")
            )}
          </Button>
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default ReturnRequestPage;
