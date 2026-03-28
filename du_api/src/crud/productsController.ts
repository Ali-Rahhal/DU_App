import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

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
  stock: number;
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
  onPromotionOnly,
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
  onPromotionOnly?: boolean;
}) => {
  const favoriteFilter = user_id
    ? Prisma.sql`
      (select convert(bit, 1) from favorite_items where account_id = ${user_id} and item_code = i.item_code)`
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

  const promotionOnlyFilter = onPromotionOnly
    ? Prisma.sql`AND EXISTS (
      SELECT 1
      FROM promotion_condition pc
      LEFT JOIN promotion p ON p.promotion_id = pc.promotion_id
      WHERE pc.condition_type = 1
      AND pc.condition_type_code = it.item_code
      AND p.start_date <= GETDATE()
      AND p.end_date >= GETDATE()
    )`
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
    ${priceFilter}
    ${promotionOnlyFilter}
  `;
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
      iu.barcode,
      i.stock
    FROM
      (SELECT DISTINCT it.*, ipl.price, ipl.default_discount, cat = vi.[Category], sub_cat = [SubCategory], cat_code = vi.[CategoryCode], 
        currency_code= ipl.currency_code, stock = wcs.quantity 
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
      ${promotionOnlyFilter}
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
      stock: item.stock ? Number(item.stock) : null,
      images: images,
      image: images[0],
      tags: [item.category, item.subCategory],
    };
  });

  // console.log(finalResult);
  return { items_count: count[0].count, products: finalResult };
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
  i.stock
FROM
(SELECT DISTINCT it.*, ipl.price, ipl.default_discount, cat = vi.[Category], sub_cat = [SubCategory], cat_code = vi.[CategoryCode], 
  currency_code= ipl.currency_code , stock = wcs.quantity
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

export { getProducts, getProductInfo };
