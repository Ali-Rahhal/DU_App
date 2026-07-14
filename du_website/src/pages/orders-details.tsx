import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import { currenncyCodeToSymbol } from "@/utils";
import { getOrder, getOrderDetails } from "@/utils/apiCalls";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const OrderDetails = () => {
  const [orderItems, setOrderItems] = useState([]);
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
  const rt = useRouter();
  const t = useTranslations();
  const { companyPlaceholder } = useCompanyAssets();

  const fetchOrder = async (order_id: string) => {
    await getOrderDetails(order_id)
      .then((res) => {
        setOrderItems(res.data.result);
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || t("order_details.fetch_error"),
        );
      });
    await getOrder(order_id)
      .then((res) => {
        setOrder(res.data.result);
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || t("order_details.fetch_error"),
        );
      });
  };

  useEffect(() => {
    const { id } = rt.query;
    if (!id) return;
    fetchOrder(id as string);
  }, [rt.query]);

  const getPaymentTypeText = (paymentType: number) => {
    if (paymentType === 1) return t("order_details.credit");
    if (paymentType === 2) return t("order_details.cash_on_delivery");
    return t("order_details.na");
  };

  return (
    <Layout>
      <AccountLayout
        title={t("order_details.title")}
        subTitle={t("order_details.subtitle")}
      >
        <div className="card">
          <div className="card-body">
            <div
              className="cart_product border-0"
              style={{
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              {orderItems.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa fa-shopping-bag fa-3x text-muted mb-3"></i>
                  <p className="text-muted">{t("order_details.no_items")}</p>
                </div>
              ) : (
                orderItems.map((order) => {
                  const isFree = parseFloat(order.discountedPrice) === 0;
                  return (
                    <div className="cart_item px-0" key={order.id}>
                      <div className="cart_item_image">
                        <Image
                          width={200}
                          height={200}
                          style={{
                            objectFit: "contain",
                            width: "100%",
                            height: "100%",
                          }}
                          src={order.image || companyPlaceholder}
                          alt="shop"
                        />
                      </div>
                      <div className="c-item-body">
                        <div className="cart_item_title mb-2">
                          <h4>{`${order.name} x ${order.quantity}`}</h4>
                          <p className="small mb-0 text-muted">
                            {order.description}
                          </p>
                        </div>
                        <div className="cart_item_price">
                          <div className="product-price">
                            <span>
                              {isFree ? (
                                <span
                                  style={{
                                    color: "green",
                                    fontWeight: "bold",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  <strong>{t("order_details.free")}</strong>
                                </span>
                              ) : (
                                <strong>
                                  {currenncyCodeToSymbol(order.currency_code)}{" "}
                                  {parseFloat(
                                    order.discountedPrice,
                                  ).toLocaleString()}{" "}
                                </strong>
                              )}
                            </span>
                          </div>
                          {!isFree && (
                            <div className="cart_product_remove">
                              <a href="#">
                                <i className="ti-truck"></i>{" "}
                                {t("order_details.return_item")}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="row mt-4">
              <div className="col-lg-12">
                <div className="border p-3 mb-4">
                  <h5 className="details">{t("order_details.order_info")}</h5>

                  <div className="row no-gutters">
                    <div className="col-auto">
                      <i className="ti-shopping-cart text-secondary mr-2"></i>
                    </div>
                    <div className="col">
                      <p className="text-muted small mb-2">
                        <strong>{t("order_details.amount")}:</strong>{" "}
                        {currenncyCodeToSymbol(order.currency_code)}{" "}
                        {order.totalAmount?.toLocaleString() || "0"}{" "}
                      </p>
                    </div>
                  </div>

                  <div className="row no-gutters">
                    <div className="col-auto">
                      <i className="ti-credit-card text-secondary mr-2"></i>
                    </div>
                    <div className="col">
                      <p className="text-muted small mb-2">
                        <strong>{t("order_details.payment_type")}:</strong>{" "}
                        {getPaymentTypeText(order?.paymentType)}
                      </p>
                    </div>
                  </div>

                  <div className="row no-gutters">
                    <div className="col-auto">
                      <i className="ti-calendar text-secondary mr-2"></i>
                    </div>
                    <div className="col">
                      <p className="text-muted small mb-2">
                        <strong>{t("order_details.order_received_on")}:</strong>{" "}
                        {new Date(order.creationDate).toLocaleString(
                          t("order_details.locale"),
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="row no-gutters">
                    <div className="col-auto">
                      <i className="ti-map-alt text-secondary mr-2"></i>
                    </div>
                    <div className="col">
                      <p className="text-muted small mb-2">
                        <strong>{t("order_details.delivery_address")}:</strong>{" "}
                        {order?.address || t("order_details.na")}
                      </p>
                    </div>
                  </div>

                  <div className="row no-gutters">
                    <div className="col-auto">
                      <i className="ti-mobile text-secondary mr-2"></i>
                    </div>
                    <div className="col">
                      <p className="text-muted small mb-0">
                        <strong>{t("order_details.phone_number")}:</strong>{" "}
                        {order?.phone || t("order_details.na")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ul className="timeline mt-4">
              <li
                className={`timeline-item ${order.status >= 3 ? "active" : ""}`}
              >
                <div className="timeline-figure">
                  <span className="tile tile-circle tile-sm">
                    <i className="ti-arrow-circle-down"></i>
                  </span>
                </div>
                <div className="timeline-body">
                  <div className="media">
                    <div className="media-body">
                      <h6 className="timeline-heading">
                        {t("order_details.order_placed")}
                      </h6>
                    </div>
                    <div className="d-none d-sm-block">
                      <span className="timeline-date">
                        {new Date(order.creationDate).toLocaleString(
                          t("order_details.locale"),
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </li>

              <li
                className={`timeline-item ${order.status >= 4 ? "active" : ""}`}
              >
                <div className="timeline-figure">
                  <span className="tile tile-circle tile-sm">
                    <i className="ti-arrow-circle-down"></i>
                  </span>
                </div>
                <div className="timeline-body">
                  <div className="media">
                    <div className="media-body">
                      <h6 className="timeline-heading">
                        <a href="#" className="text-link">
                          {t("order_details.order_approved")}
                        </a>
                      </h6>
                    </div>
                  </div>
                </div>
              </li>

              <li
                className={`timeline-item ${order.status >= 4 ? "active" : ""}`}
              >
                <div className="timeline-figure">
                  <span className="tile tile-circle tile-sm">
                    <i className="ti-arrow-circle-down"></i>
                  </span>
                </div>
                <div className="timeline-body">
                  <div className="media">
                    <div className="media-body">
                      <h6 className="timeline-heading">
                        <a href="#" className="text-link">
                          {t("order_details.awaiting_delivery")}
                        </a>
                      </h6>
                    </div>
                    {order.status === 4 && (
                      <div className="d-none d-sm-block">
                        <span className="timeline-date">
                          {new Date(order.lastEdited).toLocaleString(
                            t("order_details.locale"),
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </li>

              <li
                className={`timeline-item ${
                  order.status >= 8 ? "active" : ""
                } last`}
              >
                <div className="timeline-figure">
                  <span className="tile tile-circle tile-sm">
                    <i className="ti-arrow-circle-down"></i>
                  </span>
                </div>
                <div className="timeline-body">
                  <div className="media">
                    <div className="media-body">
                      <h6 className="timeline-heading">
                        <a href="#" className="text-link">
                          {t("order_details.delivered_successfully")}
                        </a>
                      </h6>
                    </div>
                    {order.status >= 8 && (
                      <div className="d-none d-sm-block">
                        <span className="timeline-date">
                          {new Date(order.lastEdited).toLocaleString(
                            t("order_details.locale"),
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default OrderDetails;
