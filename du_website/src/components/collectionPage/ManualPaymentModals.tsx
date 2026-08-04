import { Modal, Button, Form, Table } from "react-bootstrap";
import { useState, useEffect } from "react";

import { toast } from "react-toastify";

import { getCreditNotes, getCurrencies } from "@/utils/apiCalls";

import CreditNoteAndPayMethodModals, {
  SelectedCreditNote,
  CreditNote,
  CashUsage,
} from "./CreditNoteAndPayMethodModals";

interface Invoice {
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

interface PaymentInput {
  amount: string;

  currency: "MOH_USD" | "MOH_LBP";
}

interface ManualInvoicePayment {
  open_invoice_id: number;

  payments: PaymentInput[];
}

interface Allocation {
  open_invoice_id: number;

  transaction_header_code?: number;

  allocated_amount?: number;

  allocated_usd?: number;

  remaining_after_payment?: number;

  remaining_after_payment_usd?: number;

  currency?: string;
}

interface PreviewResult {
  requested_usd?: number;

  used_usd?: number;

  unused_usd?: number;

  credit_used_usd?: number;

  cash_used_usd?: number;

  cash_usage?: CashUsage[];

  credits?: any[];

  allocations: Allocation[];
}

interface Props {
  showManual: boolean;

  setShowManual: (v: boolean) => void;

  showManualPreview: boolean;

  setShowManualPreview: (v: boolean) => void;

  selectedInvoices: Invoice[];

  onManualPreview: (data: any) => Promise<void>;

  previewData: PreviewResult | null;

  onCheckout: () => void;
}

const ManualPaymentModals = ({
  showManual,

  setShowManual,

  showManualPreview,

  setShowManualPreview,

  selectedInvoices,

  onManualPreview,

  previewData,

  onCheckout,
}: Props) => {
  const AVAILABLE_CURRENCIES = [
    {
      value: "MOH_USD",
      label: "USD ($)",
    },
    {
      value: "MOH_LBP",
      label: "LBP (L.L)",
    },
  ];

  /*
    Invoice payments

    Every invoice has its own
    currency inputs
*/

  const [invoicePayments, setInvoicePayments] = useState<
    ManualInvoicePayment[]
  >([]);

  useEffect(() => {
    if (showManual) {
      setInvoicePayments(
        selectedInvoices.map((invoice) => ({
          open_invoice_id: invoice.open_invoice_id,

          payments: [
            {
              amount: "",
              currency: "MOH_USD",
            },
          ],
        })),
      );
    }
  }, [showManual, selectedInvoices]);

  const [currencyMap, setCurrencyMap] = useState({});

  useEffect(() => {
    const loadCurrencies = async () => {
      const res = await getCurrencies();

      setCurrencyMap(
        Object.fromEntries(
          res.data.result.map((x) => [
            x.currency_code,
            {
              symbol: x.symbol,
              ratio: Number(x.ratio),
              deadAmount: Number(x.deadAmount),
              description: x.description,
              isMain: x.is_main,
              currency_code: x.currency_code,
            },
          ]),
        ),
      );
    };
    loadCurrencies();
  }, []);

  /*
 Credit Notes
*/

  const [showCreditNotes, setShowCreditNotes] = useState(false);

  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);

  const [selectedCreditNotes, setSelectedCreditNotes] = useState<
    SelectedCreditNote[]
  >([]);

  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  /*
 Update payment amount
*/

  const updatePaymentAmount = (
    invoiceId: number,

    paymentIndex: number,

    value: string,
  ) => {
    setInvoicePayments((prev) =>
      prev.map((invoice) => {
        if (invoice.open_invoice_id !== invoiceId) return invoice;

        return {
          ...invoice,

          payments: invoice.payments.map((payment, index) =>
            index === paymentIndex
              ? {
                  ...payment,
                  amount: value,
                }
              : payment,
          ),
        };
      }),
    );
  };

  /*
 Update currency

 prevents duplicate currencies
*/

  const updatePaymentCurrency = (
    invoiceId: number,

    paymentIndex: number,

    currency: "MOH_USD" | "MOH_LBP",
  ) => {
    setInvoicePayments((prev) =>
      prev.map((invoice) => {
        if (invoice.open_invoice_id !== invoiceId) return invoice;

        const exists = invoice.payments.some(
          (p, index) => index !== paymentIndex && p.currency === currency,
        );

        if (exists) return invoice;

        return {
          ...invoice,

          payments: invoice.payments.map((payment, index) =>
            index === paymentIndex
              ? {
                  ...payment,
                  currency,
                }
              : payment,
          ),
        };
      }),
    );
  };

