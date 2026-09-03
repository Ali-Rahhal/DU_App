import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import { currenncyCodeToSymbol } from "@/utils";
import { getOrder, getOrderDetails } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

interface OrderDetailsModalProps {
  orderId: string | null;
  show: boolean;
  onHide: () => void;
}

const OrderDetailsModal = ({
  orderId,
  show,
  onHide,
}: OrderDetailsModalProps) => {
  const t = useTranslations();
  const { companyPlaceholder } = useCompanyAssets();

  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [order, setOrder] = useState({
    id: "",
    orderNb: "",
    creationDate: "",
    account: "",
    status: 0,
    status_text: "",
    phone: "",
    brand: "",
    brand_description: "",
    items: 0,
    currency_code: "",
    total_amount: "",
    lastEdited: "",
    paymentType: 0,
    totalAmount: 0,
    address: "",
  });

  useEffect(() => {
    if (!show || !orderId) return;

    const fetchOrder = async () => {
      setLoading(true);

      try {
        const [detailsResponse, orderResponse] = await Promise.all([
          getOrderDetails(orderId),
          getOrder(orderId),
        ]);

        setOrderItems(detailsResponse.data.result);
        setOrder(orderResponse.data.result);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || t("order_details.fetch_error"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [show, orderId, t]);

  const getPaymentTypeText = (paymentType: number) => {
    if (paymentType === 1) {
      return t("order_details.credit");
    }

    if (paymentType === 2) {
      return t("order_details.cash_on_delivery");
    }

    return t("order_details.na");
  };

  const renderDate = (date: string) => {
    if (!date) return t("order_details.na");

    return new Date(date).toLocaleString(t("order_details.locale"), {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      scrollable
      className="order-details-modal"
    >
      <Modal.Header>
        <div className="order-details-modal-heading">
          <div className="order-details-modal-heading-icon">
            <i className="ti-shopping-cart"></i>
          </div>

          <div>
            <h5>{t("order_details.title")}</h5>

            {order.orderNb && <span>#{order.orderNb}</span>}
          </div>
        </div>

        <button
          type="button"
          className="order-details-modal-close"
          onClick={onHide}
          aria-label="Close"
        >
          <i className="ti-close"></i>
        </button>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="order-details-modal-loading">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <div className="order-details-modal-content">
            {/* =================================================
                Order Items
                ================================================= */}

            <section className="order-details-modal-section">
              <div className="order-details-modal-section-header">
                <div className="order-details-modal-section-title">
                  <i className="ti-shopping-cart"></i>
                  <span>{t("order_details.title")}</span>
                </div>

                {orderItems.length > 0 && (
                  <span className="order-details-modal-count">
                    {orderItems.length}
                  </span>
                )}
              </div>

              <div className="order-details-modal-items">
                {orderItems.length === 0 ? (
                  <div className="order-details-modal-no-items">
                    <div className="order-details-modal-no-items-icon">
                      <i className="fa fa-shopping-bag"></i>
                    </div>

                    <p>{t("order_details.no_items")}</p>
                  </div>
                ) : (
                  orderItems.map((item) => {
                    const isFree = parseFloat(item.discountedPrice) === 0;

                    return (
                      <div className="order-details-modal-item" key={item.id}>
                        <div className="order-details-modal-item-image">
                          <Image
                            width={90}
                            height={90}
                            src={item.image || companyPlaceholder}
                            alt={item.name}
                          />
                        </div>

                        <div className="order-details-modal-item-content">
                          <div className="order-details-modal-item-top">
                            <h4>{item.name}</h4>

                            <span>× {item.quantity}</span>
                          </div>

                          <div className="order-details-modal-item-bottom">
                            {isFree ? (
                              <span className="order-details-modal-free">
                                {t("order_details.free")}
                              </span>
                            ) : (
                              <strong>
                                {currenncyCodeToSymbol(item.currency_code)}{" "}
                                {parseFloat(
                                  item.discountedPrice,
                                ).toLocaleString()}
                              </strong>
                            )}

                            {!isFree && (
                              <a href="#">
                                <i className="ti-truck"></i>
                                {t("order_details.return_item")}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* =================================================
                Order Information
                ================================================= */}

            <section className="order-details-modal-section">
              <div className="order-details-modal-section-header">
                <div className="order-details-modal-section-title">
                  <i className="ti-info-alt"></i>
                  <span>{t("order_details.order_info")}</span>
                </div>
              </div>

              <div className="order-details-modal-info-grid">
                <div className="order-details-modal-info-item">
                  <div className="order-details-modal-info-icon">
                    <i className="ti-shopping-cart"></i>
                  </div>

                  <div>
                    <span>{t("order_details.amount")}</span>

                    <strong>
                      {currenncyCodeToSymbol(order.currency_code)}{" "}
                      {order.totalAmount?.toLocaleString() || "0"}
                    </strong>
                  </div>
                </div>

                <div className="order-details-modal-info-item">
                  <div className="order-details-modal-info-icon">
                    <i className="ti-credit-card"></i>
                  </div>

                  <div>
                    <span>{t("order_details.payment_type")}</span>

                    <strong>{getPaymentTypeText(order.paymentType)}</strong>
                  </div>
                </div>

                <div className="order-details-modal-info-item">
                  <div className="order-details-modal-info-icon">
                    <i className="ti-calendar"></i>
                  </div>

                  <div>
                    <span>{t("order_details.order_received_on")}</span>

                    <strong>{renderDate(order.creationDate)}</strong>
                  </div>
                </div>

                <div className="order-details-modal-info-item">
                  <div className="order-details-modal-info-icon">
                    <i className="ti-map-alt"></i>
                  </div>

                  <div>
                    <span>{t("order_details.delivery_address")}</span>

                    <strong>{order.address || t("order_details.na")}</strong>
                  </div>
                </div>

                <div className="order-details-modal-info-item">
                  <div className="order-details-modal-info-icon">
                    <i className="ti-mobile"></i>
                  </div>

                  <div>
                    <span>{t("order_details.phone_number")}</span>

                    <strong>{order.phone || t("order_details.na")}</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                Order Timeline
                ================================================= */}

            <section className="order-details-modal-section">
              <div className="order-details-modal-section-header">
                <div className="order-details-modal-section-title">
                  <i className="ti-time"></i>
                  <span>{t("order_details.title")}</span>
                </div>
              </div>

              <div className="order-details-modal-timeline-wrapper">
                <ul className="order-details-modal-timeline">
                  {/* Order Placed */}

                  <li
                    className={`order-details-modal-timeline-item ${
                      order.status >= 3 ? "active" : ""
                    }`}
                  >
                    <div className="order-details-modal-timeline-icon">
                      <i className="ti-arrow-circle-down"></i>
                    </div>

                    <div className="order-details-modal-timeline-content">
                      <h6>{t("order_details.order_placed")}</h6>

                      <span>{renderDate(order.creationDate)}</span>
                    </div>
                  </li>

                  {/* Order Approved */}

                  <li
                    className={`order-details-modal-timeline-item ${
                      order.status >= 4 ? "active" : ""
                    }`}
                  >
                    <div className="order-details-modal-timeline-icon">
                      <i className="ti-arrow-circle-down"></i>
                    </div>

                    <div className="order-details-modal-timeline-content">
                      <h6>{t("order_details.order_approved")}</h6>
                    </div>
                  </li>

                  {/* Awaiting Delivery */}

                  <li
                    className={`order-details-modal-timeline-item ${
                      order.status >= 4 ? "active" : ""
                    }`}
                  >
                    <div className="order-details-modal-timeline-icon">
                      <i className="ti-arrow-circle-down"></i>
                    </div>

                    <div className="order-details-modal-timeline-content">
                      <h6>{t("order_details.awaiting_delivery")}</h6>

                      {order.status === 4 && (
                        <span>{renderDate(order.lastEdited)}</span>
                      )}
                    </div>
                  </li>

                  {/* Delivered */}

                  <li
                    className={`order-details-modal-timeline-item ${
                      order.status >= 8 ? "active" : ""
                    } last`}
                  >
                    <div className="order-details-modal-timeline-icon">
                      <i className="ti-arrow-circle-down"></i>
                    </div>

                    <div className="order-details-modal-timeline-content">
                      <h6>{t("order_details.delivered_successfully")}</h6>

                      {order.status >= 8 && (
                        <span>{renderDate(order.lastEdited)}</span>
                      )}
                    </div>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default OrderDetailsModal;
