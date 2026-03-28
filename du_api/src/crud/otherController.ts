import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

const getSideBarMenu = async () => {
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

const getDashboardData = async (user_id: number) => {
  //   ALTER PROCEDURE [dbo].[ECOM_GET_CUSTOMER_DASHBOARD]
  //     @login_code NVARCHAR(50) = N'10003',
  //     @default_days INT = 30
  // AS
  const user = await prisma.web_accounts.findFirst({
    where: {
      id: user_id,
    },
  });
  if (!user) throw new Error("User not found");

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

  const stats: any = await prisma.$queryRaw`
CREATE TABLE #temptable1 (
    [total_outstanding] NVARCHAR(4000),
    [past_due] NVARCHAR(4000),
    [ytd_sales] NVARCHAR(4000),
    [last_ytd_sales] NVARCHAR(4000)
  );
   INSERT INTO #temptable1
   VALUES (
   ISNULL('L.L.' + ' ' + FORMAT(12525, 'N2'), 'N/A'),
    ISNULL('L.L.' + ' ' + FORMAT(16548, 'N2'), 'N/A'),
    ISNULL('L.L.' + ' ' + FORMAT(1654852, 'N2'), 'N/A'),
    ISNULL('L.L.' + ' ' + FORMAT(1354852, 'N2'), 'N/A')

   )

     SELECT * FROM #temptable1 AS t;

  DROP TABLE #temptable1;
  `;

  // Second raw SQL query
  const recentOrders = await prisma.$queryRaw`
SELECT TOP 5
       sales_number = th.transaction_header_code,
      th.transaction_header_id,
       order_date = FORMAT(th.date_added, 'dd/MM/yy'),
       transaction_status = th.transaction_status
FROM dbo.transaction_header AS th
WHERE th.is_active = 1
      AND th.source_code = ${user.code}
      AND th.transaction_type = 3
      AND th.transaction_status NOT IN (9, 10)
ORDER BY th.date_added DESC;
`;

  // Third raw SQL query
  const nextDeliveryDues = await prisma.$queryRaw`

SELECT TOP 5
       delivery_number = th.transaction_header_code,
       due_date = th.expected_delivery_date,
       transaction_status = th.transaction_status
INTO #next_delivery_dues
FROM dbo.transaction_header AS th
      WHERE th.is_active = 1
      AND th.[destination_code] = ${user.code}   
      AND th.transaction_type = 4
      AND th.transaction_status NOT IN (8, 9, 10)
ORDER BY th.expected_delivery_date DESC;

SELECT delivery_number = ndd.delivery_number,
       due_date = FORMAT(ndd.due_date, 'dd/MM/yy'),
       transaction_status = ndd.transaction_status
FROM #next_delivery_dues AS ndd
ORDER BY ndd.due_date ASC;

DROP TABLE #next_delivery_dues;
`;

  const collectionHeaders = await prisma.$queryRaw`
SELECT TOP 5
invoice_number = choi.transaction_header_code,
due_date = FORMAT(ch.date_added, 'dd/MM/yy'),
amount = CASE
             WHEN ch.currency_code = '1' THEN
                 'L.L. '
             WHEN ch.currency_code = '2' THEN
                 '$ '
             ELSE
                 ch.currency_code + ' '
         END + FORMAT(ch.total_amount, 'N2')
FROM dbo.collection_header AS ch
JOIN dbo.collection_header_open_invoice AS choi
 ON choi.collection_header_id = ch.collection_header_id
WHERE ch.is_active = 1 and ch.[client_code] = ${user.code}
ORDER BY ch.date_added DESC;
`;
  const openInvoice = await prisma.$queryRaw`
SELECT TOP 1
payment_amount = CASE
                     WHEN ch.currency_code = '1' THEN
                         'L.L. '
                     WHEN ch.currency_code = '2' THEN
                         '$ '
                     ELSE
                         ch.currency_code + ' '
                 END + FORMAT(ch.total_amount, 'N2'),
paid_for = choi.transaction_header_code,
payment_on = FORMAT(ch.date_added, 'dd MMM yyyy'),
payment_type = CASE
                   WHEN cb.Payment_type = 2 THEN
                       'CASH'
                   ELSE
                       'CHEQUE- ' + cb.check_serial_number + ' [bank: ' + b.description + ']'
               END
FROM dbo.collection_header AS ch
JOIN dbo.collection_header_open_invoice AS choi
 ON choi.collection_header_id = ch.collection_header_id
JOIN dbo.collection_body AS cb
 ON cb.collection_header_id = ch.collection_header_id
LEFT JOIN dbo.bank AS b
 ON b.bank_code = cb.bank_code
 WHERE ch.is_active = 1 and ch.[client_code] = ${user.code}
ORDER BY ch.date_added DESC;
`;
  const transaction_header = await prisma.$queryRaw`
SELECT TOP 1
order_amount = ISNULL(   CASE
                             WHEN th.currency_code = '1' THEN
                                 'L.L. '
                             WHEN th.currency_code = '2' THEN
                                 '$ '
                             ELSE
                                 th.currency_code + ' '
                         END + FORMAT(th.total_amount, 'N2'),
                         '0'
                     ),
order_code = ISNULL(th.transaction_header_code, '[N/A]'),
placed_on = FORMAT(v.visit_date, 'dd MMM yyyy'),
sales_rep = u.description,
next_planned_visit = ISNULL(FORMAT(DATEADD(MONTH, 1, GETDATE()), 'dd MMM yyyy'), '[N/A]')
FROM dbo.visit AS v
JOIN dbo.[user] AS u
 ON u.user_code = v.user_code
INNER JOIN dbo.transaction_header AS th
 ON th.visit_id = v.visit_id
    AND th.transaction_type = 4
    AND th.is_active = 1
    WHERE th.destination_code = ${user.code}
  order by v.visit_date desc
`;
  const productsByCategory = await prisma.$queryRaw`
DECLARE @today DATE = GETDATE(),
        @attribute_code NVARCHAR(50) = 'Activité';
SELECT category = av.description,
val = CONVERT(DECIMAL(18, 2), SUM(tb.approved_quantity * 8.2))
FROM dbo.transaction_header AS th
JOIN dbo.transaction_body AS tb
 ON tb.transaction_header_id = th.transaction_header_id
JOIN dbo.item AS i
 ON i.item_code = tb.item_code
JOIN dbo.attribute_value_entity AS ave
 ON ave.entity_code = i.item_code
JOIN dbo.attribute_value AS av
 ON av.attribute_value_code = ave.attribute_value_code
WHERE th.is_active = 1
AND th.transaction_status NOT IN ( 9, 10 )
AND th.transaction_type = 4
AND th.destination_code = ${user.code}
AND CONVERT(DATE, th.date_added)
BETWEEN DATEADD(MONTH, -12, @today) AND @today
AND tb.is_active = 1
AND tb.approved_quantity > 0
AND i.is_active = 1
AND i.status = 1
AND ave.is_active = 1
AND av.is_active = 1
AND av.attribute_code = @attribute_code
GROUP BY av.description;
`;
  const productSales = await prisma.$queryRaw`
  DECLARE @login_code NVARCHAR(50) = ${user.code},
  @default_days INT = 90,
  @today DATETIME = GETDATE();

SELECT TOP 10
 i.item_code,
 item = i.description,
 current_qty = SUM(tb.approved_quantity)
INTO #top5Products
FROM dbo.transaction_header AS th
JOIN dbo.transaction_body AS tb
  ON tb.transaction_header_id = th.transaction_header_id
JOIN dbo.item AS i
  ON i.item_code = tb.item_code
WHERE th.is_active = 1
AND th.transaction_status NOT IN ( 9, 10 )
AND th.transaction_type = 4
AND th.destination_code = @login_code
AND CONVERT(DATE, th.date_added)
BETWEEN DATEADD(DAY, -@default_days, @today) AND @today
AND tb.is_active = 1
AND tb.approved_quantity > 0
AND i.is_active = 1
AND i.status = 1
GROUP BY i.item_code,
   i.description
ORDER BY SUM(tb.total_final_price) DESC;



SELECT tp.item,
 old_quantity = SUM(ISNULL(tb.approved_quantity, 0))
INTO #previousTop5Products
FROM #top5Products AS tp
INNER JOIN dbo.transaction_body AS tb
  ON tb.item_code = tp.item_code
INNER JOIN dbo.transaction_header AS th
  ON th.transaction_header_id = tb.transaction_header_id
     AND th.is_active = 1
     AND th.transaction_status NOT IN ( 9, 10 )
     AND th.transaction_type = 4
     AND th.destination_code = @login_code
     AND CONVERT(DATE, th.date_added)
     BETWEEN DATEADD(MONTH, -1, DATEADD(DAY, -@default_days, @today)) AND DATEADD(MONTH, -1, @today)
     AND tb.is_active = 1
     AND tb.approved_quantity > 0
GROUP BY tp.item;


SELECT item = tp.item,
 sold_quantity = tp.current_qty,
 variation = CASE
                 WHEN ISNULL(ptp.old_quantity, 0) = 0 THEN
                     CONVERT(DECIMAL(18, 1), 0)
                 ELSE
                     CONVERT(
                                DECIMAL(18, 1),
                                ((tp.current_qty - ISNULL(ptp.old_quantity, 0)) * 100.0)
                                / ISNULL(ptp.old_quantity, 0)
                            )
             END,
 image_url = i.base_path + '/' + i.folder_path + '/' + i.physical_file_name
FROM #top5Products AS tp
LEFT JOIN #previousTop5Products AS ptp
  ON ptp.item = tp.item
LEFT JOIN dbo.image AS i
  ON i.owner_code = tp.item_code
     AND i.is_active = 1
     AND i.owner_type = 1
ORDER BY tp.current_qty DESC;



DROP TABLE #top5Products,
     #previousTop5Products;
`;
  //   const seasonalVariation = await prisma.$queryRaw`
  //   SELECT month_number = MONTH(th.date_added),
  //   [month] = FORMAT(th.date_added, 'MMM'),
  //   TotalSales = SUM(tb.approved_quantity)
  // INTO #sales
  // FROM dbo.transaction_header AS th
  // INNER JOIN dbo.transaction_body AS tb
  //    ON tb.transaction_header_id = th.transaction_header_id
  // WHERE th.transaction_type IN ( 4 )
  //  AND th.is_active = 1
  //  AND YEAR(th.date_added) = YEAR(GETDATE())
  //  AND tb.is_active = 1
  //  AND tb.approved_quantity > 0
  //  AND th.destination_code = ${user.code}
  // GROUP BY MONTH(th.date_added),
  //     FORMAT(th.date_added, 'MMM');

  // SELECT month_number = MONTH(th.date_added),
  //   [month] = FORMAT(th.date_added, 'MMM'),
  //   TotalReturns = SUM(tb.approved_quantity)
  // INTO #returns
  // FROM dbo.transaction_header AS th
  // INNER JOIN dbo.transaction_body AS tb
  //    ON tb.transaction_header_id = th.transaction_header_id
  // WHERE th.transaction_type IN ( 58, 40 )
  //  AND th.is_active = 1
  //  AND YEAR(th.date_added) = YEAR(GETDATE())
  //  AND tb.is_active = 1
  //  AND tb.approved_quantity > 0
  //  AND th.source_code = ${user.code}
  // GROUP BY MONTH(th.date_added),
  //     FORMAT(th.date_added, 'MMM');

  // SELECT s.month_number,
  //   s.month,
  //   s.TotalSales,
  //   TotalReturns = ISNULL(r.TotalReturns, 0)
  //   into #sales_ordered
  // FROM #sales AS s
  // LEFT JOIN #returns AS r
  //    ON r.month_number = s.month_number

  // select month, TotalSales, TotalReturns from #sales_ordered
  // ORDER BY month_number;

  // DROP TABLE #returns,
  //       #sales,#sales_ordered;

  //                      `;
  const seasonalVariation = await prisma.$queryRaw`
SELECT month_number = MONTH(th.date_added),
  [month] = FORMAT(th.date_added, 'MMM'),
  TotalSales = SUM(tb.approved_quantity)
INTO #sales
FROM dbo.transaction_header AS th
INNER JOIN dbo.transaction_body AS tb
   ON tb.transaction_header_id = th.transaction_header_id
WHERE th.transaction_type IN ( 4 )
 AND th.is_active = 1
 AND YEAR(th.date_added) = YEAR(GETDATE())
 AND tb.is_active = 1
 AND tb.approved_quantity > 0
 AND th.destination_code = ${user.code}
GROUP BY MONTH(th.date_added),
    FORMAT(th.date_added, 'MMM');

SELECT month_number = MONTH(th.date_added),
  [month] = FORMAT(th.date_added, 'MMM'),
  TotalReturns = SUM(tb.approved_quantity)
INTO #returns
FROM dbo.transaction_header AS th
INNER JOIN dbo.transaction_body AS tb
   ON tb.transaction_header_id = th.transaction_header_id
WHERE th.transaction_type IN ( 58, 40 )
 AND th.is_active = 1
 AND YEAR(th.date_added) = YEAR(GETDATE())
 AND tb.is_active = 1
 AND tb.approved_quantity > 0
 AND th.source_code = ${user.code}
GROUP BY MONTH(th.date_added),
    FORMAT(th.date_added, 'MMM');


SELECT s.month_number,
  s.month,
  s.TotalSales,
  TotalReturns = ISNULL(r.TotalReturns, 0)
  into #sales_ordered
FROM #sales AS s
LEFT JOIN #returns AS r
   ON r.month_number = s.month_number

select month, TotalSales, TotalReturns from #sales_ordered
ORDER BY month_number;


DROP TABLE #returns,
      #sales,#sales_ordered;
`;
  // Combine the results
  const combinedResults = {
    stats: stats[0],
    recentOrders: recentOrders,
    nextDeliveryDues: nextDeliveryDues,
    collectionHeaders: collectionHeaders,
    openInvoice: openInvoice[0],
    transaction_header: transaction_header[0],
    productsByCategory: productsByCategory,
    productSales: productSales,
    seasonalVariation: seasonalVariation,
  };

  return combinedResults;
};

export { getSideBarMenu, getDashboardData };
