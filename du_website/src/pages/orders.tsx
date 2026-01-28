import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { currenncyCodeToSymbol } from "@/utils";
import { getOrders } from "@/utils/apiCalls";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { Modal } from "react-bootstrap";

const BarcodeScanner = dynamic(
  () => {
    //@ts-ignore
    import("react-barcode-scanner/polyfill");
    return import("react-barcode-scanner").then((mod) => mod.BarcodeScanner);
  },
  { ssr: false }
);
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [openBarcodeScanner, setOpenBarcodeScanner] = useState(false);
  const fetchOrders = async () => {
    await getOrders(barcode)
      .then((res) => {
        setOrders(res.data.result);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => {
      t && clearTimeout(t);
    };
  }, [barcode]);

  return (
    <Layout>
      <AccountLayout
        title="Orders"
        subTitle="You have full control to manage your own Account."
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            alignItems: "flex-end",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "100%",
            }}
          >
            <label htmlFor="barcode" className="form-label">
              Reference No
            </label>
            <input
              name="barcode"
              required
              type="text"
              placeholder="Reference"
              className="form-control input-lg rounded"
              style={{
                height: "40px",
              }}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary btn-full btn-medium rounded"
            style={{
              paddingTop: "10px",
              height: "40px",
              width: "80px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "20px",
            }}
            onClick={() => setOpenBarcodeScanner(true)}
          >
            <i className="fa fa-barcode" aria-hidden="true"></i>
          </button>
        </div>
        <Modal
          show={openBarcodeScanner}
          onHide={() => setOpenBarcodeScanner(false)}
        >
          <BarcodeScanner
            options={{
              formats: [
                "code_128",
                "ean_13",
                "ean_8",
                "code_39",
                "code_93",
                "upc_a",
                "upc_e",
                "codabar",
              ],
            }}
            onCapture={(res) => {
              setOpenBarcodeScanner(false);
              setBarcode(res.rawValue);
            }}
          />
        </Modal>
        <div className="card">
          <div
            className="table-responsive"
            style={{
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            <table className="table mb-0 ">
              <thead
                style={{
                  position: "sticky",
                  top: "0",
                  backgroundColor: "white",
                }}
              >
                <tr>
                  <th>Order #</th>
                  <th>Category</th>
                  <th>Date Purchased</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {/* <tr>
                  <td className="py-3">
                    <Link
                      className="nav-link-style fw-medium fs-sm"
                      href="/orders-details"
                      data-bs-toggle="modal"
                    >
                      34VB5540K83
                    </Link>
                  </td>
                  <td className="py-3">May 21, 2019</td>
                  <td className="py-3">
                    <span className="badge bg-soft-info m-0">In Progress</span>
                  </td>
                  <td className="py-3">$358.75</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <Link
                      className="nav-link-style fw-medium fs-sm"
                      href="/orders-details"
                      data-bs-toggle="modal"
                    >
                      78A643CD409
                    </Link>
                  </td>
                  <td className="py-3">December 09, 2018</td>
                  <td className="py-3">
                    <span className="badge bg-soft-danger m-0">Canceled</span>
                  </td>
                  <td className="py-3">
                    <span>$760.50</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3">
                    <Link
                      className="nav-link-style fw-medium fs-sm"
                      href="/orders-details"
                      data-bs-toggle="modal"
                    >
                      112P45A90V2
                    </Link>
                  </td>
                  <td className="py-3">October 15, 2018</td>
                  <td className="py-3">
                    <span className="badge bg-soft-warning m-0">Delayed</span>
                  </td>
                  <td className="py-3">$1,264.00</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <Link
                      className="nav-link-style fw-medium fs-sm"
                      href="/orders-details"
                      data-bs-toggle="modal"
                    >
                      28BA67U0981
                    </Link>
                  </td>
                  <td className="py-3">July 19, 2018</td>
                  <td className="py-3">
                    <span className="badge bg-soft-success m-0">Delivered</span>
                  </td>
                  <td className="py-3">$198.35</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <Link
                      className="nav-link-style fw-medium fs-sm"
                      href="single_order"
                      data-bs-toggle="modal"
                    >
                      502TR872W2
                    </Link>
                  </td>
                  <td className="py-3">April 04, 2018</td>
                  <td className="py-3">
                    <span className="badge bg-soft-success m-0">Delivered</span>
                  </td>
                  <td className="py-3">$2,133.90</td>
                </tr>
                <tr>
                  <td className="py-3">
                    <Link
                      className="nav-link-style fw-medium fs-sm"
                      href="/orders-details"
                      data-bs-toggle="modal"
                    >
                      47H76G09F33
                    </Link>
                  </td>
                  <td className="py-3">March 30, 2018</td>
                  <td className="py-3">
                    <span className="badge bg-soft-success m-0">Delivered</span>
                  </td>
                  <td className="py-3">$86.40</td>
                </tr> */}
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3">
                      <Link
                        className="nav-link-style fw-medium fs-sm"
                        href={`/orders-details?id=${order.id}`}
                        data-bs-toggle="modal"
                      >
                        {order.orderNb}
                      </Link>
                    </td>
                    <td className="py-3">{order.brand_description}</td>
                    <td className="py-3">
                      {" "}
                      {new Date(order.creationDate).toLocaleString("default", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3">
                      <span
                        className={
                          "badge m-0 " +
                          (order.status === 3
                            ? "bg-soft-warning"
                            : order.status === 4
                            ? "bg-soft-info"
                            : order.status === 8
                            ? "bg-soft-success"
                            : "bg-soft-danger")
                        }
                      >
                        {order.status_text}
                      </span>
                    </td>
                    <td className="py-3">
                      <span>
                        {currenncyCodeToSymbol(order.currency_code)}{" "}
                        {parseFloat(order.total_amount).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default Orders;
