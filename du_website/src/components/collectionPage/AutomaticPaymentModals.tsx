import { Modal, Button, Form, Table, Badge } from "react-bootstrap";

import { useState } from "react";

import { toast } from "react-toastify";
import { getCreditNotes } from "@/utils/apiCalls";
import CreditNoteAndPayMethodModals, {
  SelectedCreditNote,
  CreditNote,
  CashUsage,
} from "./CreditNoteAndPayMethodModals";

interface Allocation {
  open_invoice_id: number;

  transaction_header_code?: number;

  allocated_amount: number;

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
  showAutomatic: boolean;

  setShowAutomatic: (v: boolean) => void;

  showAutomaticPreview: boolean;

  setShowAutomaticPreview: (v: boolean) => void;

  onFifoPreview: (data: {
    payments: {
      amount: number;
      currency: string;
    }[];

    creditNotes: {
      open_invoice_id: number;
      amount?: number;
    }[];
  }) => Promise<void>;

  previewData: PreviewResult | null;

  onCheckout: () => void;
}

const AutomaticPaymentModals = ({
  showAutomatic,
  setShowAutomatic,

  showAutomaticPreview,
  setShowAutomaticPreview,

  onFifoPreview,

  previewData,

  onCheckout,
}: Props) => {
  /*
 FIFO PAYMENTS
*/

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

  const [fifoPayments, setFifoPayments] = useState([
    {
      amount: "",
      currency: "MOH_USD",
    },
  ]);

  const [showCreditNotes, setShowCreditNotes] = useState(false);

  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);

  const [selectedCreditNotes, setSelectedCreditNotes] = useState<
    SelectedCreditNote[]
  >([]);

  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  const updateFifoAmount = (index: number, value: string) => {
    setFifoPayments((prev) =>
      prev.map((x, i) =>
        i === index
          ? {
              ...x,
              amount: value,
            }
          : x,
      ),
    );
  };

  const updateFifoCurrency = (index: number, currency: string) => {
    const exists = fifoPayments.some(
      (x, i) => i !== index && x.currency === currency,
    );

    if (exists) return;

    setFifoPayments((prev) =>
      prev.map((x, i) =>
        i === index
          ? {
              ...x,
              currency,
            }
          : x,
      ),
    );
  };

  const addCurrencyPayment = () => {
    const available = AVAILABLE_CURRENCIES.find(
      (c) => !fifoPayments.some((p) => p.currency === c.value),
    );

    if (!available) return;

    setFifoPayments((prev) => [
      ...prev,
      {
        amount: "",
        currency: available.value,
      },
    ]);
  };

  const removeCurrencyPayment = (index: number) => {
    setFifoPayments((prev) => prev.filter((_, i) => i !== index));
  };

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

        const amount = Math.min(note.maxAmount, Math.max(0, value || 0));

        return {
          ...note,
          amount,
        };
      }),
    );
  };

  const handleFIFO = async () => {
    const validPayments = fifoPayments.filter(
      (x) => Number(x.amount) > 0 && x.amount !== "",
    );

    if (validPayments.length === 0) {
      toast.error("Enter at least one payment amount.");
      return;
    }

    const invalid = fifoPayments.find(
      (x) => x.amount === "" || Number(x.amount) <= 0,
    );

    if (invalid) {
      toast.error("Payment amounts must be greater than 0.");
      return;
    }

    await onFifoPreview({
      payments: validPayments.map((x) => ({
        amount: Number(x.amount),
        currency: x.currency,
      })),

      creditNotes: selectedCreditNotes.map((x) => ({
        open_invoice_id: x.open_invoice_id,
        amount: x.amount,
      })),
    });
  };

  return (
    <>
      <Modal
        className="automatic-payment-modal"
        show={showAutomatic}
        onHide={() => setShowAutomatic(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Automatic FIFO Payment</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Label>Payment Amounts</Form.Label>

          {fifoPayments.map((payment, index) => (
            <div key={index} className="d-flex gap-2 mb-3">
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

                  updateFifoAmount(index, value);
                }}
              />

              <Form.Select
                value={payment.currency}
                onChange={(e) => updateFifoCurrency(index, e.target.value)}
              >
                {AVAILABLE_CURRENCIES.map((c) => (
                  <option
                    key={c.value}
                    value={c.value}
                    disabled={fifoPayments.some(
                      (p, i) => i !== index && p.currency === c.value,
                    )}
                  >
                    {c.label}
                  </option>
                ))}
              </Form.Select>

              <Button
                variant="danger"
                disabled={fifoPayments.length === 1}
                onClick={() => removeCurrencyPayment(index)}
              >
                <i className="ti-close" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline-primary"
            onClick={addCurrencyPayment}
            disabled={fifoPayments.length >= AVAILABLE_CURRENCIES.length}
          >
            <i className="ti-plus" />
            Add Currency
          </Button>

          <hr />

          <Button variant="outline-success" onClick={loadCreditNotes}>
            Use Credit Notes
          </Button>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAutomatic(false)}>
            Cancel
          </Button>

          <Button onClick={handleFIFO}>Preview</Button>
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
          setShowAutomaticPreview(true);
        }}
        cashUsage={previewData?.cash_usage ?? []}
        onCheckout={(methods) => {
          console.log(methods);

          onCheckout();
        }}
      />

      {/* PREVIEW MODAL */}

      <Modal
        className="automatic-payment-preview-modal"
        show={showAutomaticPreview}
        onHide={() => setShowAutomaticPreview(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Payment Preview</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {previewData && (
            <>
              <div className="mb-4">
                <div className="payment-summary">
                  <div className="summary-card">
                    <small className="text-muted">Total Payment</small>

                    <h4>{previewData.requested_usd}$</h4>
                  </div>

                  <div className="summary-card">
                    <small className="text-muted">Used</small>

                    <h5>{previewData.used_usd}$</h5>
                  </div>

                  <div className="summary-card">
                    <small className="text-muted">Unused</small>

                    <h5>{previewData.unused_usd}$</h5>
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

                          <td>{credit.allocated_usd} $</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}

              {/* INVOICES */}

              <h5 className="mt-4">Invoice Allocation</h5>

              <Table responsive bordered>
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

                        <div>{item.allocated_usd}$</div>
                      </td>

                      <td>
                        {item.currency && (
                          <small className="text-muted">
                            {item.remaining_after_payment} {item.currency}
                          </small>
                        )}

                        <div>{item.remaining_after_payment_usd}$</div>
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
              setShowAutomaticPreview(false);
              setShowAutomatic(true);
            }}
          >
            Back
          </Button>

          <Button
            variant="success"
            onClick={() => {
              setShowAutomaticPreview(false);
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

export default AutomaticPaymentModals;