  const addCurrencyPayment = (invoiceId: number) => {
    setInvoicePayments((prev) =>
      prev.map((invoice) => {
        if (invoice.open_invoice_id !== invoiceId) return invoice;

        const available = AVAILABLE_CURRENCIES.find(
          (c) => !invoice.payments.some((p) => p.currency === c.value),
        );

        if (!available) return invoice;

        return {
          ...invoice,

          payments: [
            ...invoice.payments,

            {
              amount: "",
              currency: available.value as "MOH_USD" | "MOH_LBP",
            },
          ],
        };
      }),
    );
  };

  const removeCurrencyPayment = (
    invoiceId: number,

    paymentIndex: number,
  ) => {
    setInvoicePayments((prev) =>
      prev.map((invoice) => {
        if (invoice.open_invoice_id !== invoiceId) return invoice;

        return {
          ...invoice,

          payments: invoice.payments.filter(
            (_, index) => index !== paymentIndex,
          ),
        };
      }),
    );
  };

  /*
 Credit Notes
*/

  const loadCreditNotes = async () => {
    try {
      const res = await getCreditNotes();

      setCreditNotes(res.data.result.data);

      setShowCreditNotes(true);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed loading credit notes");
    }
  };

  const toggleCreditNote = (note: CreditNote) => {
    const exists = selectedCreditNotes.some(
      (x) => x.open_invoice_id === note.open_invoice_id,
    );

    if (exists) {
      setSelectedCreditNotes((prev) =>
        prev.filter((x) => x.open_invoice_id !== note.open_invoice_id),
      );

      return;
    }

    const maxAmount = Math.abs(note.remaining_amount_usd);

    setSelectedCreditNotes((prev) => [
      ...prev,

      {
        open_invoice_id: note.open_invoice_id,

        transaction_header_code: note.transaction_header_code,

        amount: maxAmount,

        maxAmount,

        currency_code: note.currency_symbol,
      },
    ]);
  };

