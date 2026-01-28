import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { currenncyCodeToSymbol } from "@/utils";
import { getOrder, getOrderDetails } from "@/utils/apiCalls";
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

  const fetchOrder = async (order_id: string) => {
    await getOrderDetails(order_id)
      .then((res) => {
        setOrderItems(res.data.result);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
    await getOrder(order_id)
      .then((res) => {
        setOrder(res.data.result);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  useEffect(() => {
    const { id } = rt.query;
    if (!id) return;

    fetchOrder(id as string);
  }, [rt.query]);

  //     {
  //       id: "19940239053306",
  //       orderNb: "050001038240001",
  //       creationDate: "2024-05-14T10:46:46.340Z",
  //       account: "WH0001",
  //       status: 3,
  //       status_text: "Awaiting Approval",
  //       phone: null,
  //       brand: "P",
  //       brand_description: "Pepsi",
  //       items: 1,
  //       currency_code: "LBP",
  //       total_amount: "70954884",
  //       lastEdited: "2024-05-14T10:46:46.340Z",
  //       paymentType: 1,
  //       totalAmount: 70954884,
  //     },
  return (
    <Layout>
      <AccountLayout
        title="Order Details"
        subTitle="You have full control to manage your own Account."
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
              {orderItems.map((order) => (
                <div className="cart_item px-0" key={order.id}>
                  <div className="cart_item_image">
                    <Image
                      width={200}
                      height={200}
                      src={
                        order.image ||
                        process.env.NEXT_PUBLIC_PRODUCT_PLACEHOLDER_IMAGE
                      }
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
                          <strong>
                            {currenncyCodeToSymbol(order.currency_code)}{" "}
                            {parseFloat(order.discountedPrice).toLocaleString()}{" "}
                          </strong>
                          {/* <del>{order.discount}</del>
                          <small className="product-discountPercentage">
                            (50% OFF)
                          </small> */}
                        </span>
                      </div>
                      <div className="cart_product_remove">
                        <a href="#">
                          <i className="ti-truck"></i> Return Item
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="row mt-4">
              <div className="col-lg-12">
                <div className="border p-3 mb-4">
                  <h5 className="details">Order Info</h5>
                  <div className="row no-gutters">
                    <div className="col-auto">
                      <i className="ti-shopping-cart text-secondary mr-2"></i>
                    </div>
                    <div className="col">
                      <p className="text-muted small mb-2">
                        <strong>Amount:</strong>{" "}
                        {currenncyCodeToSymbol(order.currency_code)}{" "}
                        {order.totalAmount.toLocaleString()}{" "}
                      </p>
                    </div>
                  </div>
                  <div className="row no-gutters">
                    <div className="col-auto">
                      <i className="ti-credit-card text-secondary mr-2"></i>
                    </div>
                    <div className="col">
                      <p className="text-muted small mb-2">
                        <strong>Payment Type:</strong>{" "}
                        {order?.paymentType ? "Credit" : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="row no-gutters">
                    <div className="col-auto">
                      <i className="ti-calendar text-secondary mr-2"></i>
                    </div>
                    <div className="col">
                      <p className="text-muted small mb-2">
                        <strong>Order Receive On:</strong>{" "}
                        {new Date(order.creationDate).toLocaleString(
                          "default",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>{" "}
                  <div className="row no-gutters">
                    <div className="col-auto">
                      <i className="ti-map-alt text-secondary mr-2"></i>
                    </div>
                    <div className="col">
                      <p className="text-muted small mb-2">
                        {" "}
                        <strong>Delivery Address:</strong>{" "}
                        {order?.address || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="row no-gutters">
                    <div className="col-auto">
                      <i className="ti-mobile text-secondary mr-2"></i>
                    </div>
                    <div className="col">
                      <p className="text-muted small mb-0">
                        <strong>Phone Number:</strong> {order?.phone || "N/A"}
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
                      <h6 className="timeline-heading">Order placed</h6>
                    </div>
                    <div className="d-none d-sm-block">
                      <span className="timeline-date">
                        {new Date(order.creationDate).toLocaleString(
                          "default",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
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
                          Order Approved
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
                          Awaiting Delivery
                        </a>
                      </h6>
                    </div>
                    {order.status === 4 ? (
                      <div className="d-none d-sm-block">
                        <span className="timeline-date">
                          {new Date(order.lastEdited).toLocaleString(
                            "default",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    ) : (
                      ""
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
                          Delivered successfully
                        </a>
                      </h6>
                    </div>
                    {order.status >= 8 ? (
                      <div className="d-none d-sm-block">
                        <span className="timeline-date">
                          {new Date(order.lastEdited).toLocaleString(
                            "default",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    ) : (
                      ""
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
