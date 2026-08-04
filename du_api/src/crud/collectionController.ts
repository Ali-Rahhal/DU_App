import { getPrisma } from "../lib/prisma";

const getPendingOpenInvoices = async (
  userId: number,
  companyId: string,
  take = 20,
  skip = 0,
  search = "",
) => {
  const prisma = getPrisma(companyId);

  const user = await prisma.web_accounts.findUnique({
    where: {
      id: userId,
    },
    select: {
      code: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const currencies = await prisma.currency.findMany({
    select: {
      currency_code: true,
      symbol: true,
    },
  });
  const currencySymbolMap = Object.fromEntries(
    currencies.map((x) => [x.currency_code, x.symbol]),
  );

  const whereCondition = {
    client_code: user.code,

    is_active: true,

    invoice_type_id: {
      in: [7, 30],
    },

    remaining_amount: {
      not: 0,
    },

    ...(search && {
      transaction_header_code: search ? search : undefined,
    }),
  };

  const [total, invoices] = await Promise.all([
    prisma.open_invoice.count({
      where: whereCondition,
    }),

    prisma.open_invoice.findMany({
      where: whereCondition,

      select: {
        open_invoice_id: true,

        transaction_header_code: true,

        invoice_type_id: true,

        invoice_date: true,

        due_date: true,

        invoice_amount: true,

        remaining_amount: true,

        currency_code: true,

        vat_invoice_amount: true,

        vat_remaining_amount: true,

        vat_currency_code: true,
      },

      orderBy: {
        invoice_date: "asc",
      },

      skip,

      take,
    }),
  ]);

  const formattedInvoices = invoices.map((invoice) => ({
    ...invoice,

    currency_symbol:
      currencySymbolMap[invoice.currency_code] || invoice.currency_code,

    vat_currency_symbol:
      currencySymbolMap[invoice.vat_currency_code] || invoice.vat_currency_code,
  }));

  return {
    data: formattedInvoices,

    total,
  };
};
const getCreditNotes = async (userId: number, companyId: string) => {
  const prisma = getPrisma(companyId);

  const user = await prisma.web_accounts.findUnique({
    where: {
      id: userId,
    },
    select: {
      code: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const currencies = await prisma.currency.findMany({
    select: {
      currency_code: true,
      symbol: true,
      ratio: true,
    },
  });

  const currencyMap = Object.fromEntries(
    currencies.map((x) => [
      x.currency_code,
      {
        symbol: x.symbol,
        ratio: Number(x.ratio),
      },
    ]),
  );

  const creditNotes = await prisma.open_invoice.findMany({
    where: {
      client_code: user.code,

      is_active: true,

      invoice_type_id: 30,

      remaining_amount: {
        lt: 0,
      },
    },

    orderBy: {
      invoice_date: "asc",
    },

    select: {
      open_invoice_id: true,

      transaction_header_code: true,

      invoice_date: true,

      due_date: true,

      invoice_amount: true,

      remaining_amount: true,

      currency_code: true,

      equivalent_amount_usd: true,
    },
  });

  const data = creditNotes.map((note) => {
    const ratio = currencyMap[note.currency_code]?.ratio ?? 1;
    const symbol =
      currencyMap[note.currency_code]?.symbol ?? note.currency_code;

    const remainingOriginal = Math.abs(Number(note.remaining_amount));

    const remainingUSD =
      note.equivalent_amount_usd != null
        ? Math.abs(Number(note.equivalent_amount_usd))
        : Number((remainingOriginal / ratio).toFixed(2));

    const invoiceOriginal = Math.abs(Number(note.invoice_amount));

    const invoiceUSD =
      note.equivalent_amount_usd != null
        ? Math.abs(Number(note.equivalent_amount_usd))
        : Number((invoiceOriginal / ratio).toFixed(2));

    return {
      open_invoice_id: Number(note.open_invoice_id),

      transaction_header_code: note.transaction_header_code,

      invoice_date: note.invoice_date,

      due_date: note.due_date,

      currency: note.currency_code,

      currency_symbol: symbol,

      invoice_amount: invoiceOriginal,

      invoice_amount_usd: Number(invoiceUSD.toFixed(2)),

      remaining_amount: remainingOriginal,

      remaining_amount_usd: Number(remainingUSD.toFixed(2)),
    };
  });

  return {
    total: data.length,

    total_credit_usd: Number(
      data.reduce((sum, x) => sum + x.remaining_amount_usd, 0).toFixed(2),
    ),

    data,
  };
};

const fifoPreviewController = async (
  userId: number,
  companyId: string,
  payments: {
    amount: number;
    currency: string;
  }[],
  creditNotes: {
    open_invoice_id: number;
    amount?: number;
  }[],
) => {
  const prisma = getPrisma(companyId);

  /*
  =====================================================
  USER
  =====================================================
  */

  const user = await prisma.web_accounts.findUnique({
    where: {
      id: userId,
    },
    select: {
      code: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  /*
  =====================================================
  LOAD CURRENCIES
  =====================================================
  */

  const currencies = await prisma.currency.findMany({
    select: {
      currency_code: true,
      ratio: true,
      symbol: true,
      dead_amount: true,
    },
  });

  const currencyRatioMap: Record<string, number> = {};
  const currencySymbolMap: Record<string, string> = {};
  const currencyDeadMap: Record<string, number> = {};

  for (const currency of currencies) {
    const ratio = Number(currency.ratio);

    if (!ratio || ratio <= 0) {
      throw new Error(`Invalid currency ratio ${currency.currency_code}`);
    }

    currencyRatioMap[currency.currency_code] = ratio;
    currencySymbolMap[currency.currency_code] = currency.symbol;
    currencyDeadMap[currency.currency_code] = Number(currency.dead_amount);
  }

  /*
  =====================================================
  VALIDATE PAYMENTS
  =====================================================
  */

  for (const payment of payments) {
    if (payment.amount <= 0) {
      throw new Error("Payment amount must be positive.");
    }

    if (!currencyRatioMap[payment.currency]) {
      throw new Error(`Currency ${payment.currency} does not exist.`);
    }
  }

  /*
  =====================================================
  CASH POOL
  =====================================================
  */

  type CashPoolItem = {
    currency: string;
    currency_symbol: string;
    ratio: number;

    original_amount: number;
    usd_remaining: number;
  };

  const cashPool: CashPoolItem[] = [];

  let requestedCashUSD = 0;

  for (const payment of payments) {
    const ratio = currencyRatioMap[payment.currency];

    const usd = Number(payment.amount) / ratio;

    requestedCashUSD += usd;

    cashPool.push({
      currency: payment.currency,

      currency_symbol: currencySymbolMap[payment.currency],

      ratio,

      original_amount: Number(payment.amount),

      usd_remaining: usd,
    });
  }

  /*
  =====================================================
  LOAD CREDIT NOTES
  =====================================================
  */

  const creditIds = creditNotes.map((x) => x.open_invoice_id);

  const dbCreditNotes =
    creditIds.length === 0
      ? []
      : await prisma.open_invoice.findMany({
          where: {
            client_code: user.code,

            open_invoice_id: {
              in: creditIds,
            },

            invoice_type_id: 30,

            is_active: true,
          },

          select: {
            open_invoice_id: true,

            transaction_header_code: true,

            remaining_amount: true,

            currency_code: true,
          },
        });

  if (dbCreditNotes.length !== creditNotes.length) {
    throw new Error("One or more credit notes were not found.");
  }

  /*
  =====================================================
  CREDIT POOL
  =====================================================
  */

  type CreditPoolItem = {
    open_invoice_id: bigint;

    transaction_header_code: string;

    currency: string;

    currency_symbol: string;

    ratio: number;

    original_remaining: number;

    usd_remaining: number;
  };

  const creditPool: CreditPoolItem[] = [];

  let requestedCreditUSD = 0;

  for (const credit of dbCreditNotes) {
    const ratio = currencyRatioMap[credit.currency_code];

    if (!ratio) {
      throw new Error(`Missing ratio ${credit.currency_code}`);
    }

    const requested = creditNotes.find(
      (x) => BigInt(x.open_invoice_id) === credit.open_invoice_id,
    )?.amount;

    const absoluteOriginal = Math.abs(Number(credit.remaining_amount));

    // Requested amount is USD
    const requestedUSD =
      requested !== undefined ? Math.abs(requested) : undefined;

    // Convert requested USD into credit currency
    const requestedOriginal =
      requestedUSD !== undefined ? requestedUSD * ratio : undefined;

    const originalAvailable =
      requestedOriginal !== undefined
        ? Math.min(absoluteOriginal, requestedOriginal)
        : absoluteOriginal;

    const usdAvailable = originalAvailable / ratio;

    requestedCreditUSD += usdAvailable;

    creditPool.push({
      open_invoice_id: credit.open_invoice_id,

      transaction_header_code: credit.transaction_header_code,

      currency: credit.currency_code,

      currency_symbol: currencySymbolMap[credit.currency_code],

      ratio,

      original_remaining: originalAvailable,

      usd_remaining: usdAvailable,
    });
  }

  /*
  =====================================================
  LOAD OPEN INVOICES
  =====================================================
  */

  const invoices = await prisma.open_invoice.findMany({
    where: {
      client_code: user.code,

      is_active: true,

      invoice_type_id: {
        not: 30,
      },

      remaining_amount: {
        gt: 0,
      },
    },

    orderBy: {
      invoice_date: "asc",
    },

    select: {
      open_invoice_id: true,

      transaction_header_code: true,

      remaining_amount: true,

      currency_code: true,

      invoice_date: true,
    },
  });

  /*
  =====================================================
  RESULT HOLDERS
  =====================================================
  */

  const allocations: any[] = [];

  const appliedCredits: any[] = [];

  let usedCreditUSD = 0;

  let usedCashUSD = 0;

  /*
  =====================================================
  FIFO ALLOCATION
  =====================================================
  */

  for (const invoice of invoices) {
    const availableCreditUSD = creditPool.reduce(
      (sum, credit) => sum + credit.usd_remaining,
      0,
    );

    const availableCashUSD = cashPool.reduce(
      (sum, cash) => sum + cash.usd_remaining,
      0,
    );

    if (availableCreditUSD + availableCashUSD <= 0) {
      break;
    }

    let invoiceRemainingUSD =
      Number(invoice.remaining_amount) /
      currencyRatioMap[invoice.currency_code];

    if (invoiceRemainingUSD <= 0) {
      continue;
    }

    let invoiceCreditUsedUSD = 0;

    let invoiceCashUsedUSD = 0;

    /*
    -----------------------------------------------------
    APPLY CREDIT FIRST
    -----------------------------------------------------
    */

    for (const credit of creditPool) {
      if (invoiceRemainingUSD <= 0) {
        break;
      }

      if (credit.usd_remaining <= 0) {
        continue;
      }

      const usedUSD = Math.min(invoiceRemainingUSD, credit.usd_remaining);

      credit.usd_remaining -= usedUSD;

      credit.original_remaining = Number(
        (credit.usd_remaining * credit.ratio).toFixed(2),
      );

      invoiceRemainingUSD -= usedUSD;

      invoiceCreditUsedUSD += usedUSD;

      usedCreditUSD += usedUSD;

      /*
      Merge same credit note
      */

      const existingCredit = appliedCredits.find(
        (x) => x.open_invoice_id === credit.open_invoice_id,
      );

      const allocatedAmount = Number((usedUSD * credit.ratio).toFixed(2));

      const allocatedUSD = Number(usedUSD.toFixed(2));

      if (existingCredit) {
        existingCredit.allocated_amount = Number(
          (existingCredit.allocated_amount + allocatedAmount).toFixed(2),
        );

        existingCredit.allocated_usd = Number(
          (existingCredit.allocated_usd + allocatedUSD).toFixed(2),
        );
      } else {
        appliedCredits.push({
          open_invoice_id: credit.open_invoice_id,

          transaction_header_code: credit.transaction_header_code,

          currency: credit.currency_symbol,

          allocated_amount: allocatedAmount,

          allocated_usd: allocatedUSD,
        });
      }
    }

    /*
    -----------------------------------------------------
    APPLY CASH AFTER CREDIT
    -----------------------------------------------------
    */

    for (const cash of cashPool) {
      if (invoiceRemainingUSD <= 0) {
        break;
      }

      if (cash.usd_remaining <= 0) {
        continue;
      }

      const usedUSD = Math.min(invoiceRemainingUSD, cash.usd_remaining);

      cash.usd_remaining -= usedUSD;

      invoiceRemainingUSD -= usedUSD;

      invoiceCashUsedUSD += usedUSD;

      usedCashUSD += usedUSD;
    }

    /*
    -----------------------------------------------------
    INVOICE RESULT
    -----------------------------------------------------
    */

    const invoiceRatio = currencyRatioMap[invoice.currency_code];

    const totalUsedUSD = invoiceCreditUsedUSD + invoiceCashUsedUSD;

    const remainingUSD = Math.max(0, invoiceRemainingUSD);

    const remainingOriginal = remainingUSD * invoiceRatio;

    const deadAmount = currencyDeadMap[invoice.currency_code] ?? 0;

    const finalRemaining =
      remainingOriginal <= deadAmount ? 0 : remainingOriginal;

    if (totalUsedUSD <= 0) {
      continue;
    }

    allocations.push({
      open_invoice_id: invoice.open_invoice_id,

      transaction_header_code: invoice.transaction_header_code,

      currency: currencySymbolMap[invoice.currency_code],

      credit_used_usd: Number(invoiceCreditUsedUSD.toFixed(2)),

      cash_used_usd: Number(invoiceCashUsedUSD.toFixed(2)),

      allocated_usd: Number(totalUsedUSD.toFixed(2)),

      allocated_amount: Number((totalUsedUSD * invoiceRatio).toFixed(2)),

      remaining_after_payment: Number(finalRemaining.toFixed(2)),

      remaining_after_payment_usd: Number(
        (finalRemaining / invoiceRatio).toFixed(2),
      ),
    });
  }

  /*
  =====================================================
  UNUSED AMOUNTS
  =====================================================
  */

  const unusedCreditUSD = creditPool.reduce(
    (sum, credit) => sum + credit.usd_remaining,
    0,
  );

  const unusedCashUSD = cashPool.reduce(
    (sum, cash) => sum + cash.usd_remaining,
    0,
  );

  /*
=====================================================
CASH USAGE SUMMARY (PROPORTIONAL)
=====================================================
*/

  const totalRequestedCashUSD = cashPool.reduce(
    (sum, cash) => sum + cash.original_amount / cash.ratio,
    0,
  );

  const cash_usage = cashPool
    .map((cash) => {
      if (usedCashUSD <= 0 || totalRequestedCashUSD <= 0) {
        return null;
      }

      const cashShare =
        cash.original_amount / cash.ratio / totalRequestedCashUSD;

      const usedUSD = usedCashUSD * cashShare;

      return {
        currency: cash.currency,

        currency_symbol: cash.currency_symbol,

        used_usd: Number(usedUSD.toFixed(2)),

        used_amount: Number((usedUSD * cash.ratio).toFixed(2)),
      };
    })
    .filter(Boolean);

  /*
  =====================================================
  FINAL RESPONSE
  =====================================================
  */

  return {
    /*
      Everything the user entered
    */
    requested_usd: Number((requestedCashUSD + requestedCreditUSD).toFixed(2)),

    /*
      Actually consumed
    */
    credit_used_usd: Number(usedCreditUSD.toFixed(2)),

    cash_used_usd: Number(usedCashUSD.toFixed(2)),

    used_usd: Number((usedCreditUSD + usedCashUSD).toFixed(2)),

    /*
      Remaining customer balance
    */
    unused_usd: Number((unusedCreditUSD + unusedCashUSD).toFixed(2)),

    credits: appliedCredits,

    allocations,

    cash_usage,
  };
};

const manualPreviewController = async (
  userId: number,
  companyId: string,
  invoices: {
    open_invoice_id: number;
    payments: {
      amount: number;
      currency: string;
    }[];
  }[],
  creditNotes: {
    open_invoice_id: number;
    amount?: number;
  }[],
) => {
  const prisma = getPrisma(companyId);

  if (!invoices.length) throw new Error("No invoices selected.");

  /*
  =====================================================
  USER
  =====================================================
  */

  const user = await prisma.web_accounts.findUnique({
    where: {
      id: userId,
    },
    select: {
      code: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  /*
  =====================================================
  VALIDATE DUPLICATES
  =====================================================
  */

  const invoiceIds = invoices.map((x) => x.open_invoice_id);

  if (new Set(invoiceIds).size !== invoiceIds.length) {
    throw new Error("Duplicate invoices detected.");
  }

  const creditIds = creditNotes.map((x) => x.open_invoice_id);

  if (new Set(creditIds).size !== creditIds.length) {
    throw new Error("Duplicate credit notes detected.");
  }

  /*
  =====================================================
  LOAD CURRENCIES
  =====================================================
  */

  const currencies = await prisma.currency.findMany({
    select: {
      currency_code: true,
      ratio: true,
      symbol: true,
      dead_amount: true,
    },
  });

  const currencyRatioMap: Record<string, number> = {};
  const currencySymbolMap: Record<string, string> = {};
  const currencyDeadMap: Record<string, number> = {};

  for (const currency of currencies) {
    const ratio = Number(currency.ratio);

    if (ratio <= 0) {
      throw new Error(
        `Currency ${currency.currency_code} has an invalid ratio.`,
      );
    }

    currencyRatioMap[currency.currency_code] = ratio;
    currencySymbolMap[currency.currency_code] = currency.symbol;
    currencyDeadMap[currency.currency_code] = Number(currency.dead_amount);
  }

  /*
  =====================================================
  LOAD INVOICES
  =====================================================
  */

  const dbInvoices = await prisma.open_invoice.findMany({
    where: {
      client_code: user.code,
      open_invoice_id: {
        in: invoiceIds,
      },
      is_active: true,
      invoice_type_id: {
        not: 30,
      },
    },
    select: {
      open_invoice_id: true,
      transaction_header_code: true,
      remaining_amount: true,
      currency_code: true,
    },
    orderBy: {
      invoice_date: "asc",
    },
  });

  if (dbInvoices.length !== invoices.length) {
    throw new Error("One or more invoices were not found.");
  }

  /*
  =====================================================
  LOAD CREDIT NOTES
  =====================================================
  */

  const dbCreditNotes =
    creditNotes.length === 0
      ? []
      : await prisma.open_invoice.findMany({
          where: {
            client_code: user.code,
            open_invoice_id: {
              in: creditIds,
            },
            invoice_type_id: 30,
            is_active: true,
          },
          select: {
            open_invoice_id: true,
            transaction_header_code: true,
            remaining_amount: true,
            currency_code: true,
          },
          orderBy: {
            invoice_date: "asc",
          },
        });

  if (dbCreditNotes.length !== creditNotes.length) {
    throw new Error("One or more credit notes were not found.");
  }

  /*
  =====================================================
  VALIDATE PAYMENTS
  =====================================================
  */

  for (const invoice of invoices) {
    if (!invoice.payments.length) {
      throw new Error(`Invoice ${invoice.open_invoice_id} has no payments.`);
    }

    for (const payment of invoice.payments) {
      if (payment.amount <= 0) {
        throw new Error(
          `Invalid payment amount on invoice ${invoice.open_invoice_id}.`,
        );
      }

      if (!(payment.currency in currencyRatioMap)) {
        throw new Error(`Currency ${payment.currency} does not exist.`);
      }
    }
  }

  /*
  =====================================================
  PREPARE CREDIT POOL
  =====================================================
  */

  let totalRequestedCashUSD = 0;
  let totalRequestedCreditUSD = 0;

  type CreditPoolItem = {
    open_invoice_id: bigint;
    transaction_header_code: string;
    currency_code: string;
    currency_symbol: string;
    ratio: number;
    usd_remaining: number;
    original_remaining: number;
  };

  const creditPool: CreditPoolItem[] = [];

  for (const credit of dbCreditNotes) {
    const ratio = currencyRatioMap[credit.currency_code];

    if (!ratio) {
      throw new Error(`Missing ratio for ${credit.currency_code}`);
    }

    const requested = creditNotes.find(
      (x) => BigInt(x.open_invoice_id) === credit.open_invoice_id,
    )?.amount;

    const absoluteOriginal = Math.abs(Number(credit.remaining_amount));

    // Requested amount is USD
    const requestedUSD =
      requested !== undefined ? Math.abs(requested) : undefined;

    // Convert requested USD into credit currency
    const requestedOriginal =
      requestedUSD !== undefined ? requestedUSD * ratio : undefined;

    const originalAvailable =
      requestedOriginal !== undefined
        ? Math.min(absoluteOriginal, requestedOriginal)
        : absoluteOriginal;

    const usdAvailable = originalAvailable / ratio;

    totalRequestedCreditUSD += usdAvailable;

    creditPool.push({
      open_invoice_id: credit.open_invoice_id,
      transaction_header_code: credit.transaction_header_code,
      currency_code: credit.currency_code,
      currency_symbol: currencySymbolMap[credit.currency_code],
      ratio,
      usd_remaining: usdAvailable,
      original_remaining: originalAvailable,
    });
  }

  /*
  =====================================================
  RESULT OBJECTS
  =====================================================
  */

  const allocations: any[] = [];
  const appliedCredits: any[] = [];

  const paymentCurrencyUsage: Record<
    string,
    {
      currency: string;
      currency_symbol: string;
      ratio: number;
      usd: number;
    }
  > = {};

  let totalUsedCashUSD = 0;
  let totalUsedCreditUSD = 0;

  /*
  =====================================================
  APPLY PAYMENTS + CREDITS PER INVOICE
  =====================================================
  */

  for (const selectedInvoice of invoices) {
    const invoice = dbInvoices.find(
      (x) => x.open_invoice_id === BigInt(selectedInvoice.open_invoice_id),
    );

    if (!invoice) {
      throw new Error(`Invoice ${selectedInvoice.open_invoice_id} not found.`);
    }

    const invoiceRatio = currencyRatioMap[invoice.currency_code];

    if (!invoiceRatio) {
      throw new Error(`Missing currency ratio for ${invoice.currency_code}`);
    }

    /*
    -----------------------------------------------------
    Invoice remaining balance in USD
    -----------------------------------------------------
    */

    let invoiceRemainingUSD = Number(invoice.remaining_amount) / invoiceRatio;

    const invoicePaymentsUSD = selectedInvoice.payments.reduce(
      (sum, payment) => {
        const ratio = currencyRatioMap[payment.currency];

        const usd = payment.amount / ratio;

        totalRequestedCashUSD += usd;

        if (!paymentCurrencyUsage[payment.currency]) {
          paymentCurrencyUsage[payment.currency] = {
            currency: payment.currency,
            currency_symbol: currencySymbolMap[payment.currency],
            ratio,
            usd: 0,
          };
        }

        paymentCurrencyUsage[payment.currency].usd += usd;

        return sum + usd;
      },
      0,
    );

    if (
      invoicePaymentsUSD >
      invoiceRemainingUSD +
        currencyDeadMap[invoice.currency_code] / invoiceRatio
    ) {
      throw new Error(
        `Payment exceeds remaining amount for invoice ${invoice.transaction_header_code}`,
      );
    }

    /*
    -----------------------------------------------------
    Apply CASH first
    -----------------------------------------------------
    */

    const cashAppliedUSD = Math.min(invoiceRemainingUSD, invoicePaymentsUSD);

    invoiceRemainingUSD -= cashAppliedUSD;

    totalUsedCashUSD += cashAppliedUSD;

    /*
    -----------------------------------------------------
    Apply credits after cash
    -----------------------------------------------------
    */

    let creditAppliedUSD = 0;

    for (const credit of creditPool) {
      if (invoiceRemainingUSD <= 0) {
        break;
      }

      if (credit.usd_remaining <= 0) {
        continue;
      }

      const usedUSD = Math.min(invoiceRemainingUSD, credit.usd_remaining);

      credit.usd_remaining -= usedUSD;

      credit.original_remaining = Number(
        (credit.usd_remaining * credit.ratio).toFixed(2),
      );

      invoiceRemainingUSD -= usedUSD;

      creditAppliedUSD += usedUSD;

      totalUsedCreditUSD += usedUSD;

      const existingCredit = appliedCredits.find(
        (x) => x.open_invoice_id === credit.open_invoice_id,
      );

      const allocatedAmount = Number((usedUSD * credit.ratio).toFixed(2));

      const allocatedUSD = Number(usedUSD.toFixed(2));

      if (existingCredit) {
        existingCredit.allocated_amount = Number(
          (existingCredit.allocated_amount + allocatedAmount).toFixed(2),
        );

        existingCredit.allocated_usd = Number(
          (existingCredit.allocated_usd + allocatedUSD).toFixed(2),
        );
      } else {
        appliedCredits.push({
          open_invoice_id: credit.open_invoice_id,

          transaction_header_code: credit.transaction_header_code,

          currency: credit.currency_symbol,

          allocated_amount: allocatedAmount,

          allocated_usd: allocatedUSD,
        });
      }
    }

    /*
    -----------------------------------------------------
    Validate overpayment
    -----------------------------------------------------
    */

    const totalAppliedUSD = cashAppliedUSD + creditAppliedUSD;

    if (
      totalAppliedUSD >
      Number(invoice.remaining_amount) / invoiceRatio +
        currencyDeadMap[invoice.currency_code] / invoiceRatio
    ) {
      throw new Error(
        `Invoice ${invoice.transaction_header_code} was overpaid.`,
      );
    }

    /*
    -----------------------------------------------------
    Remaining balance after payment
    -----------------------------------------------------
    */

    const remainingUSD = Math.max(0, invoiceRemainingUSD);

    const remainingOriginal = remainingUSD * invoiceRatio;

    const deadAmount = currencyDeadMap[invoice.currency_code] ?? 0;

    const finalRemaining =
      remainingOriginal <= deadAmount ? 0 : remainingOriginal;

    allocations.push({
      open_invoice_id: invoice.open_invoice_id,

      transaction_header_code: invoice.transaction_header_code,

      currency: currencySymbolMap[invoice.currency_code],

      cash_used_usd: Number(cashAppliedUSD.toFixed(2)),

      credit_used_usd: Number(creditAppliedUSD.toFixed(2)),

      allocated_amount: Number((totalAppliedUSD * invoiceRatio).toFixed(2)),

      allocated_usd: Number(totalAppliedUSD.toFixed(2)),

      remaining_after_payment: Number(finalRemaining.toFixed(2)),

      remaining_after_payment_usd: Number(
        (finalRemaining / invoiceRatio).toFixed(2),
      ),
    });
  }

  /*
  =====================================================
  CASH USAGE SUMMARY
  =====================================================
  */

  const cash_usage = Object.values(paymentCurrencyUsage).map((payment) => {
    const usedUSD = Math.min(payment.usd, totalUsedCashUSD);

    return {
      currency: payment.currency,

      currency_symbol: payment.currency_symbol,

      used_usd: Number(usedUSD.toFixed(2)),

      used_amount: Number((usedUSD * payment.ratio).toFixed(2)),
    };
  });

  /*
  =====================================================
  UNUSED CREDIT
  =====================================================
  */

  const remainingCreditUSD = creditPool.reduce(
    (sum, credit) => sum + credit.usd_remaining,
    0,
  );

  /*
  =====================================================
  FINAL RESPONSE
  =====================================================
  */

  return {
    requested_usd: Number(
      (totalRequestedCashUSD + totalRequestedCreditUSD).toFixed(2),
    ),

    cash_used_usd: Number(totalUsedCashUSD.toFixed(2)),

    credit_used_usd: Number(totalUsedCreditUSD.toFixed(2)),

    used_usd: Number((totalUsedCashUSD + totalUsedCreditUSD).toFixed(2)),

    unused_usd: Number(remainingCreditUSD.toFixed(2)),

    credits: appliedCredits,

    allocations,

    cash_usage,
  };
};

const getCurrenciesController = async (companyId: string) => {
  const prisma = getPrisma(companyId);

  const currencies = await prisma.currency.findMany({
    where: {
      is_active: true,
    },

    orderBy: {
      description: "asc",
    },

    select: {
      currency_code: true,
      description: true,
      symbol: true,
      ratio: true,
      is_main: true,
      dead_amount: true,
    },
  });

  return currencies.map((currency) => ({
    currency_code: currency.currency_code,
    description: currency.description,
    symbol: currency.symbol,
    ratio: Number(currency.ratio),
    isMain: currency.is_main,
    deadAmount: Number(currency.dead_amount),
  }));
};

export {
  getPendingOpenInvoices,
  getCreditNotes,
  fifoPreviewController,
  manualPreviewController,
  getCurrenciesController,
};
