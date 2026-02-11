import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { ensureChildAccountPermission } from "../lib/utils";

// import { createSession } from "./BOBPaymentIntegration";

//item example
// {
//     id: 1,
//     name: "Rey Nylon Backpack",
//     description: "Brown cockroach wings",
//     price: 74,
//     image: "http://141.95.59.229/images/I00000/1706527442746.jpeg",
//     category: "Category 1",
//     tags: ["tag1", "tag2"],
//     link: "/product-detail/",
//     //variants: DEMO_VARIANTS,
//     variantType: "image",
//     sizes: [],

//     status: "New in",
//     discountedPrice: 50,

type Product = {
  item_code: string;
  name: string;
  description: string;
  creation_date: string;
  price: string;
  discountedPrice: string;
  isFavorite: boolean;
  images: string;
  category: string;
  subCategory: string;
  cat_code: string;
  sub_cat_code: string;
  barcode: string;
};
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
const getProducts = async ({
  take,
  skip,
  category_code,
  sort_by,
  sort_direction,
  show_only_best_deals,
  min_price,
  max_price,
  user_id,
  search,
}: {
  take?: number;
  skip?: number;
  category_code?: string[];
  sort_by?: string;
  sort_direction?: string;
  show_only_best_deals?: boolean;
  min_price?: string;
  max_price?: string;
  user_id?: number;
  search?: string;
}) => {
  const favoriteFilter = user_id
    ? Prisma.sql`
  (select convert(bit, 1) from favorite_items where account_id = ${user_id} and item_code = i.item_code)
  `
    : Prisma.sql`convert(bit, 0)`;
  const categoryFilter =
    category_code.length > 0
      ? Prisma.sql`AND vi.[CategoryCode] IN (${Prisma.join(category_code)})`
      : Prisma.empty;

  const iplFilter = show_only_best_deals
    ? Prisma.sql`AND ipl.default_discount > 0`
    : Prisma.empty;
  const searchFilter = search
    ? Prisma.sql`AND it.description LIKE ${`%${search}%`}`
    : Prisma.empty;
  // const priceFilter = Prisma.sql`AND ipl.price BETWEEN ${
  //   min_price ? min_price : 0
  // } AND ${max_price ? max_price : 100000}`;
  const priceFilter =
    min_price && max_price
      ? Prisma.sql`AND ipl.price BETWEEN ${min_price} AND ${max_price}`
      : Prisma.empty;
  // const hasPromotion = Prisma.sql`
  // (select top 1 convert(bit, 1) as hasPromotion, pc.description as condition_description, pr.description as result_description
  //      from promotion_condition pc
  //     join promotion p  on p.promotion_id = pc.promotion_id
  //     left join promotion_result pr on pr.promotion_id = p.promotion_id
  //     where pc.condition_type = 1 and pc.condition_type_code = i.item_code
  //     and p.start_date  <= getdate()
  //     AND p.end_date >= getdate())`;

  const countQuery = Prisma.sql`SELECT DISTINCT count(*) as count
  FROM item as it
  inner JOIN v_items as vi ON vi.Code = it.item_code
  inner JOIN item_price_list as ipl ON ipl.item_code = it.item_code

  WHERE it.is_active = 1
  AND it.status = 1
  ${searchFilter}
  ${categoryFilter}
  ${iplFilter}
  ${priceFilter}`;
  const count = await prisma.$queryRaw(countQuery);
  // console.log(count);
  //   WITH [active_promotions]  AS
  // (
  //     SELECT DISTINCT pc.condition_type_code,  condition_description=(pc.description),result_description=(pr.description)
  //   FROM promotion_condition pc
  //   LEFT JOIN promotion p  ON p.promotion_id = pc.promotion_id
  //   LEFT join promotion_result pr on pr.promotion_id = p.promotion_id
  //   WHERE pc.condition_type = 1
  //   AND p.start_date  <= getdate()
  //   AND p.end_date >= getdate()
  //   group by pc.condition_type_code, pc.description, pr.description
  // )
  const res: Product[] = await prisma.$queryRaw<Product[]>`
WITH [active_promotions]  AS
( 
    SELECT DISTINCT pc.condition_type_code
  FROM promotion_condition pc
  LEFT JOIN promotion p  ON p.promotion_id = pc.promotion_id
  WHERE pc.condition_type = 1
  AND p.start_date  <= getdate()
  AND p.end_date >= getdate()
  group by pc.condition_type_code
)

    SELECT DISTINCT
      i.item_code,
      i.description as name,
      i.alt_description as description,
      i.date_added as creation_date,
      i.price as price,
      i.default_discount,
      discountedPrice = CASE
        WHEN i.default_discount = 0 THEN NULL
        ELSE CONVERT(DECIMAL(18, 2), i.price - (0.01 * i.default_discount * i.price))
      END,
      isFavorite = ${favoriteFilter},
    hasPromotion = CASE WHEN ap.condition_type_code IS NOT NULL THEN 1 ELSE 0 END,
      ISNULL(
        (
          SELECT STRING_AGG(ISNULL(img.base_path + '/' + img.folder_path + '/' + img.physical_file_name, N''), ',')
          FROM dbo.image AS img
          WHERE img.owner_code = iu.item_code AND img.owner_type = 1 AND img.is_active = 1 AND img.is_uploaded = 1
        ), N''
      ) as images,
      i.cat as category,
      i.cat_code,
      i.currency_code ,
      iu.barcode
    FROM
      (SELECT DISTINCT it.*, ipl.price, ipl.default_discount, cat = vi.[Category], sub_cat = [SubCategory], cat_code = vi.[CategoryCode], 
        currency_code= ipl.currency_code 
       FROM item as it
       LEFT JOIN v_items as vi ON vi.Code = it.item_code
       LEFT JOIN item_price_list as ipl ON ipl.item_code = it.item_code 
       LEFT JOIN dbo.warehouse_current_stock AS wcs ON wcs.item_code = it.item_code
       WHERE ipl.is_active=1 AND it.is_active = 1 
       AND  it.status = 1 AND  ipl.is_active = 1 
       --AND wcs.is_active = 1
       --AND wcs.quantity > 0
       ${categoryFilter}
       ${iplFilter}
       ${priceFilter}
        ${searchFilter}
       ORDER BY date_added DESC
       OFFSET ${skip} ROWS FETCH NEXT ${take} ROWS ONLY
      ) as i
    JOIN dbo.item_uom AS iu ON iu.item_code = i.item_code
    left join active_promotions as ap on ap.condition_type_code = i.item_code
    WHERE
      iu.is_active = 1

    ORDER BY
      i.item_code;
  `;

  const finalResult = res.map((item) => {
    const images = item.images.split(",");
    return {
      ...item,
      images: images,
      image: images[0],
      tags: [item.category, item.subCategory],
    };
  });

  // console.log(finalResult);
  return { items_count: count[0].count, products: finalResult };
};

