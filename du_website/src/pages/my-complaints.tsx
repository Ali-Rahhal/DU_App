import AccountLayout from "@/components/dashboard/AccountLayout";
import Layout from "@/components/Layout/Layout";
import { currenncyCodeToSymbol } from "@/utils";
import { getOrders, getUserComplaints } from "@/utils/apiCalls";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { Modal } from "react-bootstrap";
import { useTranslations } from "next-intl";

// const BarcodeScanner = dynamic(
//   () => {
//     //@ts-ignore
//     import("react-barcode-scanner/polyfill");
//     return import("react-barcode-scanner").then((mod) => mod.BarcodeScanner);
//   },
//   { ssr: false }
// );

type Complaint = {
  assigned_code: string;
  assigned_type: number;
  creator_user_code: any;
  date_added: string;
  description: string;
  end_date: any;
  is_active: boolean;
  is_overdue: boolean;
  is_overdue_notified: boolean;
  is_user_notified: boolean;
  last_edited: string;
  last_modifier_user_code: any;
  priority_id: number;
  sequence: string;
  start_date: string;
  status: number;
  complaint_type: string;
  web_complaint_code: string;
  web_complaint_id: string;
  web_complaint_type_id: number;
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [barcode, setBarcode] = useState("");
  const [openBarcodeScanner, setOpenBarcodeScanner] = useState(false);
  const fetchOrders = async () => {
    await getUserComplaints()
      .then((res) => {
        console.log(res.data.result);
        setComplaints(res.data.result);
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
  const t = useTranslations();
  return (
    <Layout>
      <AccountLayout
        title={t("my_complaints")}
        // subTitle="You have full control to manage your own Account."
        subTitle={t("view_your_complaints")}
      >
        {/* <div
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
        </div> */}

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
                  <th className="py-3">Code</th>
                  <th className="py-3">
                    {/* Type */}
                    {t("type")}
                  </th>
                  <th className="py-3">{t("status")}</th>
                  <th className="py-3">
                    {/* Open Date */}
                    {t("open_date")}
                  </th>
                  <th className="py-3">
                    {/* Close Date */}
                    {t("close_date")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.web_complaint_code}>
                    <td className="py-3">
                      <Link
                        className="nav-link-style fw-medium fs-sm"
                        // href={`/orders-details?id=${complaint.id}`}
                        href={"#"}
                        data-bs-toggle="modal"
                      >
                        {complaint.web_complaint_code}
                      </Link>
                    </td>
                    <td className="py-3">{complaint.complaint_type}</td>
                    <td className="py-3">
                      <span
                        className={
                          "badge m-0 " +
                          // (complaint.status === 3
                          //   ? "bg-soft-warning"
                          //   : complaint.status === 4
                          //   ? "bg-soft-info"
                          //   : complaint.status === 8
                          //   ? "bg-soft-success"
                          //   : "bg-soft-danger")
                          (complaint.status === 0
                            ? "bg-soft-info"
                            : complaint.status === 1
                            ? "bg-soft-info"
                            : complaint.status === 2
                            ? "bg-soft-success"
                            : complaint.status === 3
                            ? "bg-soft-danger"
                            : "bg-soft-danger")
                        }
                      >
                        {complaint.status === 0
                          ? t("pending")
                          : complaint.status === 1
                          ? t("in_progress")
                          : complaint.status === 2
                          ? t("resolved")
                          : complaint.status === 3
                          ? "Overdue"
                          : "Closed"}
                      </span>
                    </td>
                    <td className="py-3">
                      {" "}
                      {new Date(complaint.date_added).toLocaleString(
                        "default",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="py-3">
                      {complaint.end_date
                        ? new Date(complaint.end_date).toLocaleString(
                            "default",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : t("not_closed")}
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

export default MyComplaints;
