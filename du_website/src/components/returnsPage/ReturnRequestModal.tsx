import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge, Button, Card, Form, Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { Undo2, X } from "lucide-react";

import { createReturnRequest, getPurchasedItems } from "@/utils/apiCalls";

import { useCompanyAssets } from "@/hooks/useCompanyAssets";

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

interface ReturnRequestModalProps {
  show: boolean;
  invoiceId: number | null;
  onHide: () => void;
  onSuccess: () => void;
}

const ReturnRequestModal = ({
  show,
  invoiceId,
  onHide,
  onSuccess,
}: ReturnRequestModalProps) => {
  const t = useTranslations();
  const { companyPlaceholder } = useCompanyAssets();

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );
  const [reason, setReason] = useState("");

  const [loadingItems, setLoadingItems] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || !invoiceId) return;

    const loadItems = async () => {
      try {
        setLoadingItems(true);

        const res = await getPurchasedItems(invoiceId);

        setItems(res.data.result || []);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            t("returns.return_request.items_fetch_error"),
        );

        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    loadItems();
  }, [show, invoiceId, t]);

  const resetForm = () => {
    setItems([]);
    setSelectedItems({});
    setReason("");
  };

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onHide();
  };

  const toggleItem = (item: Item) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };

      if (copy[item.item_code] !== undefined) {
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
    if (!invoiceId) return;

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
        reason: reason.trim(),
        items: payloadItems,
      });

      toast.success(t("returns.return_request.success_message"));

      resetForm();
      onHide();
      onSuccess();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || t("returns.return_request.error_message"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      className="return-request-modal"
      scrollable
    >
      <Modal.Header>
        <div className="return-request-modal-header">
          <div className="return-request-modal-icon">
            <Undo2 size={20} />
          </div>

          <div>
            <Modal.Title>{t("returns.return_request.title")}</Modal.Title>

            {invoiceId && (
              <p className="return-request-modal-subtitle">
                {t("returns.return_request.invoice")} #{invoiceId}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="return-request-modal-close"
          onClick={handleClose}
          aria-label={t("returns.return_request.close")}
          disabled={loading}
        >
          <X size={18} />
        </button>
      </Modal.Header>

      <Modal.Body>
        <div className="return-request-modal-intro">
          <h5>{t("returns.return_request.select_items_title")}</h5>

          <p>{t("returns.return_request.select_items_description")}</p>
        </div>

        {loadingItems ? (
          <div className="return-request-modal-loading">
            <Spinner />

            <span>{t("returns.return_request.loading_items")}</span>
          </div>
        ) : items.length === 0 ? (
          <div className="return-request-modal-empty">
            <Undo2 size={32} />

            <p>{t("returns.return_request.no_items")}</p>
          </div>
        ) : (
          <div className="return-request-items">
            {items.map((item) => {
              const selected = selectedItems[item.item_code] !== undefined;

              const maxQty = Math.min(
                item.purchased_quantity,
                item.quantityRestriction,
              );

              const image = item.image || companyPlaceholder;

              return (
                <Card
                  key={item.item_code}
                  className={`return-request-item-card ${
                    selected ? "return-request-item-selected" : ""
                  }`}
                  onClick={() => toggleItem(item)}
                >
                  <Card.Body>
                    <div className="return-request-item-content">
                      <div className="return-request-item-image">
                        <Image
                          src={image}
                          alt={item.item_name}
                          fill
                          unoptimized
                          style={{
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            e.currentTarget.src = companyPlaceholder;
                          }}
                        />
                      </div>

                      <div className="return-request-item-info">
                        <div className="return-request-item-heading">
                          <h6>{item.item_name}</h6>

                          {selected && (
                            <Badge bg="primary" text="white">
                              {t("returns.return_request.selected")}
                            </Badge>
                          )}
                        </div>

                        <div className="return-request-item-code">
                          {item.item_code}
                        </div>

                        <div className="return-request-item-quantity">
                          <span>
                            {t("returns.return_request.purchased_qty")}:
                          </span>

                          <strong>{item.purchased_quantity}</strong>
                        </div>

                        <div className="return-request-item-quantity">
                          <span>
                            {t("returns.return_request.return_limit")}:
                          </span>

                          <strong>{maxQty}</strong>
                        </div>

                        {selected && (
                          <div
                            className="return-request-quantity-control"
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
        )}

        {!loadingItems && items.length > 0 && (
          <Card className="return-request-reason-card">
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
                  disabled={loading}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>

      {!loadingItems && items.length > 0 && (
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            {t("returns.return_request.cancel")}
          </Button>

          <Button variant="primary" onClick={submitRequest} disabled={loading}>
            {loading ? (
              <Spinner size="sm" />
            ) : (
              t("returns.return_request.submit_btn")
            )}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ReturnRequestModal;