const getItemsDetail = async (item_codes: string[]) => {
  const res: any = await prisma.$queryRaw`
  SELECT  iu.item_code,
  name = i.description,
  barcode = iu.barcode,
  description = i.alt_description,
  currency_code = ipl.currency_code,
  ISNULL(
    (
      SELECT STRING_AGG(ISNULL(img.base_path + '/' + img.folder_path + '/' + img.physical_file_name, N''), ',')
      FROM dbo.image AS img
      WHERE img.owner_code = iu.item_code AND img.owner_type = 1 AND img.is_active = 1 AND img.is_uploaded = 1
    ), N''
  ) as images,
  price = CONVERT(DECIMAL(18, 2), ipl.price),
  discountedPrice = CASE
  WHEN ipl.default_discount = 0 THEN NULL
  ELSE CONVERT(DECIMAL(18, 2), ipl.price - (0.01 * ipl.default_discount * ipl.price))
END
FROM dbo.item_uom AS iu
JOIN dbo.item AS i
   ON i.item_code = iu.item_code
JOIN dbo.item_price_list AS ipl
   ON ipl.item_code = iu.item_code 
WHERE i.item_code IN (${Prisma.join(item_codes)})
 AND iu.is_active = 1
 AND ipl.is_active = 1

GROUP BY iu.item_code,
    i.description,
    iu.barcode,
    i.alt_description,
    ipl.price,
    ipl.default_discount,
    ipl.currency_code
    `;

  const finalResult = res.map((item) => {
    const images = item.images.split(",");
    return {
      ...item,
      images: images,
      image: images[0],
      tags: [item.category, item.subCategory],
    };
  });

  return { items_count: finalResult.length, products: finalResult };
};
const getProductInfo = async (item_code: string, user_id: number | null) => {
  const favoriteFilter = user_id
    ? Prisma.sql`
(select convert(bit, 1) from favorite_items where account_id = ${user_id} and item_code = i.item_code)
`
    : Prisma.sql`convert(bit, 0)`;

  const hasPromotion = Prisma.sql`(select top 1 convert(bit, 1) from promotion_condition pc
    join promotion p  on p.promotion_id = pc.promotion_id
    where pc.condition_type = 1 and pc.condition_type_code = i.item_code 
    and p.start_date  <= getdate()
          AND p.end_date >= getdate())`;

  const res: Product[] = await prisma.$queryRaw<Product[]>`
  SELECT
  TOP 1
  i.item_code,
  i.description as name,
  i.alt_description as description,
  i.date_added as creation_date,
  i.price as price,
  i.default_discount,
  discountedPrice = CASE
    WHEN i.default_discount = 0 THEN NULL
    ELSE CONVERT(DECIMAL(18, 2), i.price - (0.01 * i.default_discount * i.price))
  END,
  isFavorite = ${favoriteFilter},
  hasPromotion = ${hasPromotion},
  ISNULL(
    (
      SELECT STRING_AGG(ISNULL(img.base_path + '/' + img.folder_path + '/' + img.physical_file_name, N''), ',')
      FROM dbo.image AS img
      WHERE img.owner_code = iu.item_code AND img.owner_type = 1 AND img.is_active = 1 AND img.is_uploaded = 1
    ), N''
  ) as images,
  i.cat as category,
  i.cat_code,
  i.currency_code ,
  iu.barcode,
  i.quantity as stock
FROM
(SELECT DISTINCT it.*, ipl.price, ipl.default_discount, cat = vi.[Category], sub_cat = [SubCategory], cat_code = vi.[CategoryCode], 
  currency_code= ipl.currency_code ,wcs.quantity
 FROM item as it
       LEFT JOIN v_items as vi ON vi.Code = it.item_code
       LEFT JOIN item_price_list as ipl ON ipl.item_code = it.item_code 
       LEFT JOIN dbo.warehouse_current_stock AS wcs ON wcs.item_code = it.item_code
WHERE ipl.is_active=1 AND it.is_active = 1 AND  it.status = 1 AND  ipl.is_active = 1 
-- AND wcs.is_active = 1 
-- AND wcs.quantity > 0
       AND it.item_code = ${item_code} 
      
      ) as i
    JOIN dbo.item_uom AS iu ON iu.item_code = i.item_code
    WHERE
      iu.is_active = 1
   
    ORDER BY
      i.item_code;
  `;
  const finalResult = res.map((item) => {
    const images = item.images.split(",");
    return {
      ...item,
      images: images,
      image: images[0],
      tags: [item.category, item.subCategory],
    };
  });

  return finalResult[0];
};

