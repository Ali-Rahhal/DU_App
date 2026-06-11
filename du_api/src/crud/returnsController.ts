import prisma from "../lib/prisma";

const getReturnableInvoices = async (userId: number) => {
  const result = await prisma.$queryRaw`
    SELECT
      th.transaction_header_id,
      th.transaction_header_code AS invoice_code,
      th.date_added AS invoice_date,
      th.total_amount,
      th.currency_code,

      DATEDIFF(
        DAY,
        th.date_added,
        GETDATE()
      ) AS daysSinceInvoice,

      10 AS returnWindowDays,

      CASE
        WHEN EXISTS
        (
          SELECT 1
          FROM transaction_header rth
          WHERE
            rth.transaction_type = 70
            AND rth.transaction_status = 3
            AND rth.is_active = 1
            AND rth.parent_transaction_header_id =
                th.transaction_header_id
        )
        THEN CONVERT(bit,1)
        ELSE CONVERT(bit,0)
      END AS hasPendingReturnRequest,

      CASE
        WHEN
          DATEDIFF(
            DAY,
            th.date_added,
            GETDATE()
          ) <= 10

          AND NOT EXISTS
          (
            SELECT 1
            FROM transaction_header rth
            WHERE
              rth.transaction_type = 70
              AND rth.transaction_status = 3
              AND rth.is_active = 1
              AND rth.parent_transaction_header_id =
                  th.transaction_header_id
          )
        THEN CONVERT(bit,1)
        ELSE CONVERT(bit,0)
      END AS canReturn

    FROM transaction_header th

    INNER JOIN web_accounts wa
      ON wa.code = th.destination_code

    WHERE
      wa.id = ${userId}
      AND th.transaction_type = 4
      AND th.transaction_status = 8
      AND th.is_active = 1

    ORDER BY th.date_added DESC
  `;

  return result;
};

const getPurchasedItems = async (
  userId: number,
  invoiceTransactionHeaderId: number,
) => {
  const result = await prisma.$queryRaw`

    SELECT
      tb.transaction_body_id,

      tb.item_code,

      it.description AS item_name,

      tb.approved_quantity AS purchased_quantity,

      tb.item_default_price,

      tb.total_final_price,

      3 AS quantityRestriction,

      ISNULL(
        (
          SELECT TOP 1
            img.base_path + '/' +
            img.folder_path + '/' +
            img.physical_file_name
          FROM image img
          WHERE
            img.owner_code = it.item_code
            AND img.owner_type = 1
            AND img.is_active = 1
            AND img.is_uploaded = 1
        ),
        ''
      ) as image

    FROM transaction_header invoice_th

    INNER JOIN web_accounts wa
      ON wa.code = invoice_th.destination_code

    INNER JOIN transaction_header order_th
      ON order_th.parent_transaction_header_id =
         invoice_th.transaction_header_id

      AND order_th.transaction_type = 3

    INNER JOIN transaction_body tb
      ON tb.transaction_header_id =
         order_th.transaction_header_id

    INNER JOIN item it
      ON it.item_code = tb.item_code

    WHERE
      wa.id = ${userId}

      AND invoice_th.transaction_header_id =
          ${invoiceTransactionHeaderId}

      AND invoice_th.transaction_type = 4

      AND invoice_th.transaction_status = 8

      AND invoice_th.is_active = 1

    ORDER BY tb.line_id
  `;

  return result;
};

