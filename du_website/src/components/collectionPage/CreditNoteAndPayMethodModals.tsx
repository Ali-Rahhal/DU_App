import { Modal, Button, Form, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
export interface CreditNote {
  open_invoice_id: number;
  transaction_header_code: number;
  invoice_date: string;
  due_date: string;
  currency: string;
  currency_symbol: string;
  invoice_amount: number;
  invoice_amount_usd: number;
  remaining_amount: number;
  remaining_amount_usd: number;
}

export interface SelectedCreditNote {
  open_invoice_id: number;
  transaction_header_code: number;
  amount: number;
  maxAmount: number;
  currency_code: string;
}

export interface CashUsage {
  currency: string;
  currency_symbol: string;
  used_amount: number;
  used_usd: number;
}

interface Props {
  // Credit note modal
  showCreditNoteModal: boolean;
  onHideCreditNoteModal: () => void;

  creditNotes: CreditNote[];
  selectedCreditNotes: SelectedCreditNote[];

  onToggle: (note: CreditNote) => void;
  onAmountChange: (id: number, amount: number) => void;

  // Payment method modal
  showPaymentMethodModal: boolean;
  onHidePaymentMethodModal: () => void;

  cashUsage: CashUsage[];

  onCheckout: (
    methods: {
      currency: string;
      amount: number;
      paymentMethod: string;
    }[],
  ) => void;
}
const CreditNoteAndPayMethodModals = ({
  showCreditNoteModal,
  onHideCreditNoteModal,
  creditNotes,
  selectedCreditNotes,
  onToggle,
  onAmountChange,
  showPaymentMethodModal,
  onHidePaymentMethodModal,
  cashUsage,
  onCheckout,
}: Props) => {
  const PAYMENT_METHODS = [
    "Wish Payment",
    "Visa",
    "Mastercard",
    "Salesperson Request (Cash)",
  ];
  const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>(
    {},
  );
  useEffect(() => {
    if (showPaymentMethodModal) {
      const obj: Record<string, string> = {};

      cashUsage.forEach((x) => {
        obj[x.currency] = "Wish Payment";
      });

      setPaymentMethods(obj);
    }
  }, [showPaymentMethodModal, cashUsage]);

  return (
    <>
      <Modal
        className="credit-note-modal"
        show={showCreditNoteModal}
        onHide={onHideCreditNoteModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Credit Notes</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Table responsive>
            <thead>
              <tr>
                <th></th>
                <th>Credit #</th>
                <th>Remaining</th>
              </tr>
            </thead>

            <tbody>
              {creditNotes.map((note) => {
                const selected = selectedCreditNotes.some(
                  (x) => x.open_invoice_id === note.open_invoice_id,
                );

                return (
                  <tr key={note.open_invoice_id}>
                    <td colSpan={3}>
                      <div
                        className={`credit-note-option ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() => onToggle(note)}
                      >
                        <div className="credit-note-check">
                          {selected && <i className="ti-check" />}
                        </div>

                        <div className="credit-note-info">
                          <div className="credit-number">
                            Credit #{note.transaction_header_code}
                          </div>

                          <div className="credit-amount">
                            {Math.abs(
                              note.remaining_amount_usd,
                            ).toLocaleString()}{" "}
                            $
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {selectedCreditNotes.length > 0 && (
            <>
              <hr />

              <h6>Amounts To Use</h6>

              {selectedCreditNotes.map((note) => (
                <div key={note.open_invoice_id} className="mb-3">
                  <Form.Label>
                    Credit #{note.transaction_header_code}
                  </Form.Label>

                  <Form.Control
                    type="number"
                    min={0}
                    max={note.maxAmount}
                    value={note.amount}
                    onChange={(e) => {
                      let value = e.target.value;

                      // Restrict to 2 decimal places
                      const parts = value.split(".");
                      if (parts.length === 2 && parts[1].length > 2) {
                        value = parts[0] + "." + parts[1].slice(0, 2);
                      }

                      onAmountChange(note.open_invoice_id, Number(value));
                    }}
                  />

                  <small className="text-muted">
                    Maximum: {note.maxAmount.toLocaleString()} $
                  </small>
                </div>
              ))}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHideCreditNoteModal}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        className="payment-method-modal"
        show={showPaymentMethodModal}
        onHide={onHidePaymentMethodModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Payment Method</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Currency</th>
                <th>Amount</th>
                <th>Payment Method</th>
              </tr>
            </thead>

            <tbody>
              {cashUsage.map((item) => (
                <tr key={item.currency}>
                  <td>{item.currency_symbol}</td>

                  <td>
                    {item.used_amount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td>
                    <Form.Select
                      value={paymentMethods[item.currency] ?? "Wish Payment"}
                      onChange={(e) =>
                        setPaymentMethods((prev) => ({
                          ...prev,
                          [item.currency]: e.target.value,
                        }))
                      }
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHidePaymentMethodModal}>
            Back
          </Button>

          <Button
            variant="success"
            onClick={() =>
              onCheckout(
                cashUsage.map((x) => ({
                  currency: x.currency,
                  amount: x.used_amount,
                  paymentMethod: paymentMethods[x.currency],
                })),
              )
            }
          >
            Checkout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreditNoteAndPayMethodModals;
