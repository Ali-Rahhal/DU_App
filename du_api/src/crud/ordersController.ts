import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

const placeOrder = async (userID: number) => {
  //1=cash, 2=cards ,3=crypto,
  const userDetail = await prisma.web_accounts.findFirst({
    where: {
      id: userID,
      is_active: true,
    },
  });
  if (!userDetail) throw new Error("User not found");
  if (userDetail.is_blocked) throw new Error("User is blocked");
  if (!userDetail.is_verified) throw new Error("User is not verified");

  //payment.type === 1 Credit 2 cash
  const result = await prisma.$queryRaw`
  DECLARE @output_err_code INT,
        @output_err_msg NVARCHAR(4000),
        @output_transaction_header_id BIGINT;
        EXEC dbo.GENERATE_WEB_SALES_INVOICE @account_id = ${userID},                                     -- int
                                    @payment_type = ${1},                                                -- int
                                    @notes = N'',                                                        -- nvarchar(250)
                                    @output_err_code = @output_err_code OUTPUT,                          -- int
                                    @output_err_msg = @output_err_msg OUTPUT,                            -- nvarchar(4000)
                                    @output_transaction_header_id = @output_transaction_header_id OUTPUT -- bigint
        SELECT @output_err_code as code, @output_err_msg as message, @output_transaction_header_id as transaction_header_id
  `;

  if (result[0].code !== 0) throw new Error(result[0].message);
  const transaction_header_id = result[0].transaction_header_id;

  // const trans = await prisma.transaction_header.findFirst({
  //   where: {
  //     transaction_header_id: transaction_header_id,
  //   },
  // });

  return { transaction_header_id };
};
const getUserOrders = async (userId: number, search: string) => {
  // const user = await prisma.web_accounts.findFirst({
  //   where: {
  //     id: userId,
  //   },
  // });
  // if (!user) throw new Error("User not found");
  const searchFilter = search
    ? Prisma.sql`AND th.transaction_header_code LIKE ${`${search}%`}`
    : Prisma.empty;

  let res: any = await prisma.$queryRaw`
  DECLARE @TRX_TYPE INT = 3;

  SELECT id = th.transaction_header_id,
         orderNb = th.transaction_header_code,
         creationDate = th.date_added,
         account = ISNULL(wa.description, th.destination_code),
         [status]= th.transaction_status,
         [status_text] = CASE
                        WHEN th.transaction_status = 3 THEN
                            'Awaiting Approval'
                        WHEN th.transaction_status = 4 THEN
                            'Awaiting Delivery'
                        WHEN th.transaction_status = 8 THEN
                            'Delivered'
                        ELSE
                            'Rejected'
                    END,
         phone = wa.phone,
         brand = th.item_brand_code,
         brand_description= ib.description,
         items = (SELECT COUNT(*) FROM transaction_body WHERE transaction_header_id = th.transaction_header_id),
         th.currency_code,
         th.total_amount,
         lastEdited = th.last_edited,
         paymentType = th.expected_payment_type,
         totalAmount = th.total_amount - ISNULL(th.added_price, 0),
     status=th.transaction_status
  FROM dbo.transaction_header AS th
      INNER JOIN dbo.web_accounts AS wa
          ON wa.code = th.source_code
     LEFT Join item_brand as ib
          on ib.item_brand_code=th.item_brand_code
  WHERE th.transaction_type = @TRX_TYPE
        AND th.is_active = 1
        AND wa.id = ${userId}
        ${searchFilter}
        order by th.date_added desc

          `;

  return res;
};
const getUserOrder = async (order_id: number, userId: number) => {
  let res: any = await prisma.$queryRaw`
  DECLARE @TRX_TYPE INT = 3;

  SELECT id = th.transaction_header_id,
         orderNb = th.transaction_header_code,
         creationDate = th.date_added,
         account = ISNULL(wa.description, th.destination_code),
         [status]= th.transaction_status,
         [status_text] = CASE
                        WHEN th.transaction_status = 3 THEN
                            'Awaiting Approval'
                        WHEN th.transaction_status = 4 THEN
                            'Awaiting Delivery'
                        WHEN th.transaction_status = 8 THEN
                            'Delivered'
                        ELSE
                            'Rejected'
                    END,
         phone = vc.Phone,
         address= vc.Address,
         brand = th.item_brand_code,
         brand_description= ib.description,
         items = (SELECT COUNT(*) FROM transaction_body WHERE transaction_header_id = th.transaction_header_id),
         th.currency_code,
         th.total_amount,
         lastEdited = th.last_edited,
         paymentType = th.expected_payment_type,
         totalAmount = th.total_amount - ISNULL(th.added_price, 0),
     status=th.transaction_status
  FROM dbo.transaction_header AS th
      INNER JOIN dbo.web_accounts AS wa
          ON wa.code = th.source_code
     LEFT Join item_brand as ib
          on ib.item_brand_code=th.item_brand_code
      JOIN [v_clients] AS vc
          ON vc.Code = th.source_code
      WHERE th.transaction_type = @TRX_TYPE
        AND th.is_active = 1
        AND wa.id = ${userId}
        AND th.transaction_header_id = ${order_id}
        order by th.date_added desc

          `;
  if (res.length === 0) throw new Error("Order not found");

  return res[0];
};

