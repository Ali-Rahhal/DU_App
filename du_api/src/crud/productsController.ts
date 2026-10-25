import { Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";
import { getExpiryItemStock, getItemStock } from "../lib/utils";

type Product = {
  item_code: string;
  parent_item_code?: string;
  name: string;
  description: string;
  creation_date: string;
  price: string;
  default_discount?: string;
  discountedPrice: string;
  isFavorite: boolean;
  images: string;
  image?: string;
  category: string;
  cat_code: string;
  sub_cat_code?: string;
  barcode: string;
  stock: number;
  currency_code: string;
  hasPromotion?: boolean;
  tags?: string[];
  // =========================
  // EXPIRY DEAL
  // =========================
  isExpiryDeal?: boolean;
  expiryDiscountPercentage?: number;
  expiryMonthsLeft?: number;
  nearest_expiry_date?: string;
};

const getProducts = async (
  {
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
    containExpiryDealProducts,
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
    containExpiryDealProducts?: boolean;
  },
  companyId: string,
) => {
  const prisma = getPrisma(companyId);
  // =========================
  // FAVORITES
  // =========================

  const favoriteFilter = user_id
    ? Prisma.sql`
      (
        SELECT CONVERT(bit, 1)
        FROM favorite_items
        WHERE account_id = ${user_id}
        AND item_code = it.item_code
      )`
    : Prisma.sql`CONVERT(bit, 0)`;

  // =========================
  // FILTERS
  // =========================

  const categoryFilter =
    category_code?.length > 0
      ? Prisma.sql`
          AND it.brand_code IN (${Prisma.join(category_code)})
        `
      : Prisma.empty;

  const iplFilter = show_only_best_deals
    ? Prisma.sql`AND ipl.default_discount > 0`
    : Prisma.empty;

  const searchFilter = search
    ? Prisma.sql`
        AND it.description LIKE ${`%${search}%`}
      `
    : Prisma.empty;

  const priceFilter =
    min_price && max_price
      ? Prisma.sql`
          AND ipl.price BETWEEN ${min_price} AND ${max_price}
        `
      : Prisma.empty;

  const promotionOnlyFilter = onPromotionOnly
    ? Prisma.sql`
        AND EXISTS (
          SELECT 1
          FROM promotion_condition pc
          LEFT JOIN promotion p
            ON p.promotion_id = pc.promotion_id
          WHERE pc.condition_type = 1
          AND pc.condition_type_code = it.item_code
          AND p.start_date <= GETDATE()
          AND p.end_date >= GETDATE()
        )
      `
    : Prisma.empty;

  // =========================
  // MAIN QUERY
  // =========================
  const products: any[] = await prisma.$queryRaw`
    WITH active_promotions AS
    (
      SELECT DISTINCT pc.condition_type_code
      FROM promotion_condition pc
      LEFT JOIN promotion p
        ON p.promotion_id = pc.promotion_id
      WHERE
        pc.condition_type = 1
        AND p.start_date <= GETDATE()
        AND p.end_date >= GETDATE()
    ),

    normal_products AS
    (
      SELECT
        it.item_code,

        NULL as parent_item_code,

        it.description as name,

        it.alt_description as description,

        it.date_added as creation_date,

        CONVERT(DECIMAL(18,2), ipl.price) as price,

        ipl.default_discount,

        CASE
          WHEN ipl.default_discount = 0 THEN NULL
          ELSE CONVERT(
            DECIMAL(18,2),
            ipl.price - (0.01 * ipl.default_discount * ipl.price)
          )
        END as discountedPrice,

        ${favoriteFilter} as isFavorite,

        CASE
          WHEN ap.condition_type_code IS NOT NULL
          THEN 1
          ELSE 0
        END as hasPromotion,

        ISNULL(
          (
            SELECT STRING_AGG(
              ISNULL(
                img.base_path + '/' +
                img.folder_path + '/' +
                img.physical_file_name,
                N''
              ),
              ','
            )
            FROM dbo.image AS img
            WHERE
              img.owner_code = iu.item_code
              AND img.owner_type = 1
              AND img.is_active = 1
              AND img.is_uploaded = 1
          ),
          N''
        ) as images,

        it.brand_code as category,

        it.brand_code as cat_code,

        ipl.currency_code,

        iu.barcode,

        CONVERT(bit, 0) as isExpiryDeal,

        NULL as expiryDiscountPercentage,

        NULL as nearest_expiry_date

      FROM item it

      CROSS APPLY (
        SELECT TOP 1 *
        FROM item_price_list
        WHERE item_code = it.item_code
          AND is_active = 1
        ORDER BY currency_code ASC
      ) ipl

      CROSS APPLY (
        SELECT TOP 1 *
        FROM item_uom iu
        WHERE iu.item_code = it.item_code
          AND iu.is_active = 1
        ORDER BY
          CASE WHEN iu.uom_code = 'P' THEN 0 ELSE 1 END
      ) iu

      LEFT JOIN active_promotions ap
        ON ap.condition_type_code = it.item_code

      WHERE
        it.is_active = 1
        AND it.status = 1

        ${categoryFilter}
        ${iplFilter}
        ${priceFilter}
        ${searchFilter}
        ${promotionOnlyFilter}
    )

    ${
      containExpiryDealProducts
        ? Prisma.sql`,
          expiry_products AS
          (
            SELECT
              CONCAT(it.item_code, '__expiry') as item_code,

              it.item_code as parent_item_code,

              CONCAT(it.description, ' (Expiry Deal)') as name,

              it.alt_description as description,

              it.date_added as creation_date,

              CONVERT(DECIMAL(18,2), ipl.price) as price,

              ied.discount_percentage as default_discount,

              CONVERT(
                DECIMAL(18,2),
                ipl.price -
                ((ipl.price * ied.discount_percentage) / 100.0)
              ) as discountedPrice,

              CONVERT(bit, 0) as isFavorite,

              CONVERT(bit, 0) as hasPromotion,

              ISNULL(
                (
                  SELECT STRING_AGG(
                    ISNULL(
                      img.base_path + '/' +
                      img.folder_path + '/' +
                      img.physical_file_name,
                      N''
                    ),
                    ','
                  )
                  FROM dbo.image AS img
                  WHERE
                    img.owner_code = iu.item_code
                    AND img.owner_type = 1
                    AND img.is_active = 1
                    AND img.is_uploaded = 1
                ),
                N''
              ) as images,

              it.brand_code as category,

              it.brand_code as cat_code,

              ipl.currency_code,

              iu.barcode,

              CONVERT(bit, 1) as isExpiryDeal,

              ied.discount_percentage as expiryDiscountPercentage,

              MIN(wcsdc.expiry_date) as nearest_expiry_date

            FROM item it

            INNER JOIN item_expiry_deal ied
              ON ied.item_code = it.item_code
              AND ied.is_active = 1

            INNER JOIN warehouse_current_stock_distribution_code wcsdc
              ON wcsdc.item_code = it.item_code

            CROSS APPLY (
              SELECT TOP 1 *
              FROM item_price_list
              WHERE item_code = it.item_code
                AND is_active = 1
              ORDER BY currency_code ASC
            ) ipl
            
            CROSS APPLY (
              SELECT TOP 1 *
              FROM item_uom iu
              WHERE iu.item_code = it.item_code
                AND iu.is_active = 1
              ORDER BY
                CASE WHEN iu.uom_code = 'P' THEN 0 ELSE 1 END
            ) iu

            WHERE
              wcsdc.expiry_date IS NOT NULL
              AND wcsdc.quantity > 0

              AND DATEDIFF(
                MONTH,
                GETDATE(),
                wcsdc.expiry_date
              ) <= ied.expiry_threshold_months

              ${categoryFilter}
              ${searchFilter}
              ${priceFilter}

            GROUP BY
              it.item_code,
              it.description,
              it.alt_description,
              it.date_added,
              ipl.price,
              ied.discount_percentage,
              ipl.currency_code,
              it.brand_code,
              iu.barcode,
              iu.item_code
          )
        `
        : Prisma.empty
    }

    SELECT *
    FROM
    (
      SELECT * FROM normal_products

      ${
        containExpiryDealProducts
          ? Prisma.sql`
            UNION ALL

            SELECT * FROM expiry_products
          `
          : Prisma.empty
      }
    ) base

    ORDER BY creation_date DESC

    OFFSET ${skip} ROWS
    FETCH NEXT ${take} ROWS ONLY
  `;

  // =========================
  // FORMAT PRODUCTS
  // =========================

  const finalProducts: Product[] = await Promise.all(
    products.map(async (item) => {
      const images = item.images?.split(",") || [];

      const stock = item.isExpiryDeal
        ? await getExpiryItemStock(item.parent_item_code, companyId)
        : await getItemStock(item.item_code, companyId);

      return {
        ...item,

        stock,

        images,

        image: images[0],

        tags: [item.category],

        expiryMonthsLeft:
          item.isExpiryDeal && item.nearest_expiry_date
            ? Math.max(
                0,
                Math.ceil(
                  (new Date(item.nearest_expiry_date).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24 * 30),
                ),
              )
            : null,
      };
    }),
  );

  // =========================
  // COUNT
  // =========================

  const items_count = finalProducts.length;

  return {
    items_count,
    products: finalProducts,
  };
};

const getProductInfo = async (
  item_code: string,
  user_id: number | null,
  companyId: string,
  isExpiryDealProduct?: boolean,
) => {
  const prisma = getPrisma(companyId);
  // =========================
  // FAVORITES
  // =========================

  const favoriteFilter = user_id
    ? Prisma.sql`
      (
        SELECT CONVERT(bit, 1)
        FROM favorite_items
        WHERE
          account_id = ${user_id}
          AND item_code = i.item_code
      )
    `
    : Prisma.sql`CONVERT(bit, 0)`;

  // =========================
  // PROMOTIONS
  // =========================

  const hasPromotion = Prisma.sql`
    (
      SELECT TOP 1 CONVERT(bit, 1)
      FROM promotion_condition pc
      JOIN promotion p
        ON p.promotion_id = pc.promotion_id
      WHERE
        pc.condition_type = 1
        AND pc.condition_type_code = i.item_code
        AND p.start_date <= GETDATE()
        AND p.end_date >= GETDATE()
    )
  `;

  // =========================
  // NORMAL PRODUCT
  // =========================

  if (!isExpiryDealProduct) {
    const res: Product[] = await prisma.$queryRaw<Product[]>`
      SELECT TOP 1
        i.item_code,

        i.description as name,

        i.alt_description as description,

        i.date_added as creation_date,

        i.price as price,

        i.default_discount,

        discountedPrice =
          CASE
            WHEN i.default_discount = 0 THEN NULL
            ELSE CONVERT(
              DECIMAL(18, 2),
              i.price - (0.01 * i.default_discount * i.price)
            )
          END,

        isFavorite = ${favoriteFilter},

        hasPromotion = ${hasPromotion},

        ISNULL
        (
          (
            SELECT STRING_AGG
            (
              ISNULL
              (
                img.base_path + '/' +
                img.folder_path + '/' +
                img.physical_file_name,
                N''
              ),
              ','
            )
            FROM dbo.image AS img
            WHERE
              img.owner_code = iu.item_code
              AND img.owner_type = 1
              AND img.is_active = 1
              AND img.is_uploaded = 1
          ),
          N''
        ) as images,

        i.cat as category,

        i.cat_code,

        i.currency_code,

        iu.barcode

      FROM
      (
        SELECT DISTINCT
          it.*,

          ipl.price,

          ipl.default_discount,

          cat = it.brand_code,

          cat_code = it.brand_code,

          currency_code = ipl.currency_code

        FROM item as it

        CROSS APPLY (
          SELECT TOP 1 *
          FROM item_price_list
          WHERE item_code = it.item_code
            AND is_active = 1
          ORDER BY currency_code ASC
        ) ipl

        WHERE
          it.is_active = 1
          AND it.status = 1
          AND it.item_code = ${item_code}

      ) as i

      CROSS APPLY (
        SELECT TOP 1 *
        FROM item_uom iu
        WHERE iu.item_code = i.item_code
          AND iu.is_active = 1
        ORDER BY
          CASE WHEN iu.uom_code = 'P' THEN 0 ELSE 1 END
      ) iu

      WHERE
        iu.is_active = 1

      ORDER BY i.item_code;
    `;

    if (!res[0]) return null;

    const item = res[0];

    const images = item.images?.split(",") || [];

    return {
      ...item,

      isExpiryDeal: false,

      stock: await getItemStock(item.item_code, companyId),

      images,

      image: images[0],

      tags: [item.category],
    };
  }

  // =========================
  // EXPIRY DEAL PRODUCT
  // =========================

  const expiryRes: any[] = await prisma.$queryRaw`
    SELECT TOP 1

      it.item_code,

      it.description as name,

      it.alt_description as description,

      it.date_added as creation_date,

      ipl.price,

      ied.discount_percentage,

      ied.expiry_threshold_months,

      SUM(wcsdc.quantity) as quantity,

      MIN(wcsdc.expiry_date) as nearest_expiry_date,

      ipl.currency_code,

      it.brand_code as category,

      it.brand_code as cat_code,

      iu.barcode,

      ISNULL
      (
        (
          SELECT STRING_AGG
          (
            ISNULL
            (
              img.base_path + '/' +
              img.folder_path + '/' +
              img.physical_file_name,
              N''
            ),
            ','
          )
          FROM dbo.image AS img
          WHERE
            img.owner_code = iu.item_code
            AND img.owner_type = 1
            AND img.is_active = 1
            AND img.is_uploaded = 1
        ),
        N''
      ) as images

    FROM item it

    INNER JOIN item_expiry_deal ied
      ON ied.item_code = it.item_code
      AND ied.is_active = 1

    INNER JOIN warehouse_current_stock_distribution_code wcsdc
      ON wcsdc.item_code = it.item_code

    CROSS APPLY (
      SELECT TOP 1 *
      FROM item_price_list
      WHERE item_code = it.item_code
        AND is_active = 1
      ORDER BY currency_code ASC
    ) ipl

    CROSS APPLY (
      SELECT TOP 1 *
      FROM item_uom iu
      WHERE iu.item_code = it.item_code
        AND iu.is_active = 1
      ORDER BY
        CASE WHEN iu.uom_code = 'P' THEN 0 ELSE 1 END
    ) iu

    WHERE
      it.item_code = ${item_code}

      AND wcsdc.expiry_date IS NOT NULL

      AND wcsdc.quantity > 0

      AND DATEDIFF
      (
        MONTH,
        GETDATE(),
        wcsdc.expiry_date
      ) <= ied.expiry_threshold_months

    GROUP BY
      it.item_code,
      it.description,
      it.alt_description,
      it.date_added,
      ipl.price,
      ied.discount_percentage,
      ied.expiry_threshold_months,
      ipl.currency_code,
      it.brand_code,
      iu.barcode,
      iu.item_code
  `;

  if (!expiryRes[0]) return null;

  const item = expiryRes[0];

  const images = item.images?.split(",") || [];

  const originalPrice = Number(item.price);

  const discountedPrice =
    originalPrice - (originalPrice * Number(item.discount_percentage)) / 100;

  return {
    item_code: `${item.item_code}__expiry`,

    parent_item_code: item.item_code,

    name: `${item.name} (Expiry Deal)`,

    description: item.description,

    creation_date: item.creation_date,

    price: originalPrice.toString(),

    discountedPrice: discountedPrice.toString(),

    isFavorite: false,

    images,

    image: images[0],

    category: item.category,

    cat_code: item.cat_code,

    barcode: item.barcode,

    stock: await getExpiryItemStock(item.item_code, companyId),

    currency_code: item.currency_code,

    hasPromotion: false,

    tags: [item.category],

    isExpiryDeal: true,

    expiryDiscountPercentage: Number(item.discount_percentage),

    expiryMonthsLeft: Math.max(
      0,
      Math.ceil(
        (new Date(item.nearest_expiry_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24 * 30),
      ),
    ),
  };
};

const getBrands = async (companyId: string) => {
  const prisma = getPrisma(companyId);

  const brands = await prisma.$queryRaw`
    SELECT DISTINCT
    ib.item_brand_code,
    ib.description
    FROM dbo.item_brand AS ib
    INNER JOIN dbo.item AS it
        ON it.brand_code = ib.item_brand_code
    WHERE ib.is_active = 1
      AND it.is_active = 1
      AND EXISTS (
          SELECT 1
          FROM dbo.item_price_list AS ipl
          WHERE ipl.item_code = it.item_code
            AND ipl.is_active = 1
      )
  `;

  if (!brands) throw new Error("Brands not found");

  return brands;
};

export { getProducts, getProductInfo, getBrands };
