//@ts-ignore
import SalesInvoiceModel from "@/Models/SalesInvoice";
import CollectionTemplate from "@/components/pdf_template/CollectionTemplate";
import ReactDOMServer from "react-dom/server";
import React from "react";
import JsBarcode from "jsbarcode";
import { getInvoiceDetails } from "./apiCalls";

const exportInvoice = async (sales_invoice: SalesInvoiceModel) => {
  const html2pdf = (await import("html2pdf.js")).default;

  const invoiceDetails: {
    address: string;
    cat: string;
    currency: string;
    customer_name: string;
    customer_no: string;
    date_added: string;
    delivery_date: string;
    invoice_no: string;
    oracle_number: string;
    region: string;
    remaining_amount: string;
    sales_person: string;
    tel: string;
    total_amount: string;
    lines: {
      amount: string;
      description: string;
      discount: string;
      no: string;
      qty: number;
      unit: string;
      unit_price: string;
    }[];
  } = await getInvoiceDetails(sales_invoice.invoice_no).then((res) => {
    return res.data.result;
  });
  const printElement = ReactDOMServer.renderToString(
    React.createElement(CollectionTemplate, {
      creation_date: new Date(invoiceDetails.date_added).toLocaleDateString(),
      delivery_date: new Date(
        invoiceDetails.delivery_date
      ).toLocaleDateString(),
      customer_name: invoiceDetails.customer_name,
      sales_person: invoiceDetails.sales_person,
      trans_no: invoiceDetails.invoice_no,
      currency: invoiceDetails.currency,
      sell_to_customer: invoiceDetails.customer_name,
      address: invoiceDetails.address,
      tel: invoiceDetails.tel,
      region: invoiceDetails.region,
      lines: invoiceDetails.lines,
      barcode: invoiceDetails.invoice_no,
      customer_no: invoiceDetails.customer_no,
    })
  );
  // Generate barcode using JsBarcode
  const svg = document.createElement("svg");
  JsBarcode(svg, sales_invoice.invoice_no, {
    //format: "EAN13", // You can change the barcode format as needed
    displayValue: true, // Hide the barcode value if needed
    width: 1.5, // Adjust the width of the barcode
    height: 40, // Adjust the height of the barcode
    fontSize: 12, // Adjust the font size of the barcode value
  });

  // Convert the barcode canvas to a data URL

  // Replace the placeholder with the barcode image
  const printElementWithBarcode = printElement.replace(
    /<div id="barcode"><\/div>/,
    `${svg.outerHTML}`
  );
  var opt = {
    margin: 0.1,
    filename: `SALES_INVOICE_${sales_invoice.invoice_no}.pdf`,
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    html2canvas: { scale: 4 },
  };
  await html2pdf().set(opt).from(printElementWithBarcode).save();
};

export { exportInvoice };
// //@ts-ignore
// import SalesInvoiceModel from "@/Models/SalesInvoice";
// import CollectionTemplate from "@/components/pdf_template/CollectionTemplate";
// import ReactDOMServer from "react-dom/server";
// import React from "react";
// import Barcode from "react-barcode";

// const exportInvoice = async (sales_invoice: SalesInvoiceModel) => {
//   const html2pdf = (await import("html2pdf.js")).default;
//   const printElement = ReactDOMServer.renderToString(
//     CollectionTemplate({
//       creation_date: new Date(sales_invoice.date_added).toLocaleDateString(),
//       currency: sales_invoice.currency,
//       trans_no: sales_invoice.invoice_no,
//       barcode: sales_invoice.invoice_no,
//     })
//   );
//   var opt = {
//     margin: 0.1,
//     filename: `${sales_invoice.invoice_no}.pdf`,
//     jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
//     html2canvas: { scale: 4 },
//   };
//   html2pdf().set(opt).from(printElement).save();
// };

// export { exportInvoice };