  const updateCreditAmount = (id: number, value: number) => {
    setSelectedCreditNotes((prev) =>
      prev.map((note) => {
        if (note.open_invoice_id !== id) return note;

        return {
          ...note,

          amount: Math.min(note.maxAmount, Math.max(0, value || 0)),
        };
      }),
    );
  };

  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ) => {
    if (fromCurrency === toCurrency) return amount;

    const fromRatio = currencyMap[fromCurrency].ratio;
    const toRatio = currencyMap[toCurrency].ratio;

    if (!fromRatio || !toRatio) return amount;

    // convert through the base currency (USD)
    const usdAmount = amount / fromRatio;

    return usdAmount * toRatio;
  };

  const handlePayFull = (invoice: Invoice) => {
    setInvoicePayments((prev) =>
      prev.map((item) => {
        if (item.open_invoice_id !== invoice.open_invoice_id) return item;

        if (item.payments.length !== 1) return item;

        const payment = item.payments[0];

        const amount = convertCurrency(
          Number(invoice.remaining_amount),
          invoice.currency_code,
          payment.currency,
        );

        return {
          ...item,
          payments: [
            {
              ...payment,
              amount: amount.toFixed(2),
            },
          ],
        };
      }),
    );
  };

  const handleUseRemaining = (invoice: Invoice, paymentIndex: number) => {
    setInvoicePayments((prev) =>
      prev.map((item) => {
        if (item.open_invoice_id !== invoice.open_invoice_id) return item;

        const payments = [...item.payments];

        const current = payments[paymentIndex];

        if (!current) return item;

        // Convert invoice remaining balance to USD base
        let remainingUSD = convertCurrency(
          Number(invoice.remaining_amount),
          invoice.currency_code,
          "MOH_USD",
        );

        // Subtract already entered payments
        payments.forEach((payment, index) => {
          if (index === paymentIndex) return;

          const value = Number(payment.amount) || 0;

          if (value <= 0) return;

          const paymentUSD = convertCurrency(
            value,
            payment.currency,
            "MOH_USD",
          );

          remainingUSD -= paymentUSD;
        });

        if (remainingUSD < 0) {
          remainingUSD = 0;
        }

        // Convert remaining USD to selected payment currency
        const amount = convertCurrency(
          remainingUSD,
          "MOH_USD",
          current.currency,
        );

        payments[paymentIndex] = {
          ...current,
          amount: amount.toFixed(2),
        };

        return {
          ...item,
          payments,
        };
      }),
    );
  };

  /*
 Validate + submit
*/

  const handleManual = async () => {
    for (const invoice of selectedInvoices) {
      const paymentData = invoicePayments.find(
        (x) => x.open_invoice_id === invoice.open_invoice_id,
      );

      if (!paymentData) continue;

      let totalUSD = 0;

      for (const payment of paymentData.payments) {
        const amount = Number(payment.amount);

        if (amount <= 0) {
          toast.error(
            `Invoice #${invoice.transaction_header_code}: amount must be greater than zero`,
          );

          return;
        }

        totalUSD += convertCurrency(amount, payment.currency, "MOH_USD");
      }

      const invoiceUSD = convertCurrency(
        Number(invoice.remaining_amount),
        invoice.currency_code,
        "MOH_USD",
      );

      if (
        totalUSD >
        invoiceUSD +
          currencyMap["MOH_USD"].deadAmount / currencyMap["MOH_USD"].ratio
      ) {
        toast.error(
          `Invoice #${invoice.transaction_header_code}: payment exceeds remaining balance`,
        );

        return;
      }
    }

    await onManualPreview({
      invoices: invoicePayments.map((invoice) => ({
        open_invoice_id: invoice.open_invoice_id,

        payments: invoice.payments
          .filter((p) => Number(p.amount) > 0)
          .map((p) => ({
            amount: Number(p.amount),

            currency: p.currency,
          })),
      })),

      creditNotes: selectedCreditNotes.map((note) => ({
        open_invoice_id: note.open_invoice_id,

        amount: note.amount,
      })),
    });
  };

  return (
    <>
      <Modal
        className="manual-payment-modal"
        show={showManual}
        onHide={() => setShowManual(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Manual Payment</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedInvoices.map((invoice) => {
            const payments = invoicePayments.find(
              (x) => x.open_invoice_id === invoice.open_invoice_id,
            );

            return (
              <div key={invoice.open_invoice_id} className="mb-4">
                <h6>Invoice #{invoice.transaction_header_code}</h6>

                <p className="text-muted">
                  Remaining:
                  {invoice.remaining_amount} {invoice.currency_symbol}
                </p>

                {payments?.payments.map((payment, index) => (
                  <div key={index} className="d-flex gap-2 mb-2">
                    <Form.Control
                      type="number"
                      placeholder="Amount"
                      value={payment.amount}
                      onChange={(e) => {
                        let value = e.target.value;

                        // Restrict to 2 decimal places
                        const parts = value.split(".");
                        if (parts.length === 2 && parts[1].length > 2) {
                          value = parts[0] + "." + parts[1].slice(0, 2);
                        }

                        updatePaymentAmount(
                          invoice.open_invoice_id,
                          index,
                          value,
                        );
                      }}
                    />

                    <Form.Select
                      value={payment.currency}
                      onChange={(e) =>
                        updatePaymentCurrency(
                          invoice.open_invoice_id,
                          index,
                          e.target.value as any,
                        )
                      }
                    >
                      {AVAILABLE_CURRENCIES.map((c) => (
                        <option
                          key={c.value}
                          value={c.value}
                          disabled={payments.payments.some(
                            (p, i) => i !== index && p.currency === c.value,
                          )}
                        >
                          {c.label}
                        </option>
                      ))}
                    </Form.Select>

                    <Button
                      variant="danger"
                      disabled={payments.payments.length === 1}
                      onClick={() =>
                        removeCurrencyPayment(invoice.open_invoice_id, index)
                      }
                    >
                      <i className="ti-close" />
                    </Button>
                  </div>
                ))}

                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => addCurrencyPayment(invoice.open_invoice_id)}
                  disabled={payments?.payments.length === 2}
                >
                  <i className="ti-plus" />
                  Add Currency
                </Button>
                <div className="d-flex gap-2 mt-2">
                  {payments?.payments.length === 1 ? (
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handlePayFull(invoice)}
                    >
                      Pay Full
                    </Button>
                  ) : (
                    payments?.payments.map((payment, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline-success"
                        onClick={() => handleUseRemaining(invoice, index)}
                      >
                        Use Remaining ({currencyMap[payment.currency].symbol})
                      </Button>
                    ))
                  )}
                </div>

                <hr />
              </div>
            );
          })}

          <Button variant="outline-success" onClick={loadCreditNotes}>
            Use Credit Notes
          </Button>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowManual(false)}>
            Cancel
          </Button>

          <Button onClick={handleManual}>Preview</Button>
        </Modal.Footer>
      </Modal>

      <CreditNoteAndPayMethodModals
        showCreditNoteModal={showCreditNotes}
        onHideCreditNoteModal={() => setShowCreditNotes(false)}
        creditNotes={creditNotes}
        selectedCreditNotes={selectedCreditNotes}
        onToggle={toggleCreditNote}
        onAmountChange={updateCreditAmount}
        showPaymentMethodModal={showPaymentMethod}
        onHidePaymentMethodModal={() => {
          setShowPaymentMethod(false);

          setShowManualPreview(true);
        }}
        cashUsage={previewData?.cash_usage ?? []}
        onCheckout={() => onCheckout()}
      />

      {/* MANUAL PREVIEW MODAL */}

      <Modal
        className="manual-payment-preview-modal"
        show={showManualPreview}
        onHide={() => setShowManualPreview(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Manual Payment Preview</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {previewData && (
            <>
              {/* SUMMARY */}

              <div className="mb-4">
                <div className="payment-summary">
                  <div className="summary-card">
                    <small className="text-muted">Total Payment</small>

                    <h4>{previewData.requested_usd ?? 0}$</h4>
                  </div>

                  <div className="summary-card">
                    <small className="text-muted">Used</small>

                    <h5>{previewData.used_usd ?? 0}$</h5>
                  </div>

                  <div className="summary-card">
                    <small className="text-muted">Unused</small>

                    <h5>{previewData.unused_usd ?? 0}$</h5>
                  </div>
                </div>

                <hr />

                <div className="payment-breakdown">
                  <div className="summary-card">
                    <small className="text-muted">Credit Used</small>

                    <h5>{previewData.credit_used_usd ?? 0}$</h5>
                  </div>

                  <div className="summary-card">
                    <small className="text-muted">Cash Used</small>

                    <h5>{previewData.cash_used_usd ?? 0}$</h5>
                  </div>
                </div>
              </div>

              {/* CREDIT NOTES */}

              {previewData.credits && previewData.credits.length > 0 && (
                <>
                  <h5>Applied Credit Notes</h5>

                  <Table bordered responsive>
                    <thead>
                      <tr>
                        <th>Credit</th>

                        <th>Amount</th>

                        <th>USD</th>
                      </tr>
                    </thead>

                    <tbody>
                      {previewData.credits.map((credit: any, index: number) => (
                        <tr key={index}>
                          <td>#{credit.transaction_header_code}</td>

                          <td>
                            {credit.allocated_amount} {credit.currency}
                          </td>

                          <td>{credit.allocated_usd}$</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}

              {/* INVOICE ALLOCATION */}

              <h5 className="mt-4">Invoice Allocation</h5>

              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Invoice</th>

                    <th>Allocated</th>

                    <th>Remaining</th>
                  </tr>
                </thead>

                <tbody>
                  {previewData.allocations.map((item, index) => (
                    <tr key={index}>
                      <td>#{item.transaction_header_code}</td>

                      <td>
                        {item.currency && (
                          <small className="text-muted">
                            {item.allocated_amount} {item.currency}
                          </small>
                        )}

                        {item.allocated_usd !== undefined && (
                          <div>{item.allocated_usd}$</div>
                        )}
                      </td>

                      <td>
                        {item.currency && (
                          <small className="text-muted">
                            {item.remaining_after_payment} {item.currency}
                          </small>
                        )}

                        {item.remaining_after_payment_usd !== undefined && (
                          <div>{item.remaining_after_payment_usd} $</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowManualPreview(false);

              setShowManual(true);
            }}
          >
            Back
          </Button>

          <Button
            variant="success"
            onClick={() => {
              setShowManualPreview(false);

              setShowPaymentMethod(true);
            }}
          >
            Proceed To Checkout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManualPaymentModals;
