import { Table, Card, Form, Badge } from "react-bootstrap";

interface OpenInvoice {
  open_invoice_id: number;
  transaction_header_code: number;
  invoice_type_id: string;
  invoice_date: string;
  due_date: string;
  invoice_amount: number;
  remaining_amount: number;
  vat_invoice_amount: number;
  vat_remaining_amount: number;
  currency_code: string;
  vat_currency_code: string;
  currency_symbol: string;
  vat_currency_symbol: string;
}

interface Props {
  invoices: OpenInvoice[];
  selectedInvoices: any[];
  onToggleInvoice: (invoice: OpenInvoice) => void;
  loading?: boolean;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString();

const OpenInvoiceList = ({
  invoices,
  selectedInvoices,
  onToggleInvoice,
  loading = false,
}: Props) => {
  if (loading) return <div className="text-center py-5">Loading...</div>;

  if (!invoices.length)
    return <div className="text-center py-5">No invoices found.</div>;

  return (
    <div className="open-invoice-list">
      {/* Desktop */}

      <div className="invoice-table-container d-none d-lg-block">
        <Table hover bordered={false} className="align-middle invoice-table">
          <thead>
            <tr>
              <th style={{ width: 40 }} />

              <th>Invoice #</th>

              <th>Invoice Date</th>

              <th>Due Date</th>

              <th>Total</th>

              <th>Remaining</th>

              <th>VAT Total</th>

              <th>VAT Remaining</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => {
              const selected = selectedInvoices.some(
                (x) => x.open_invoice_id === invoice.open_invoice_id,
              );
              const isSelectable = invoice.invoice_type_id !== "30";

              return (
                <tr
                  key={invoice.open_invoice_id}
                  className={`${selected ? "selected-row" : ""} ${!isSelectable ? "disabled-row" : ""}`}
                  onClick={() => isSelectable && onToggleInvoice(invoice)}
                >
                  <td>
                    {isSelectable ? (
                      <div
                        className={`invoice-selector ${selected ? "selected" : ""}`}
                      >
                        {selected && <i className="ti-check" />}
                      </div>
                    ) : (
                      <div className="invoice-selector disabled">
                        <i className="ti-lock" />
                      </div>
                    )}
                  </td>

                  <td>{invoice.transaction_header_code}</td>

                  <td>{formatDate(invoice.invoice_date)}</td>

                  <td>{formatDate(invoice.due_date)}</td>

                  <td>
                    {invoice.invoice_amount.toLocaleString()}{" "}
                    {invoice.currency_symbol}
                  </td>

                  <td>
                    <span
                      className={
                        invoice.remaining_amount < 0
                          ? "amount-badge credit"
                          : "amount-badge debit"
                      }
                    >
                      {invoice.remaining_amount.toLocaleString()}{" "}
                      {invoice.currency_symbol}
                    </span>
                  </td>

                  <td>
                    {invoice.vat_invoice_amount.toLocaleString()}{" "}
                    {invoice.vat_currency_symbol}
                  </td>

                  <td>
                    {invoice.vat_remaining_amount.toLocaleString()}{" "}
                    {invoice.vat_currency_symbol}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Mobile */}

      <div className="d-lg-none">
        {invoices.map((invoice) => {
          const selected = selectedInvoices.some(
            (x) => x.open_invoice_id === invoice.open_invoice_id,
          );
          const isSelectable = invoice.invoice_type_id !== "30";

          return (
            <Card
              key={invoice.open_invoice_id}
              className={`invoice-card mb-3 ${selected ? "selected-card" : ""} ${
                !isSelectable ? "disabled-card" : ""
              }`}
              onClick={() => isSelectable && onToggleInvoice(invoice)}
            >
              <Card.Body>
                <div className="invoice-card-header">
                  <div>
                    <strong>#{invoice.transaction_header_code}</strong>
                  </div>

                  <div
                    className={`invoice-selector ${
                      isSelectable ? (selected ? "selected" : "") : "disabled"
                    }`}
                  >
                    {isSelectable ? (
                      selected && <i className="ti-check" />
                    ) : (
                      <i className="ti-lock" />
                    )}
                  </div>
                </div>

                <hr />

                <div className="row">
                  <div className="col-6">
                    <small className="invoice-label">Invoice Date</small>

                    <div>{formatDate(invoice.invoice_date)}</div>
                  </div>

                  <div className="col-6">
                    <small className="invoice-label">Due Date</small>

                    <div>{formatDate(invoice.due_date)}</div>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-6">
                    <small className="invoice-label">Total</small>

                    <div>
                      {invoice.invoice_amount.toLocaleString()}{" "}
                      {invoice.currency_symbol}
                    </div>
                  </div>

                  <div className="col-6">
                    <small className="invoice-label">Remaining</small>

                    <div>
                      <span
                        className={
                          invoice.remaining_amount < 0
                            ? "amount-badge credit"
                            : "amount-badge debit"
                        }
                      >
                        {invoice.remaining_amount.toLocaleString()}{" "}
                        {invoice.currency_symbol}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-6">
                    <small className="invoice-label">VAT Total</small>

                    <div>
                      {Math.abs(invoice.vat_invoice_amount).toLocaleString()}{" "}
                      {invoice.vat_currency_symbol}
                    </div>
                  </div>

                  <div className="col-6">
                    <small className="invoice-label">VAT Remaining</small>

                    <div>
                      {Math.abs(invoice.vat_remaining_amount).toLocaleString()}{" "}
                      {invoice.vat_currency_symbol}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OpenInvoiceList;