const getOrderDetails = async (orderId: number, userId: number) => {
  const res: any[] = await prisma.$queryRaw`

  SELECT 
  id = tb.transaction_body_id,
  item_code = tb.item_code,
  name = i.description,
  description = i.alt_description,
  quantity = tb.approved_quantity,
  price = tb.item_default_price,
  currency_code = tb.currency_code,
  discount = tb.promotion_discount_percentage,
  discountedPrice = tb.total_final_price,
  ISNULL(
      (
          SELECT STRING_AGG(ISNULL(img.base_path + '/' + img.folder_path + '/' + img.physical_file_name, N''), ',')
          FROM dbo.image AS img
          WHERE img.owner_code = tb.item_code AND img.owner_type = 1 AND img.is_active = 1 AND img.is_uploaded = 1
      ), N''
  ) as images
FROM 
  dbo.transaction_body AS tb
  
INNER JOIN 
  dbo.item AS i ON i.item_code = tb.item_code
LEFT JOIN 
  dbo.transaction_header AS th ON th.transaction_header_id = tb.transaction_header_id
  LEFT JOIN 
  dbo.web_accounts AS wa ON wa.code = th.source_code
WHERE 
  tb.transaction_header_id = ${orderId}
  AND tb.is_active = 1
  AND wa.id = ${userId};
`;
  if (!res || res.length === 0) throw new Error("Order not found");
  const finalResult = res.map((item) => {
    const images = item.images.split(",");
    return {
      ...item,
      images: images,
      image: images[0],
    };
  });

  return finalResult;
};
const getOpenInvoices = async (userId: number) => {
  const res: any = await prisma.$queryRaw`
  SELECT order_no = transaction_header_code,
  invoice_date = CONVERT(DATE, oi.invoice_date),
  due_date = CONVERT(DATE, oi.due_date),
  currency = CASE
                 WHEN oi.currency_code = '1' THEN
                     'L.L.'
                 WHEN oi.currency_code = '2' THEN
                     'USD'
                 ELSE
                 oi.currency_code
             END,
  order_amount = oi.invoice_amount,
  remaining_amount = oi.remaining_amount
FROM dbo.open_invoice as oi
JOIN web_accounts AS wa on wa.code = client_code
WHERE oi.is_active = 1
 AND wa.id = ${userId}
 AND ABS(oi.remaining_amount) > 1
ORDER BY oi.date_added DESC;
`;
  return res;
};
const getInvoices = async (userId: number) => {
  const res: any = await prisma.$queryRaw`
  SELECT invoice_no = th.transaction_header_code,
       oracle_number = th.erp_transaction_header_code,
       cat = th.item_brand_code,
       date_added = CONVERT(DATE, th.date_added),
       total_amount = th.total_amount,
        currency = CASE
                       WHEN th.currency_code = '1' THEN
                           'L.L.'
                       WHEN th.currency_code = '2' THEN
                           'USD'
                       ELSE
                       th.currency_code
                   END,
        is_paid = CASE
                   WHEN ISNULL(oi.remaining_amount, 0) = 0 THEN
                       'yes'
                   WHEN ISNULL(oi.remaining_amount, 0) = th.total_amount THEN
                       'no'
                   ELSE
                       'partial'
               END,
       remaining_amount = ISNULL(oi.remaining_amount, 0)
FROM dbo.transaction_header AS th
    LEFT JOIN dbo.open_invoice AS oi
        ON oi.transaction_header_code = th.transaction_header_code
        JOIN web_accounts AS wa on wa.code = th.destination_code
WHERE th.transaction_type = 4
      AND th.is_active = 1
      AND wa.id = ${userId}
      AND th.transaction_status = 12;
      `;
  return res;
};

const getInvoiceDetails = async (invoice_no: string, userId: number) => {
  const res: any = await prisma.$queryRaw`
    SELECT invoice_no = th.transaction_header_code,
       oracle_number = th.erp_transaction_header_code,
       cat = th.item_brand_code,
       date_added = CONVERT(DATE, th.date_added),
       total_amount = th.total_amount,
	   sales_person = sp.description,
	   customer_name= vc.Description,
      customer_no = vc.Code,
	   tel = vc.Phone,
	   region = vc.Region,
	   [address] =  vc.Address,
        currency = CASE
                       WHEN th.currency_code = '1' THEN
                           'L.L.'
                       WHEN th.currency_code = '2' THEN
                           'USD'
                       ELSE
                       th.currency_code
                   END,
	   delivery_date = th.expected_payment_date,
       remaining_amount = ISNULL(oi.remaining_amount, 0)
FROM dbo.transaction_header AS th
    LEFT JOIN dbo.open_invoice AS oi
        ON oi.transaction_header_code = th.transaction_header_code
	LEFT JOIN dbo.[user] sp on th.user_code = sp.user_code
	LEFT JOIN dbo.v_clients vc on vc.Code = th.destination_code
      JOIN web_accounts AS wa on wa.code = th.destination_code
WHERE th.transaction_type = 4
      AND th.is_active = 1
	  AND th.transaction_header_code = ${invoice_no}
       AND wa.id = ${userId}
      AND th.transaction_status = 12;
      `;
  if (res.length === 0) throw new Error("Invoice not found");

  const lines: any = await prisma.$queryRaw`
select 
	  [no]=i.item_code,
	  [description]=i.description,
	  unit= tb.uom_code,
	  qty=tb.approved_quantity,
	  unit_price=tb.item_default_price,
	  amount = tb.total_final_price,
	  discount= tb.total_final_discount
	  from transaction_body  tb
	  JOIN transaction_header th on th.transaction_header_id = tb.transaction_header_id
	  JOIN item i on i.item_code=tb.item_code
	  where transaction_header_code=${invoice_no}
    `;
  return { ...res[0], lines: lines };
};

export {
  placeOrder,
  getUserOrders,
  getOrderDetails,
  getUserOrder,
  getOpenInvoices,
  getInvoices,
  getInvoiceDetails,
};
