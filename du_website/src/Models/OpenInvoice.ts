// order_no	"4583928"
// invoice_date	"2024-03-13T00:00:00.000Z"
// due_date	"2024-03-14T00:00:00.000Z"
// currency	"MOH_LBP"
// order_amount	"27282104"
// remaining_amount	"27282104"

type OpenInvoice = {
  order_no: string;
  // order_id: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  order_amount: string;
  remaining_amount: string;
};

export default OpenInvoice;