const createReturnRequest = async (
  userId: number,
  invoiceTransactionHeaderId: number,
  reason: string,
  items: {
    item_code: string;
    quantity: number;
  }[],
) => {
  if (!items?.length) {
    throw new Error("No items selected");
  }

  const user = await prisma.web_accounts.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await prisma.$transaction(async (tx) => {
    // =====================================================
    // Validate invoice ownership and return window
    // =====================================================

    const invoices: any[] = await tx.$queryRaw`
      SELECT
        th.transaction_header_id,
        th.transaction_header_code,
        th.currency_code,
        th.currency_rate,
        th.date_added
      FROM transaction_header th
      INNER JOIN web_accounts wa
        ON wa.code = th.destination_code
      WHERE
        wa.id = ${userId}
        AND th.transaction_header_id =
            ${invoiceTransactionHeaderId}
        AND th.transaction_type = 4
        AND th.transaction_status = 8
        AND th.is_active = 1
    `;

    if (!invoices.length) {
      throw new Error("Invoice not found");
    }

    const invoice = invoices[0];

    const invoiceDate = new Date(invoice.date_added);

    const daysPassed =
      (Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysPassed > 10) {
      throw new Error("Return period has expired");
    }

    // =====================================================
    // Find sales order linked to invoice
    // =====================================================

    const orders: any[] = await tx.$queryRaw`
      SELECT TOP 1
        transaction_header_id
      FROM transaction_header
      WHERE
        transaction_type = 3
        AND parent_transaction_header_id =
            ${invoiceTransactionHeaderId}
        AND is_active = 1
    `;

    if (!orders.length) {
      throw new Error("Original order not found");
    }

    const orderTransactionHeaderId = orders[0].transaction_header_id;

    // =====================================================
    // Validate all requested items
    // =====================================================

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for item ${item.item_code}`);
      }

      // Placeholder restriction
      if (item.quantity > 3) {
        throw new Error(
          `Maximum return quantity for item ${item.item_code} is 3`,
        );
      }

      const purchasedItems: any[] = await tx.$queryRaw`
        SELECT TOP 1
          approved_quantity
        FROM transaction_body
        WHERE
          transaction_header_id =
            ${orderTransactionHeaderId}
          AND item_code = ${item.item_code}
          AND is_active = 1
      `;

      if (!purchasedItems.length) {
        throw new Error(`Item ${item.item_code} was not purchased`);
      }

      const purchasedQuantity = Number(purchasedItems[0].approved_quantity);

      const previousReturns: any[] = await tx.$queryRaw`
        SELECT
          ISNULL(
            SUM(tb.requested_quantity),
            0
          ) AS returned_quantity
        FROM transaction_header th
        INNER JOIN transaction_body tb
          ON tb.transaction_header_id =
             th.transaction_header_id
        WHERE
          th.transaction_type = 70
          AND th.is_active = 1
          AND th.parent_transaction_header_id =
              ${invoiceTransactionHeaderId}
          AND th.transaction_status <> 4
          AND tb.item_code = ${item.item_code}
      `;

      const alreadyReturned = Number(
        previousReturns[0]?.returned_quantity ?? 0,
      );

      if (alreadyReturned + item.quantity > purchasedQuantity) {
        throw new Error(
          `Requested quantity exceeds purchased quantity for item ${item.item_code}`,
        );
      }
    }

    // =====================================================
    // Generate IDs WITH LOCKS
    // =====================================================

    const headerIds: any[] = await tx.$queryRaw`
      SELECT
        ISNULL(MAX(transaction_header_id),0) + 1 AS id
      FROM transaction_header
      WITH (UPDLOCK, HOLDLOCK)
    `;

    const transactionHeaderId = Number(headerIds[0].id);

    const bodyIds: any[] = await tx.$queryRaw`
      SELECT
        ISNULL(MAX(transaction_body_id),0) AS id
      FROM transaction_body
      WITH (UPDLOCK, HOLDLOCK)
    `;

    const bodyStart = Number(bodyIds[0].id);

    // =====================================================
    // Create Return Request Header
    // =====================================================

    await tx.transaction_header.create({
      data: {
        transaction_header_id: BigInt(transactionHeaderId),

        transaction_header_code: `RET-${transactionHeaderId}`,

        user_code: "-1",

        source_code: user.code,

        source_type: 2,

        destination_code: "WH0001",

        destination_type: 3,

        transaction_type: 70,

        transaction_status: 3,

        parent_transaction_header_id: BigInt(invoiceTransactionHeaderId),

        currency_code: invoice.currency_code,

        currency_rate: invoice.currency_rate,

        total_amount: 0,

        total_discount: 0,

        print_count: 0,

        is_active: true,

        is_processed: 2,

        date_added: new Date(),

        last_edited: new Date(),

        comment: reason,

        app_version: "ECOM",
      },
    });

    // =====================================================
    // Create Return Request Bodies
    // =====================================================

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      await tx.transaction_body.create({
        data: {
          transaction_body_id: BigInt(bodyStart + i + 1),

          transaction_header_id: BigInt(transactionHeaderId),

          line_id: i + 1,

          item_code: item.item_code,

          requested_quantity: item.quantity,

          approved_quantity: item.quantity,

          package_type: 0,

          reason_id: -1,

          suggested_quantity: 0,

          is_active: true,

          is_processed: 2,

          date_added: new Date(),

          last_edited: new Date(),
        },
      });
    }

    return {
      transaction_header_id: transactionHeaderId,
    };
  });
};

export { getReturnableInvoices, getPurchasedItems, createReturnRequest };