const addItemToFavorite = async (userId: number, itemCode: string) => {
  const found = await prisma.favorite_items.findFirst({
    where: {
      account_id: userId,
      item_code: itemCode,
    },
    select: {
      item_code: true,
    },
  });
  if (found) return found;
  const result = await prisma.favorite_items.create({
    data: {
      account_id: userId,
      item_code: itemCode,
      date_added: new Date(),
    },
    select: {
      item_code: true,
    },
  });
  console.log(result);
  return result;
};
const removeItemFromFavorite = async (userId: number, itemCode: string) => {
  const result = await prisma.favorite_items.deleteMany({
    where: {
      account_id: userId,
      item_code: itemCode,
    },
  });
  return result;
};
const getFavoriteItems = async (
  userId: number,
  {
    take,
    skip,
  }: {
    take?: number;
    skip?: number;
  },
) => {
  const count = await prisma.favorite_items.count({
    where: {
      account_id: userId,
    },
  });
  const favoriteFilter = userId
    ? Prisma.sql`
(select convert(bit, 1) from favorite_items where account_id = ${userId} and item_code = i.item_code)
`
    : Prisma.sql`convert(bit, 0)`;

  const res: any = await prisma.$queryRaw`
   SELECT
     i.item_code,
     i.description as name,

     i.alt_description as description,
     i.date_added as creation_date,
     i.price as price,
     i.default_discount,
     discountedPrice = CASE
       WHEN i.default_discount = 0 THEN NULL
       ELSE CONVERT(DECIMAL(18, 2), i.price - (0.01 * i.default_discount * i.price))
     END,
     isFavorite = ${favoriteFilter},
     ISNULL(
       (
         SELECT STRING_AGG(ISNULL(img.base_path + '/' + img.folder_path + '/' + img.physical_file_name, N''), ',')
         FROM dbo.image AS img
         WHERE img.owner_code = iu.item_code AND img.owner_type = 1 AND img.is_active = 1 AND img.is_uploaded = 1
       ), N''
     ) as images,
     i.cat as category,
     i.cat_code,
     iu.barcode
   FROM
     (SELECT DISTINCT it.*, ipl.price, ipl.default_discount, cat = vi.[Category],  cat_code = vi.[CategoryCode]
      FROM item as it
      LEFT JOIN v_items as vi ON vi.Code = it.item_code
      LEFT JOIN item_price_list as ipl ON ipl.item_code = it.item_code
      RIGHT JOIN favorite_items as fi ON fi.item_code = it.item_code
      WHERE ipl.is_active=1 AND it.is_active = 1 AND  it.status = 1 AND  ipl.is_active = 1
      AND fi.account_id = ${userId}
      ORDER BY date_added DESC
      OFFSET ${skip} ROWS FETCH NEXT ${take} ROWS ONLY
     ) as i
   JOIN dbo.item_uom AS iu ON iu.item_code = i.item_code
   LEFT JOIN dbo.warehouse_current_stock AS wcs ON wcs.item_code = iu.item_code
   WHERE
     iu.is_active = 1

    -- AND wcs.is_active = 1
    -- AND wcs.quantity > 0
   ORDER BY
     i.item_code;
     `;
  const finalResult = res.map((item) => {
    const images = item.images.split(",");
    return {
      ...item,
      images: images,
      image: images[0],
      tags: [item.category, item.subCategory],
    };
  });

  return { items_count: count, products: finalResult };
};
const checkStock = async (itemCode: string) => {
  const result = await prisma.$queryRaw`
  SELECT
  quantity = SUM(wcs.quantity)
FROM
  dbo.warehouse_current_stock AS wcs
WHERE
  wcs.item_code = ${itemCode}
  AND wcs.is_active = 1;`;
  // and wcs.quantity > wcs.[minimum_stock_quantity]
  return result[0].quantity;
};
const addItemToCart = async (
  userId: number,
  itemCode: string,
  barcode: string,
  quantity: number,
) => {
  // const cart: any = await prisma.$queryRaw`
  // SELECT TOP 1 c.item_code,
  // category = iv.[CategoryCode]
  // FROM dbo.shopping_cart as c
  // LEFT JOIN dbo.item_uom as iu ON iu.item_code = c.item_code
  // LEFT JOIN dbo.v_items as iv ON iv.Code = iu.item_code
  // WHERE c.account_id = ${userId}
  // and iu.uom_code = 'PQ'
  // `;
  // if (cart.length > 0 && cart[0]) {
  //   const item = await prisma.$queryRaw`
  //   SELECT TOP 1 iu.item_code,
  //   category = vi.[CategoryCode]
  //   from dbo.item_uom as iu
  //   LEFT JOIN dbo.v_items as vi ON vi.Code = iu.item_code
  //   WHERE iu.item_code = ${itemCode} and iu.uom_code = 'PQ'
  //   `;
  //   if (item[0].category !== cart[0].category) {
  //     throw new Error("You can't add items from different categories");
  //   }
  // }

  const result = await prisma.$transaction(async (tx) => {
    let newQuantity = quantity;
    const found = await tx.shopping_cart.findFirst({
      where: {
        account_id: userId,
        item_code: itemCode,
        barcode: barcode,
      },
      select: {
        item_code: true,
        id: true,
        quantity: true,
      },
    });
    if (found) {
      newQuantity += found.quantity;
      // if (newQuantity > 99) throw new Error("Quantity limit exceeded");

      // const stock = await checkStock(itemCode);
      // if (stock < newQuantity) throw new Error("Insufficient stock");

      const updated = await tx.shopping_cart.update({
        where: {
          id: found.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
      return { ...updated, id: updated.id.toString() };
    } else {
      // const stock = await checkStock(itemCode);
      // if (stock < newQuantity) throw new Error("Insufficient stock");
      const result = await tx.shopping_cart.create({
        data: {
          account_id: userId,
          item_code: itemCode,
          barcode: barcode,
          quantity: quantity,
          date_added: new Date(),
          status: 5,
        },
      });
      return { ...result, id: result.id.toString() };
    }
  });
  return { ...result, id: result.id.toString() };
};
const removeItemFromCart = async (userId: number, itemCode: string) => {
  const result = await prisma.shopping_cart.deleteMany({
    where: {
      account_id: userId,
      item_code: itemCode,
    },
  });
  return result;
};
const updateItemInCart = async (
  userId: number,
  itemCode: string,

  quantity: number,
) => {
  const result = await prisma.$transaction(async (tx) => {
    // if (quantity > 99) throw new Error("Quantity limit exceeded");
    const found = await prisma.shopping_cart.findFirst({
      where: {
        account_id: userId,
        item_code: itemCode,
      },
      select: {
        item_code: true,
        id: true,
      },
    });
    if (found) {
      // if (quantity > 99) throw new Error("Quantity limit exceeded");
      const stock = await checkStock(itemCode);
      // if (stock < quantity) throw new Error("Insufficient stock");
      const updated = await prisma.shopping_cart.update({
        where: {
          id: found.id,
        },
        data: {
          quantity: quantity,
        },
      });
      if (!updated) throw new Error("Failed to update cart item");
      return { ...updated, id: updated.id.toString() };
    } else {
      const stock = await checkStock(itemCode);

      // if (stock < quantity) throw new Error("Insufficient stock");
      const result = await prisma.shopping_cart.create({
        data: {
          account_id: userId,
          item_code: itemCode,
          barcode: itemCode,
          quantity: quantity,
          date_added: new Date(),
        },
      });
      return { ...result, id: result.id.toString() };
    }
  });
  return result;
};

const getCartItems = async (
  userId: number,
  {
    take,
    skip,
  }: {
    take?: number;
    skip?: number;
  },
) => {
  const count = await prisma.shopping_cart.count({
    where: {
      account_id: userId,
      status: 5,
    },
  });
  const res: any = await prisma.$queryRaw`
  SELECT  iu.item_code,
  name = i.description,
  barcode = sc.barcode,
  description = i.alt_description,
  currency_code = ipl.currency_code,
  ISNULL(
    (
      SELECT STRING_AGG(ISNULL(img.base_path + '/' + img.folder_path + '/' + img.physical_file_name, N''), ',')
      FROM dbo.image AS img
      WHERE img.owner_code = iu.item_code AND img.owner_type = 1 AND img.is_active = 1 AND img.is_uploaded = 1
    ), N''
  ) as images,
  price = CONVERT(DECIMAL(18, 2), ipl.price),
  discountedPrice = CASE
  WHEN ipl.default_discount = 0 THEN NULL
  ELSE CONVERT(DECIMAL(18, 2), ipl.price - (0.01 * ipl.default_discount * ipl.price))
END,
  quantity = SUM(sc.quantity)
FROM dbo.shopping_cart AS sc
JOIN dbo.item_uom AS iu
   ON iu.barcode = sc.barcode
JOIN dbo.item AS i
   ON i.item_code = iu.item_code
JOIN dbo.item_price_list AS ipl
   ON ipl.item_code = iu.item_code
WHERE sc.account_id = ${userId}
 AND sc.is_active = 1
 AND iu.is_active = 1
 AND ipl.is_active = 1
 AND sc.status = 5

GROUP BY iu.item_code,
    i.description,
    sc.barcode,
    iu.barcode,
    i.alt_description,
    ipl.price,
    ipl.default_discount,
    ipl.currency_code
    `;

  const finalResult = res.map((item) => {
    const images = item.images.split(",");
    return {
      ...item,
      images: images,
      image: images[0],
      tags: [item.category, item.subCategory],
    };
  });

  return { items_count: count, products: finalResult };
};
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
  if (userDetail.type === 2) {
    await ensureChildAccountPermission(userID, "ORDER");
  }

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
  console.log(result);

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
  getProducts,
  getSideBarMenu,
  getProductInfo,
  addItemToFavorite,
  removeItemFromCart,
  addItemToCart,
  getCartItems,
  getFavoriteItems,
  updateItemInCart,
  removeItemFromFavorite,
  placeOrder,
  getUserOrders,
  getOrderDetails,
  getUserOrder,
  getDashboardData,
  getOpenInvoices,
  getInvoices,
  getInvoiceDetails,
  getItemsDetail,
};
