"use client";

import { useCallback, useEffect, useState } from "react";

import { Button, Form, InputGroup } from "react-bootstrap";

import { toast } from "react-toastify";

import OpenInvoiceList from "@/components/collectionPage/OpenInvoiceList";

import AutomaticPaymentModals from "@/components/collectionPage/AutomaticPaymentModals";

import ManualPaymentModals from "@/components/collectionPage/ManualPaymentModals";

import {
  getPendingOpenInvoices,
  fifoPreview,
  manualPreview,
  getCurrencies,
} from "@/utils/apiCalls";

import Layout from "@/components/Layout/Layout";

const PAGE_SIZE = 10;

export default function CollectionPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);

  /*
    Automatic FIFO
  */

  const [showAutomatic, setShowAutomatic] = useState(false);

  const [showAutomaticPreview, setShowAutomaticPreview] = useState(false);

  /*
    Manual Payment
  */

  const [showManual, setShowManual] = useState(false);

  const [showManualPreview, setShowManualPreview] = useState(false);

  const [previewData, setPreviewData] = useState<any>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const [summaryCurrency, setSummaryCurrency] = useState<"MOH_USD" | "MOH_LBP">(
    "MOH_LBP",
  );

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

  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ) => {
    if (
      fromCurrency === toCurrency ||
      !currencyMap[fromCurrency] ||
      !currencyMap[toCurrency]
    )
      return amount;

    const fromRatio = Number(currencyMap[fromCurrency].ratio);
    const toRatio = Number(currencyMap[toCurrency].ratio);

    const usd = amount / fromRatio;

    return usd * toRatio;
  };

  const summary = selectedInvoices.reduce(
    (acc, invoice) => {
      acc.invoice += convertCurrency(
        Number(invoice.remaining_amount),
        invoice.currency_code,
        summaryCurrency,
      );

      acc.vat += convertCurrency(
        Number(invoice.vat_remaining_amount),
        invoice.vat_currency_code,
        summaryCurrency,
      );

      return acc;
    },
    {
      invoice: 0,
      vat: 0,
    },
  );

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getPendingOpenInvoices(
        PAGE_SIZE,

        (page - 1) * PAGE_SIZE,

        search,
      );

      setInvoices(res.data.result.data);

      setTotal(res.data.result.total);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed loading invoices");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const toggleInvoice = (invoice: any) => {
    setSelectedInvoices((prev) => {
      const exists = prev.some(
        (x) => x.open_invoice_id === invoice.open_invoice_id,
      );

      if (exists) {
        return prev.filter(
          (x) => x.open_invoice_id !== invoice.open_invoice_id,
        );
      }

      return [...prev, invoice];
    });
  };

  return (
    <Layout>
      <div className="container-fluid py-4">
        <div className="collection-header mb-4">
          <h2>Pending Open Invoices</h2>

          <div className="collection-actions">
            <div className="selected-summary">
              <div className="summary-header">
                <div className="selected-counter">
                  <i className="ti-check-box" />

                  <span>
                    {selectedInvoices.length} invoice
                    {selectedInvoices.length !== 1 && "s"} selected
                  </span>
                </div>

                <Form.Select
                  size="sm"
                  className="summary-currency"
                  value={summaryCurrency}
                  onChange={(e) =>
                    setSummaryCurrency(e.target.value as "MOH_USD" | "MOH_LBP")
                  }
                >
                  <option value="MOH_LBP">LBP</option>
                  <option value="MOH_USD">USD</option>
                </Form.Select>
              </div>

              <div className="summary-cards">
                <div className="summary-card">
                  <small>Invoice Total</small>

                  <h5>
                    {summary.invoice.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    {currencyMap[summaryCurrency]?.symbol}
                  </h5>
                </div>

                <div className="summary-card">
                  <small>VAT Total</small>

                  <h5>
                    {summary.vat.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    {currencyMap[summaryCurrency]?.symbol}
                  </h5>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowAutomatic(true)}>
              Automatic FIFO
            </Button>

            <Button
              variant="outline-primary"
              disabled={selectedInvoices.length === 0}
              onClick={() => setShowManual(true)}
            >
              Manual Payment
            </Button>
          </div>
        </div>

        <div className="invoice-search mb-4">
          <InputGroup>
            <Form.Control
              placeholder="Search invoice number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);

                setPage(1);
              }}
            />

            <Button
              variant="outline-secondary"
              onClick={() => {
                setSearch("");

                setPage(1);
              }}
            >
              Clear
            </Button>
          </InputGroup>
        </div>

        <OpenInvoiceList
          invoices={invoices}
          selectedInvoices={selectedInvoices}
          onToggleInvoice={toggleInvoice}
          loading={loading}
          currencyMap={currencyMap}
        />

        <div className="custom-pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            <i className="ti-angle-double-left" />
          </button>

          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <i className="ti-angle-left" />
          </button>

          <div className="page-indicator">
            Page <span>{page}</span> of <span>{totalPages || 1}</span>
          </div>

          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            <i className="ti-angle-right" />
          </button>

          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            <i className="ti-angle-double-right" />
          </button>
        </div>

        {/* AUTOMATIC FIFO */}

        <AutomaticPaymentModals
          showAutomatic={showAutomatic}
          setShowAutomatic={setShowAutomatic}
          showAutomaticPreview={showAutomaticPreview}
          setShowAutomaticPreview={setShowAutomaticPreview}
          previewData={previewData}
          onFifoPreview={async (data) => {
            try {
              const res = await fifoPreview(data);

              setPreviewData(res.data.result);

              setShowAutomatic(false);

              setShowAutomaticPreview(true);
            } catch (e: any) {
              toast.error(e.response?.data?.message || "FIFO preview failed");
            }
          }}
          onCheckout={() => {
            // TODO checkout
          }}
        />

        {/* MANUAL PAYMENT */}

        <ManualPaymentModals
          showManual={showManual}
          setShowManual={setShowManual}
          showManualPreview={showManualPreview}
          setShowManualPreview={setShowManualPreview}
          selectedInvoices={selectedInvoices}
          previewData={previewData}
          onManualPreview={async (data) => {
            try {
              const res = await manualPreview(data);

              setPreviewData(res.data.result);

              setShowManual(false);

              setShowManualPreview(true);
            } catch (e: any) {
              toast.error(e.response?.data?.message || "Manual preview failed");
            }
          }}
          onCheckout={() => {
            // TODO checkout
          }}
          currencyMap={currencyMap}
        />
      </div>
    </Layout>
  );
}
