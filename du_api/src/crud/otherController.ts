import { Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";

const getSideBarMenu = async (companyId: string) => {
  const prisma = getPrisma(companyId);
  const menuItems: any = await prisma.$queryRaw`
  SELECT cat_code = cat.attribute_value_code,
           cat_description = cat.description,
           [url] = '/collection',
           4,
           sub_code = sub.attribute_value_code,
           sub_description = sub.description
    FROM dbo.attribute_value AS cat
        LEFT JOIN dbo.attribute_value AS sub
            ON cat.attribute_value_code = sub.parent_attribute_value_code
               AND sub.attribute_code = 'Catégorie'
               AND sub.is_active = 1
    WHERE cat.attribute_code = 'Activité'
    AND cat.attribute_value_code <> 'CAT_PriceDifference'
          AND cat.is_active = 1
          `;

  //order featured by this
  //CAT_PLAYSTATION,,CAT_EARBUDS_,,CAT_WIRELESS_SPEAKERS,CAT_WATCHES_,CAT_DRONE,CAT_KEYBOARD,CAT_POWER_BANKCAT_POWER_BANK,CAT_ADAPTER,CAT_AIRPODS_C/A,CAT_CABLES

  let menu = [];
  menuItems.forEach((item) => {
    const found = menu.find((i) => i.cat === item.cat_code);
    if (!found) {
      menu.push({
        title: item.cat_description,
        url: "/collection",
        cat: item.cat_code,
        sub: [],
      });
    }
  });
  menuItems.forEach((item) => {
    if (!item.sub_description) return;
    const found = menu.find((i) => i.cat === item.cat_code);
    if (found) {
      found.sub.push({
        title: item.sub_description,
        sub_cat: item.sub_code,
      });
    }
  });
  // const orderedFeatured = [
  //   "CAT_PLAYSTATION",
  //   "CAT_EARBUDS_",
  //   "CAT_WIRELESS_SPEAKERS",
  //   "CAT_WATCHES_",
  //   "CAT_DRONE",
  //   "CAT_KEYBOARD",
  //   "CAT_POWER_BANK",
  //   "CAT_POWER_BANK",
  //   "CAT_ADAPTER",
  //   "CAT_AIRPODS_C/A",
  //   "CAT_CABLES",
  // ];
  // const featuredCategoriesList = [];
  // orderedFeatured.forEach((item) => {
  //   const found = featuredCategories.find(
  //     (i) => i.attribute_value_code === item
  //   );
  //   if (found) {
  //     featuredCategoriesList.push({
  //       title: found.description,
  //       cat: found.attribute_value_code,
  //       url: "/collection",
  //     });
  //   }
  // });
  return { menu };
};

/**
 * Fetches comprehensive dashboard data for a customer
 * Includes statistics, orders, deliveries, invoices, product sales, and seasonal trends
 * @ param user_id - The ID of the user/web_account
 * @ returns Combined dashboard data object
 */
const getDashboardData = async (user_id: number, companyId: string) => {
  const prisma = getPrisma(companyId);
  // ============================================
  // STORED PROCEDURE REFERENCE (commented out)
  // ============================================
  //   ALTER PROCEDURE [dbo].[ECOM_GET_CUSTOMER_DASHBOARD]
  //     @login_code NVARCHAR(50) = N'10003',
  //     @default_days INT = 30
  //   AS
  // ============================================

  // ============================================
  // STEP 1: Fetch user account details
  // ============================================
  const user = await prisma.web_accounts.findFirst({
    where: {
      id: user_id,
    },
  });
  if (!user) throw new Error("User not found");

  // ============================================
  // ORIGINAL STATS QUERY (commented out - complex financial calculations)
  // Calculates: past due amount, YTD sales, last year YTD sales with currency conversions
  // ============================================
  //   const stats: any = await prisma.$queryRaw`
  //   DECLARE @past_due DECIMAL(18, 2);
  // DECLARE @ytd_sales DECIMAL(18, 2);
  // DECLARE @last_ytd_sales DECIMAL(18, 2);
  // DECLARE @currency NVARCHAR(50);

  // SELECT @past_due = SUM(oi.remaining_amount),
  // @currency=   CASE
  //                  WHEN oi.currency_code = '1' THEN
  //                      'L.L.'
  //                  WHEN oi.currency_code = '2' THEN
  //                      'USD'
  //                  ELSE
  //                  oi.currency_code
  //              END

  // FROM dbo.open_invoice as oi
  // JOIN web_accounts AS wa on wa.code = client_code
  // WHERE oi.is_active = 1
  // AND  oi.currency_code = 'MOH_USD'
  // AND wa.id = ${user_id}
  // AND ABS(oi.remaining_amount) > 1
  // AND oi.due_date < GETDATE()
  // GROUP BY oi.currency_code;

  // DECLARE @eur_rate FLOAT =
  //         (
  //             SELECT c.ratio FROM dbo.currency AS c WHERE c.currency_code = 'EUR'
  //         );
  // DECLARE @usd_rate FLOAT =
  //         (
  //             SELECT c.ratio FROM dbo.currency AS c WHERE c.currency_code = 'EUR'
  //         );
  // DECLARE @L.L._rate FLOAT =
  //         (
  //             SELECT c.ratio FROM dbo.currency AS c WHERE c.currency_code = 'L.L.'
  //         );

  // SELECT @ytd_sales= SUM(   CASE
  //                   WHEN th.currency_code = 'USD' THEN
  //                       th.total_amount
  //                   WHEN th.currency_code = 'L.L.' THEN
  //                       CONVERT(DECIMAL(18, 2), (th.total_amount / @L.L._rate) * @usd_rate)
  //                   WHEN th.currency_code = 'EUR' THEN
  //                       CONVERT(DECIMAL(18, 2), th.total_amount * @usd_rate)
  //               END
  //           )
  // FROM dbo.transaction_header AS th
  // JOIN web_accounts AS wa on wa.code =  th.destination_code
  // WHERE th.transaction_type = 4
  //       AND th.is_active = 1
  //     AND wa.id = ${user_id}
  //       AND CONVERT(DATE, th.date_added)
  //       BETWEEN CONVERT(DATE, DATEFROMPARTS(YEAR(GETDATE()), 1, 1)) AND CONVERT(DATE, GETDATE());

  // SELECT @last_ytd_sales = SUM(   CASE
  //                   WHEN th.currency_code = 'USD' THEN
  //                       th.total_amount
  //                   WHEN th.currency_code = 'L.L.' THEN
  //                       CONVERT(DECIMAL(18, 2), (th.total_amount / @L.L._rate) * @usd_rate)
  //                   WHEN th.currency_code = 'EUR' THEN
  //                       CONVERT(DECIMAL(18, 2), th.total_amount * @usd_rate)
  //               END
  //           )
  // FROM dbo.transaction_header AS th
  // JOIN web_accounts AS wa on wa.code =  th.destination_code
  // WHERE th.transaction_type = 4
  //       AND th.is_active = 1
  //          AND wa.id = ${user_id}
  //       AND CONVERT(DATE, th.date_added)
  //       BETWEEN DATEADD(YEAR, -1, CONVERT(DATE, DATEFROMPARTS(YEAR(GETDATE()), 1, 1))) AND DATEADD(
  //                                                                                                     YEAR,
  //                                                                                                     -1,
  //                                                                                                     CONVERT(
  //                                                                                                                DATE,
  //                                                                                                                GETDATE()
  //                                                                                                            )
  //                                                                                                 );

  //  CREATE TABLE #temptable1 (
  //     [total_outstanding] NVARCHAR(4000),
  //     [past_due] NVARCHAR(4000),
  //     [ytd_sales] NVARCHAR(4000),
  //     [last_ytd_sales] NVARCHAR(4000)
  //   );
  //    INSERT INTO #temptable1
  //    VALUES (
  //    ISNULL('USD' + ' ' + FORMAT(@past_due, 'N2'), 'N/A'),
  //     ISNULL('USD' + ' ' + FORMAT(@past_due, 'N2'), 'N/A'),
  //     ISNULL('USD' + ' ' + FORMAT(@ytd_sales, 'N2'), 'N/A'),
  //     ISNULL('USD' + ' ' + FORMAT(@last_ytd_sales, 'N2'), 'N/A')

  //    )

  //      SELECT * FROM #temptable1 AS t;

  //   DROP TABLE #temptable1;
  // `;

  // ============================================
  // STEP 2: Get dashboard statistics (simplified version with sample data)
  // Returns: total_outstanding, past_due, ytd_sales, last_ytd_sales
  // ============================================
  const stats: any = await prisma.$queryRaw`
    -- Create temporary table to hold dashboard statistics
    CREATE TABLE #temptable1 (
        [total_outstanding] NVARCHAR(4000),  -- Total amount customer owes
        [past_due] NVARCHAR(4000),           -- Overdue payments
        [ytd_sales] NVARCHAR(4000),          -- Year-to-date sales
        [last_ytd_sales] NVARCHAR(4000)      -- Previous year's YTD sales
    );
    
    -- Insert sample/demo data (replace with actual calculations in production)
    INSERT INTO #temptable1
    VALUES (
        ISNULL('TND' + ' ' + FORMAT(8987, 'N2'), 'N/A'),
        ISNULL('TND' + ' ' + FORMAT(2034, 'N2'), 'N/A'),
        ISNULL('TND' + ' ' + FORMAT(20484, 'N2'), 'N/A'),
        ISNULL('TND' + ' ' + FORMAT(15999, 'N2'), 'N/A')
    )
    
    -- Return the statistics
    SELECT * FROM #temptable1 AS t;
    
    -- Clean up temporary table
    DROP TABLE #temptable1;
  `;

  // ============================================
  // STEP 3: Get recent customer orders
  // Fetches top 5 most recent orders with their status
  // Transaction type 3 = Order/Sales order
  // Status 9,10 = Cancelled/Completed (excluded)
  // ============================================
  const recentOrders = await prisma.$queryRaw`
    SELECT TOP 5
        sales_number = th.transaction_header_code,  -- Order number
        th.transaction_header_id,                    -- Internal order ID
        order_date = FORMAT(th.date_added, 'dd/MM/yy'), -- Formatted order date
        transaction_status = th.transaction_status    -- Current order status
    FROM dbo.transaction_header AS th
    WHERE th.is_active = 1                           -- Only active transactions
        AND th.source_code = ${user.code}            -- Orders placed by this customer
        AND th.transaction_type = 3                  -- Type 3 = Sales order
        AND th.transaction_status NOT IN (9, 10)     -- Exclude cancelled/completed
    ORDER BY th.date_added DESC;                     -- Most recent first
  `;

  // ============================================
  // STEP 4: Get upcoming delivery dues
  // Fetches top 5 pending deliveries with their due dates
  // Transaction type 4 = Delivery/Invoice
  // ============================================
  const nextDeliveryDues = await prisma.$queryRaw`
    -- First, get pending deliveries for this customer
    SELECT TOP 5
        delivery_number = th.transaction_header_code,  -- Delivery number
        due_date = th.expected_delivery_date,          -- Expected delivery date
        transaction_status = th.transaction_status
    INTO #next_delivery_dues                           -- Store in temp table
    FROM dbo.transaction_header AS th
    WHERE th.is_active = 1
        AND th.[destination_code] = ${user.code}       -- Deliveries to this customer
        AND th.transaction_type = 4                    -- Type 4 = Delivery/Invoice
        AND th.transaction_status NOT IN (8, 9, 10)    -- Exclude delivered/cancelled/completed
    ORDER BY th.expected_delivery_date DESC;           -- Latest expected dates first
    
    -- Then format and return the results in ascending order (soonest first)
    SELECT 
        delivery_number = ndd.delivery_number,
        due_date = FORMAT(ndd.due_date, 'dd/MM/yy'),   -- Formatted due date
        transaction_status = ndd.transaction_status
    FROM #next_delivery_dues AS ndd
    ORDER BY ndd.due_date ASC;                         -- Soonest deliveries first
    
    -- Clean up temp table
    DROP TABLE #next_delivery_dues;
  `;

  // ============================================
  // STEP 5: Get collection/payment history
  // Fetches top 5 recent payments made by the customer
  // ============================================
  // PREVIOUS VERSION:
  // const collectionHeaders = await prisma.$queryRaw`
  //   SELECT TOP 5
  //       invoice_number = choi.transaction_header_code,  -- Invoice being paid
  //       due_date = FORMAT(ch.date_added, 'dd/MM/yy'),   -- Payment date
  //       amount = CASE                                     -- Format amount with currency
  //                   WHEN ch.currency_code = '1' THEN 'L.L. '
  //                   WHEN ch.currency_code = '2' THEN '$ '
  //                   ELSE ch.currency_code + ' '
  //               END + FORMAT(ch.total_amount, 'N2')
  //   FROM dbo.collection_header AS ch                    -- Collection/Payment header
  //   JOIN dbo.collection_header_open_invoice AS choi     -- Links payment to invoices
  //       ON choi.collection_header_id = ch.collection_header_id
  //   WHERE ch.is_active = 1
  //       AND ch.[client_code] = ${user.code}             -- Payments made by this customer
  //   ORDER BY ch.date_added DESC;                        -- Most recent first
  // `;
  const collectionHeaders = await prisma.$queryRaw`
    SELECT TOP 5
        invoice_number = choi.transaction_header_code,  -- Invoice being paid
        due_date = FORMAT(ch.date_added, 'dd/MM/yy'),   -- Payment date
        amount = 'TND ' + FORMAT(4234, 'N2')        -- Placeholder
    FROM dbo.collection_header AS ch                    -- Collection/Payment header
    JOIN dbo.collection_header_open_invoice AS choi     -- Links payment to invoices
        ON choi.collection_header_id = ch.collection_header_id
    WHERE ch.is_active = 1 
        AND ch.[client_code] = ${user.code}             -- Payments made by this customer
    ORDER BY ch.date_added DESC;                        -- Most recent first
  `;

  // ============================================
  // STEP 6: Get most recent open invoice/payment details
  // Returns the latest payment with check/bank details if applicable
  // ============================================
  // PREVIOUS VERSION:
  // const openInvoice = await prisma.$queryRaw`
  //   SELECT TOP 1
  //       payment_amount = CASE                              -- Formatted payment amount
  //                           WHEN ch.currency_code = '1' THEN 'L.L. '
  //                           WHEN ch.currency_code = '2' THEN '$ '
  //                           ELSE ch.currency_code + ' '
  //                       END + FORMAT(ch.total_amount, 'N2'),
  //       paid_for = choi.transaction_header_code,          -- Which invoice was paid
  //       payment_on = FORMAT(ch.date_added, 'dd MMM yyyy'), -- Payment date
  //       payment_type = CASE                                -- Payment method details
  //                         WHEN cb.Payment_type = 2 THEN 'CASH'
  //                         ELSE 'CHEQUE- ' + cb.check_serial_number + ' [bank: ' + b.description + ']'
  //                     END
  //   FROM dbo.collection_header AS ch
  //   JOIN dbo.collection_header_open_invoice AS choi
  //       ON choi.collection_header_id = ch.collection_header_id
  //   JOIN dbo.collection_body AS cb                        -- Payment body with check details
  //       ON cb.collection_header_id = ch.collection_header_id
  //   LEFT JOIN dbo.bank AS b                               -- Bank info for cheques
  //       ON b.bank_code = cb.bank_code
  //   WHERE ch.is_active = 1
  //       AND ch.[client_code] = ${user.code}
  //   ORDER BY ch.date_added DESC;                          -- Most recent payment first
  // `;
  const openInvoice = await prisma.$queryRaw`
    SELECT TOP 1
        payment_amount = 'TND ' + FORMAT(4234, 'N2')  ,   -- Placeholder
        paid_for = choi.transaction_header_code,          -- Which invoice was paid
        payment_on = FORMAT(ch.date_added, 'dd MMM yyyy'), -- Payment date
        payment_type = CASE                                -- Payment method details
                          WHEN cb.Payment_type = 2 THEN 'CASH'
                          ELSE 'CHEQUE- ' + cb.check_serial_number + ' [bank: ' + b.description + ']'
                      END
    FROM dbo.collection_header AS ch
    JOIN dbo.collection_header_open_invoice AS choi
        ON choi.collection_header_id = ch.collection_header_id
    JOIN dbo.collection_body AS cb                        -- Payment body with check details
        ON cb.collection_header_id = ch.collection_header_id
    LEFT JOIN dbo.bank AS b                               -- Bank info for cheques
        ON b.bank_code = cb.bank_code
    WHERE ch.is_active = 1 
        AND ch.[client_code] = ${user.code}
    ORDER BY ch.date_added DESC;                          -- Most recent payment first
  `;

  // ============================================
  // STEP 7: Get latest transaction/order summary
  // Returns the most recent delivery with sales rep info and next planned visit
  // ============================================
  const transaction_header = await prisma.$queryRaw`
    SELECT TOP 1
        order_amount = ISNULL(                              -- Total order amount
                            CASE
                                WHEN th.currency_code = '1' THEN 'L.L. '
                                WHEN th.currency_code = '2' THEN '$ '
                                ELSE th.currency_code + ' '
                            END + FORMAT(th.total_amount, 'N2'),
                            '0'
                        ),
        order_code = ISNULL(th.transaction_header_code, '[N/A]'),  -- Order number
        placed_on = FORMAT(v.visit_date, 'dd MMM yyyy'),          -- Order date
        sales_rep = u.description,                                 -- Sales representative name
        next_planned_visit = ISNULL(FORMAT(DATEADD(MONTH, 1, GETDATE()), 'dd MMM yyyy'), '[N/A]')  -- Placeholder for next visit
    FROM dbo.visit AS v
    JOIN dbo.[user] AS u
        ON u.user_code = v.user_code
    INNER JOIN dbo.transaction_header AS th
        ON th.visit_id = v.visit_id
        AND th.transaction_type = 4     -- Delivery/Invoice type
        AND th.is_active = 1
    WHERE th.destination_code = ${user.code}   -- Deliveries to this customer
    ORDER BY v.visit_date DESC                  -- Most recent visit first
  `;

  // ============================================
  // STEP 8: Get product sales by category
  // Groups sales by product category (using 'Activité' attribute)
  // Calculates total sales value for each category over the last 12 months
  // ============================================
  // PREVIOUS VERSION:
  // const productsByCategory = await prisma.$queryRaw`
  //   DECLARE @today DATE = GETDATE(),
  //       @attribute_code NVARCHAR(50) = 'Activité';  -- Category attribute name

  //   SELECT
  //       category = av.description,                        -- Category name
  //       val = CONVERT(DECIMAL(18, 2), SUM(tb.approved_quantity * 8.2))  -- Total sales value
  //   FROM dbo.transaction_header AS th_a  -- Transaction A: Type 4 delivery/invoice
  //   -- Join to find Transaction B which has th_a's ID as its parent
  //   JOIN dbo.transaction_header AS th_b  -- Transaction B: The parent transaction
  //       ON th_b.parent_transaction_header_id = th_a.transaction_header_id
  //       AND th_b.is_active = 1
  //       AND th_b.transaction_status NOT IN (9, 10)
  //   -- Join to transaction body from Transaction B (the parent)
  //   JOIN dbo.transaction_body AS tb
  //       ON tb.transaction_header_id = th_b.transaction_header_id
  //   JOIN dbo.item AS i
  //       ON i.item_code = tb.item_code
  //   JOIN dbo.attribute_value_entity AS ave              -- Links items to attribute values
  //       ON ave.entity_code = i.item_code
  //   JOIN dbo.attribute_value AS av                      -- Attribute value details
  //       ON av.attribute_value_code = ave.attribute_value_code
  //   WHERE th_a.is_active = 1
  //       AND th_a.transaction_status NOT IN (9, 10)      -- Exclude cancelled/completed
  //       AND th_a.transaction_type = 4                   -- Delivery/Invoice transactions
  //       AND th_a.destination_code = ${user.code}        -- To this customer
  //       AND CONVERT(DATE, th_a.date_added)
  //           BETWEEN DATEADD(MONTH, -12, @today) AND @today  -- Last 12 months
  //       AND tb.is_active = 1
  //       AND tb.approved_quantity > 0                    -- Only positive quantities
  //       AND i.is_active = 1
  //       AND i.status = 1                                -- Active items only
  //       AND ave.is_active = 1
  //       AND av.is_active = 1
  //       AND av.attribute_code = @attribute_code         -- Filter by category attribute
  //   GROUP BY av.description;
  // `;
  const productsByCategory = await prisma.$queryRaw`
    DECLARE @today DATE = GETDATE();

    SELECT 
        category = ib.description,                        -- Category name
        val = CONVERT(DECIMAL(18, 2), SUM(tb.approved_quantity))  -- Total sales value
    FROM dbo.transaction_header AS th_a  -- Transaction A: Type 4 delivery/invoice
    -- Join to find Transaction B which has th_a's ID as its parent
    JOIN dbo.transaction_header AS th_b  -- Transaction B: The parent transaction
        ON th_b.parent_transaction_header_id = th_a.transaction_header_id
        AND th_b.is_active = 1
        AND th_b.transaction_status NOT IN (9, 10)
    -- Join to transaction body from Transaction B (the parent)
    JOIN dbo.transaction_body AS tb
        ON tb.transaction_header_id = th_b.transaction_header_id
    JOIN dbo.item AS i
        ON i.item_code = tb.item_code
    JOIN dbo.item_brand AS ib
        ON ib.item_brand_code = i.brand_code
    WHERE th_a.is_active = 1
        AND th_a.transaction_status NOT IN (9, 10)      -- Exclude cancelled/completed
        AND th_a.transaction_type = 4                   -- Delivery/Invoice transactions
        AND th_a.destination_code = ${user.code}        -- To this customer
        AND CONVERT(DATE, th_a.date_added)
            BETWEEN DATEADD(MONTH, -12, @today) AND @today  -- Last 12 months
        AND tb.is_active = 1
        AND tb.approved_quantity > 0                    -- Only positive quantities
        AND i.is_active = 1
    GROUP BY ib.description;
  `;

  // ============================================
  // STEP 9: Get top selling products
  // Finds top 10 products by sales value over the last 90 days
  // Compares with previous period to calculate sales variation
  // ============================================
  // PREVIOUS VERSION:
  // const productSales = await prisma.$queryRaw`
  //   DECLARE @login_code NVARCHAR(50) = ${user.code},
  //           @default_days INT = 90,        -- Lookback period in days
  //           @today DATETIME = GETDATE();

  //   -- STEP 9a: Get top 5 products by total sales value
  //   SELECT TOP 10
  //       i.item_code,
  //       item = i.description,
  //       current_qty = SUM(tb.approved_quantity)
  //   INTO #top5Products
  //   FROM dbo.transaction_header AS th
  //   JOIN dbo.transaction_body AS tb
  //       ON tb.transaction_header_id = th.transaction_header_id
  //   JOIN dbo.item AS i
  //       ON i.item_code = tb.item_code
  //   WHERE th.is_active = 1
  //       AND th.transaction_status NOT IN (9, 10)
  //       AND th.transaction_type = 4                      -- Delivery transactions
  //       AND th.destination_code = @login_code
  //       AND CONVERT(DATE, th.date_added)
  //           BETWEEN DATEADD(DAY, -@default_days, @today) AND @today  -- Last 90 days
  //       AND tb.is_active = 1
  //       AND tb.approved_quantity > 0
  //       AND i.is_active = 1
  //       AND i.status = 1
  //   GROUP BY i.item_code, i.description
  //   ORDER BY SUM(tb.total_final_price) DESC;            -- Order by sales value

  //   -- STEP 9b: Get sales quantities for same products in previous period (previous 90 days, shifted by 1 month)
  //   SELECT
  //       tp.item,
  //       old_quantity = SUM(ISNULL(tb.approved_quantity, 0))
  //   INTO #previousTop5Products
  //   FROM #top5Products AS tp
  //   INNER JOIN dbo.transaction_body AS tb
  //       ON tb.item_code = tp.item_code
  //   INNER JOIN dbo.transaction_header AS th
  //       ON th.transaction_header_id = tb.transaction_header_id
  //       AND th.is_active = 1
  //       AND th.transaction_status NOT IN (9, 10)
  //       AND th.transaction_type = 4
  //       AND th.destination_code = @login_code
  //       AND CONVERT(DATE, th.date_added)
  //           BETWEEN DATEADD(MONTH, -1, DATEADD(DAY, -@default_days, @today))  -- Previous period start
  //           AND DATEADD(MONTH, -1, @today)                                     -- Previous period end
  //       AND tb.is_active = 1
  //       AND tb.approved_quantity > 0
  //   GROUP BY tp.item;

  //   -- STEP 9c: Final result with product details, quantities, and variation percentage
  //   SELECT
  //       item = tp.item,
  //       sold_quantity = tp.current_qty,
  //       variation = CASE                         -- Percentage change vs previous period
  //                       WHEN ISNULL(ptp.old_quantity, 0) = 0 THEN CONVERT(DECIMAL(18, 1), 0)
  //                       ELSE CONVERT(DECIMAL(18, 1), ((tp.current_qty - ISNULL(ptp.old_quantity, 0)) * 100.0) / ISNULL(ptp.old_quantity, 0))
  //                   END,
  //       image_url = i.base_path + '/' + i.folder_path + '/' + i.physical_file_name  -- Product image
  //   FROM #top5Products AS tp
  //   LEFT JOIN #previousTop5Products AS ptp
  //       ON ptp.item = tp.item
  //   LEFT JOIN dbo.image AS i
  //       ON i.owner_code = tp.item_code
  //       AND i.is_active = 1
  //       AND i.owner_type = 1                     -- Owner type 1 = Product image
  //   ORDER BY tp.current_qty DESC;

  //   -- Clean up temporary tables
  //   DROP TABLE #top5Products, #previousTop5Products;
  // `;
  const productSales = await prisma.$queryRaw`
    DECLARE @login_code NVARCHAR(50) = ${user.code},
            @default_days INT = 90,        -- Lookback period in days
            @today DATETIME = GETDATE();

    -- STEP 9a: Get top 10 products by total sales value from parent transactions
    -- Transaction A: Type 4 delivery/invoice to customer
    -- Transaction B: Parent transaction that has A's ID in its parent_transaction_header_id
    -- We take transaction body from Transaction B
    SELECT TOP 10
        i.item_code,
        item = i.description,
        current_qty = SUM(tb.approved_quantity)
    INTO #top5Products
    FROM dbo.transaction_header AS th_a  -- Transaction A: Type 4 delivery/invoice
    -- Join to find Transaction B which has th_a's ID as its parent
    JOIN dbo.transaction_header AS th_b  -- Transaction B: The parent transaction
        ON th_b.parent_transaction_header_id = th_a.transaction_header_id
        AND th_b.is_active = 1
        AND th_b.transaction_status NOT IN (9, 10)
    -- Join to transaction body from Transaction B (the parent)
    JOIN dbo.transaction_body AS tb
        ON tb.transaction_header_id = th_b.transaction_header_id
    JOIN dbo.item AS i
        ON i.item_code = tb.item_code
    WHERE th_a.is_active = 1
        AND th_a.transaction_status NOT IN (9, 10)
        AND th_a.transaction_type = 4                      -- Delivery transactions
        AND th_a.destination_code = @login_code
        AND CONVERT(DATE, th_a.date_added)
            BETWEEN DATEADD(DAY, -@default_days, @today) AND @today  -- Last 90 days
        AND tb.is_active = 1
        AND tb.approved_quantity > 0
        AND i.is_active = 1
        AND i.status = 1
    GROUP BY i.item_code, i.description
    ORDER BY SUM(tb.total_final_price) DESC;            -- Order by sales value

    -- STEP 9b: Get sales quantities for same products in previous period (previous 90 days, shifted by 1 month)
    SELECT 
        tp.item,
        old_quantity = SUM(ISNULL(tb.approved_quantity, 0))
    INTO #previousTop5Products
    FROM #top5Products AS tp
    INNER JOIN dbo.transaction_body AS tb
        ON tb.item_code = tp.item_code
    INNER JOIN dbo.transaction_header AS th_b  -- Parent transaction
        ON th_b.transaction_header_id = tb.transaction_header_id
        AND th_b.is_active = 1
        AND th_b.transaction_status NOT IN (9, 10)
    -- Join to find Transaction A that links to this parent
    INNER JOIN dbo.transaction_header AS th_a
        ON th_b.parent_transaction_header_id = th_a.transaction_header_id
        AND th_a.is_active = 1
        AND th_a.transaction_status NOT IN (9, 10)
        AND th_a.transaction_type = 4
        AND th_a.destination_code = @login_code
        AND CONVERT(DATE, th_a.date_added)
            BETWEEN DATEADD(MONTH, -1, DATEADD(DAY, -@default_days, @today))  -- Previous period start
            AND DATEADD(MONTH, -1, @today)                                     -- Previous period end
    WHERE tb.is_active = 1
        AND tb.approved_quantity > 0
    GROUP BY tp.item;

    -- STEP 9c: Final result with product details, quantities, and variation percentage
    SELECT 
        item = tp.item,
        sold_quantity = tp.current_qty,
        variation = CASE                         -- Percentage change vs previous period
                        WHEN ISNULL(ptp.old_quantity, 0) = 0 THEN CONVERT(DECIMAL(18, 1), 0)
                        ELSE CONVERT(DECIMAL(18, 1), ((tp.current_qty - ISNULL(ptp.old_quantity, 0)) * 100.0) / ISNULL(ptp.old_quantity, 0))
                    END,
        image_url = i.base_path + '/' + i.folder_path + '/' + i.physical_file_name  -- Product image
    FROM #top5Products AS tp
    LEFT JOIN #previousTop5Products AS ptp
        ON ptp.item = tp.item
    LEFT JOIN dbo.image AS i
        ON i.owner_code = tp.item_code
        AND i.is_active = 1
        AND i.owner_type = 1                     -- Owner type 1 = Product image
    ORDER BY tp.current_qty DESC;

    -- Clean up temporary tables
    DROP TABLE #top5Products, #previousTop5Products;
  `;

  // ============================================
  // STEP 10: Get seasonal sales variation
  // Compares monthly sales vs returns for the current year
  // Transaction types: 4 = Sales, 58 & 40 = Returns
  // ============================================
  // PREVIOUS VERSION:
  // const seasonalVariation = await prisma.$queryRaw`
  //   -- STEP 10a: Calculate monthly sales quantities
  //   SELECT
  //       month_number = MONTH(th.date_added),
  //       [month] = FORMAT(th.date_added, 'MMM'),    -- Abbreviated month name
  //       TotalSales = SUM(tb.approved_quantity)
  //   INTO #sales
  //   FROM dbo.transaction_header AS th
  //   INNER JOIN dbo.transaction_body AS tb
  //       ON tb.transaction_header_id = th.transaction_header_id
  //   WHERE th.transaction_type IN (4)                -- Sales transactions
  //       AND th.is_active = 1
  //       AND YEAR(th.date_added) = YEAR(GETDATE())   -- Current year only
  //       AND tb.is_active = 1
  //       AND tb.approved_quantity > 0
  //       AND th.destination_code = ${user.code}      -- Sales to this customer
  //   GROUP BY MONTH(th.date_added), FORMAT(th.date_added, 'MMM');

  //   -- STEP 10b: Calculate monthly return quantities
  //   SELECT
  //       month_number = MONTH(th.date_added),
  //       [month] = FORMAT(th.date_added, 'MMM'),
  //       TotalReturns = SUM(tb.approved_quantity)
  //   INTO #returns
  //   FROM dbo.transaction_header AS th
  //   INNER JOIN dbo.transaction_body AS tb
  //       ON tb.transaction_header_id = th.transaction_header_id
  //   WHERE th.transaction_type IN (58, 40)           -- Return transaction types
  //       AND th.is_active = 1
  //       AND YEAR(th.date_added) = YEAR(GETDATE())   -- Current year only
  //       AND tb.is_active = 1
  //       AND tb.approved_quantity > 0
  //       AND th.source_code = ${user.code}           -- Returns from this customer
  //   GROUP BY MONTH(th.date_added), FORMAT(th.date_added, 'MMM');

  //   -- STEP 10c: Combine sales and returns data
  //   SELECT
  //       s.month_number,
  //       s.month,
  //       s.TotalSales,
  //       TotalReturns = ISNULL(r.TotalReturns, 0)    -- Default to 0 if no returns
  //   INTO #sales_ordered
  //   FROM #sales AS s
  //   LEFT JOIN #returns AS r
  //       ON r.month_number = s.month_number;

  //   -- Return final monthly comparison
  //   SELECT month, TotalSales, TotalReturns
  //   FROM #sales_ordered
  //   ORDER BY month_number;

  //   -- Clean up temporary tables
  //   DROP TABLE #returns, #sales, #sales_ordered;
  // `;
  const seasonalVariation = await prisma.$queryRaw`
    -- STEP 10a: Calculate monthly sales quantities from parent transactions
    -- Transaction A: Type 4 delivery/invoice to customer
    -- Transaction B: Parent transaction that has A's ID in its parent_transaction_header_id
    -- We take transaction body from Transaction B for sales
    SELECT 
        month_number = MONTH(th_a.date_added),
        [month] = FORMAT(th_a.date_added, 'MMM'),    -- Abbreviated month name
        TotalSales = SUM(tb.approved_quantity)
    INTO #sales
    FROM dbo.transaction_header AS th_a  -- Transaction A: Type 4 delivery/invoice
    -- Join to find Transaction B which has th_a's ID as its parent
    JOIN dbo.transaction_header AS th_b  -- Transaction B: The parent transaction
        ON th_b.parent_transaction_header_id = th_a.transaction_header_id
        AND th_b.is_active = 1
        AND th_b.transaction_status NOT IN (9, 10)
    -- Join to transaction body from Transaction B (the parent)
    JOIN dbo.transaction_body AS tb
        ON tb.transaction_header_id = th_b.transaction_header_id
    WHERE th_a.transaction_type IN (4)                -- Sales/Delivery transactions
        AND th_a.is_active = 1
        AND th_a.transaction_status NOT IN (9, 10)
        AND YEAR(th_a.date_added) = YEAR(GETDATE())   -- Current year only
        AND tb.is_active = 1
        AND tb.approved_quantity > 0
        AND th_a.destination_code = ${user.code}      -- Sales to this customer
    GROUP BY MONTH(th_a.date_added), FORMAT(th_a.date_added, 'MMM');

    -- STEP 10b: Calculate monthly return quantities from parent transactions
    -- For returns: Transaction A is the return transaction (Type 58 or 40)
    -- Transaction B is the parent (original sale) that has A's ID in its parent_transaction_header_id
    SELECT 
        month_number = MONTH(th_a.date_added),
        [month] = FORMAT(th_a.date_added, 'MMM'),
        TotalReturns = SUM(tb.approved_quantity)
    INTO #returns
    FROM dbo.transaction_header AS th_a  -- Transaction A: Return transaction
    -- Join to find Transaction B which has th_a's ID as its parent
    JOIN dbo.transaction_header AS th_b  -- Transaction B: The parent (original sale)
        ON th_b.parent_transaction_header_id = th_a.transaction_header_id
        AND th_b.is_active = 1
        AND th_b.transaction_status NOT IN (9, 10)
    -- Join to transaction body from Transaction B (the parent/original sale)
    JOIN dbo.transaction_body AS tb
        ON tb.transaction_header_id = th_b.transaction_header_id
    WHERE th_a.transaction_type IN (58, 40)           -- Return transaction types
        AND th_a.is_active = 1
        AND th_a.transaction_status NOT IN (9, 10)
        AND YEAR(th_a.date_added) = YEAR(GETDATE())   -- Current year only
        AND tb.is_active = 1
        AND tb.approved_quantity > 0
        AND th_a.source_code = ${user.code}           -- Returns from this customer
    GROUP BY MONTH(th_a.date_added), FORMAT(th_a.date_added, 'MMM');

    -- STEP 10c: Combine sales and returns data
    SELECT 
        s.month_number,
        s.month,
        s.TotalSales,
        TotalReturns = ISNULL(r.TotalReturns, 0)    -- Default to 0 if no returns
    INTO #sales_ordered
    FROM #sales AS s
    LEFT JOIN #returns AS r
        ON r.month_number = s.month_number;

    -- Return final monthly comparison
    SELECT month, TotalSales, TotalReturns 
    FROM #sales_ordered
    ORDER BY month_number;

    -- Clean up temporary tables
    DROP TABLE #returns, #sales, #sales_ordered;
  `;

  // ============================================
  // STEP 11: Combine all results into a single object
  // ============================================
  const combinedResults = {
    stats: stats[0], // Dashboard statistics (first row)
    recentOrders: recentOrders, // Recent order history
    nextDeliveryDues: nextDeliveryDues, // Upcoming deliveries
    collectionHeaders: collectionHeaders, // Payment history
    openInvoice: openInvoice[0], // Latest payment (first row)
    transaction_header: transaction_header[0], // Latest transaction (first row)
    productsByCategory: productsByCategory, // Category sales breakdown
    productSales: productSales, // Top selling products
    seasonalVariation: seasonalVariation, // Monthly sales vs returns
  };

  return combinedResults;
};

export { getSideBarMenu, getDashboardData };
