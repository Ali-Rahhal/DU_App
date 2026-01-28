import { currenncyCodeToSymbol } from "@/utils";
import React, { useEffect } from "react";
type Props = {
  customer_no?: string;
  customer_name?: string;
  sell_to_customer?: string;
  address?: string;
  tel?: string;
  region?: string;
  trans_no?: string;
  creation_date?: string;
  delivery_date?: string;
  sales_person?: string;
  currency?: string;
  barcode?: string;
  lines?: {
    amount: string;
    description: string;
    discount: string;
    no: string;
    qty: number;
    unit: string;
    unit_price: string;
  }[];
};

const CollectionTemplate = (props: Props) => {
  const {
    customer_no,
    customer_name,
    sell_to_customer,
    address,
    tel,
    region,
    trans_no,
    creation_date,
    delivery_date,
    sales_person,
    currency,
    barcode,
    lines,
  } = props;
  //   var canvas = new Canvas();
  // JsBarcode(canvas, "Hello");
  return (
    <div>
      <style>
        {`
            .collection_con {
              width: 100%;
         
              padding: 40px 20px 40px 20px;
           
      
              position: relative;


              }
              .flex{
                display: flex;
                justify-content: space-between;

                }
                .list_con {
                  list-style: none;
                  padding: 0;
                  margin: 0;
                  display: flex;
                  flex-direction: column;
                  gap: 5px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                
                }
                  tbody td {
                  font-size: 12px;
                  padding: 5px 10px;
                  }
                  tbody tr:last-child td {
                  border-bottom: 1px solid black;
                    margin-bottom: 20px;
                }
                th {
                  border-right: 1px solid white;
                  padding: 10px;
                  background-color: #f1f1f1;
                }
              
                  tfoot td {
                  padding: 5px;
                  font-size: 14px;
        }
                  
            `}
      </style>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          minHeight: "100vh",

          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="collection_con">
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
            }}
          >
            <strong>Union Healthcare يونيون هيلث كير</strong>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
            }}
          >
            <div
              style={{
                marginTop: 40,
              }}
            >
              <img
                src="/assets/img/logo_cropped.png"
                alt="logo"
                width={200}
                height={60}
              />
            </div>
            <div
              style={{
                textAlign: "center",
                alignSelf: "flex-start",
                justifySelf: "center",
              }}
            >
              <h6
                style={{
                  color: "blue",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Sales-Invoice
              </h6>
              <div id="barcode"></div>
            </div>
            <div
              style={{
                marginTop: 40,
                textAlign: "right",
              }}
            >
              BEIRUT, Lebanon
              <br /> +961 5 923282
              <br /> +961 5 923212
              <br /> P.O.Box 166715
              <br /> d-union.com
            </div>
          </div>
          <div
            style={{
              marginTop: 50,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              textAlign: "left",
            }}
          >
            <ul className="list_con">
              <li>
                <strong>Customer No:</strong> {customer_no}
              </li>
              <li>
                <strong>Customer Name:</strong> {customer_name}
              </li>
              <li>
                <strong>Sell to Customer:</strong> {sell_to_customer}
              </li>
              <li>
                <strong>Address:</strong> {address}
              </li>
              <li>
                <strong>Tel:</strong> {tel}
              </li>
              <li>
                <strong>Region:</strong> {region}
              </li>
            </ul>
            <ul className="list_con">
              <li>
                <strong>Transaction No:</strong> {trans_no}
              </li>
              <li>
                <strong>Creation Date:</strong> {creation_date}
              </li>
              <li>
                <strong>Delivery Date:</strong> {delivery_date}
              </li>
              <li>
                <strong>Sales Person:</strong> {sales_person}
              </li>
              <li>
                <strong>Currency:</strong> {currency}
              </li>
            </ul>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines?.map((line) => (
                <tr key={line.no}>
                  <td>{line.no}</td>
                  <td>{line.description}</td>
                  <td>{line.qty}</td>
                  <td>{line.unit}</td>
                  <td>{parseFloat(line.unit_price).toLocaleString()}</td>
                  <td>{parseFloat(line.discount).toLocaleString()}</td>
                  <td>{line.amount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}></td>
                <td>
                  <strong>Total</strong>
                </td>
                <td colSpan={2}>
                  {lines?.reduce(
                    (acc, line) => acc + parseFloat(line.amount),
                    0
                  )}{" "}
                  {currenncyCodeToSymbol(currency)}
                </td>
              </tr>
              <tr>
                <td colSpan={4}></td>
                <td>
                  <strong>Discount</strong>
                </td>
                <td colSpan={2}>
                  {lines
                    ?.reduce((acc, line) => acc + parseFloat(line.discount), 0)
                    .toLocaleString()}{" "}
                  {currenncyCodeToSymbol(currency)}
                </td>
              </tr>
              <tr>
                <td colSpan={4}></td>
                <td>
                  <strong>11% VAT</strong>
                </td>
                <td colSpan={2}>
                  {(
                    lines?.reduce(
                      (acc, line) => acc + parseFloat(line.amount),
                      0
                    ) * 0.1
                  ).toLocaleString()}{" "}
                  {currenncyCodeToSymbol(currency)}
                </td>
              </tr>
              <tr>
                <td colSpan={5}></td>

                <td
                  colSpan={2}
                  style={{
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingBottom: 10,
                  }}
                >
                  <div
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                    }}
                  ></div>
                </td>
              </tr>
              <tr>
                <td colSpan={4}></td>
                <td>
                  <strong>Net Total</strong>
                </td>
                <td colSpan={2}>
                  {(
                    lines?.reduce(
                      (acc, line) => acc + parseFloat(line.amount),
                      0
                    ) +
                    lines?.reduce(
                      (acc, line) => acc + parseFloat(line.amount),
                      0
                    ) *
                      0.1
                  ).toLocaleString()}{" "}
                  {currenncyCodeToSymbol(currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div
          style={{
            marginTop: "auto",
          }}
        >
          <div
            className="flex"
            style={{
              justifyContent: "space-around",
              fontSize: 16,
            }}
          >
            <strong
              style={{
                borderBottom: "1px dotted black",
                paddingBottom: 30,
              }}
            >
              Account Manager
            </strong>
            <strong
              style={{
                borderBottom: "1px dotted black",
                paddingBottom: 30,
              }}
            >
              Receiver Signature
            </strong>
            <strong
              style={{
                paddingBottom: 30,
              }}
            >
              {new Date().toLocaleString()}
            </strong>
          </div>
          <div
            className="flex"
            style={{
              justifyContent: "space-between",
              marginTop: 20,
              fontSize: 12,
              padding: 10,
            }}
          >
            <strong style={{}}>
              {/* Thursday 8:00 AM - 5:00 PM */}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",

                month: "long",
                year: "numeric",
                day: "numeric",
              })}{" "}
            </strong>
            <strong style={{}}>
              Powered By Quayo Mobility Solutions +9611873448
              info@quayomobility.ca
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionTemplate;
