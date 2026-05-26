import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import { getExpiryItemStock, getItemStock } from "../lib/utils";

type CartItem = {
  item_code: string;
  parent_item_code?: string;
  name: string;
  description: string;
  price: string;
  discountedPrice: string;
  images: string;
  image?: string;
  category: string;
  subCategory: string;
  cat_code: string;
  barcode: string;
  quantity: number;
  stock: number;
  currency_code: string;
  tags?: string[];
  // =========================
  // EXPIRY DEAL
  // =========================
  isExpiryDeal?: boolean;
  expiryDiscountPercentage?: number;
};

const addItemToCart = async (
  userId: number,
  itemCode: string,
  barcode: string,
  quantity: number,
  isExpiryDeal?: boolean,
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
        is_expiry_deal_item: isExpiryDeal || false,
      },
      select: {
        item_code: true,
        id: true,
        quantity: true,
      },
    });
    if (found) {
      newQuantity += found.quantity;
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
      const result = await tx.shopping_cart.create({
        data: {
          account_id: userId,
          item_code: itemCode,
          barcode: barcode,
          quantity: quantity,
          date_added: new Date(),
          status: 5,
          is_expiry_deal_item: isExpiryDeal || false,
        },
      });
      return { ...result, id: result.id.toString() };
    }
  });
  return { ...result, id: result.id.toString() };
};
const removeItemFromCart = async (
  userId: number,
  itemCode: string,
  isExpiryDeal?: boolean,
) => {
  const result = await prisma.shopping_cart.deleteMany({
    where: {
      account_id: userId,
      item_code: itemCode,
      is_expiry_deal_item: isExpiryDeal || false,
    },
  });
  return result;
};
const updateItemInCart = async (
  userId: number,
  itemCode: string,
  quantity: number,
  isExpiryDeal?: boolean,
) => {
  const result = await prisma.$transaction(async (tx) => {
    const found = await tx.shopping_cart.findFirst({
      where: {
        account_id: userId,
        item_code: itemCode,
        is_expiry_deal_item: isExpiryDeal || false,
      },
      select: {
        item_code: true,
        id: true,
      },
    });
    if (found) {
      const updated = await tx.shopping_cart.update({
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
      const result = await tx.shopping_cart.create({
        data: {
          account_id: userId,
          item_code: itemCode,
          barcode: itemCode,
          quantity: quantity,
          date_added: new Date(),
          is_expiry_deal_item: isExpiryDeal || false,
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
  // =========================
  // COUNT
  // =========================

  const count = await prisma.shopping_cart.count({
    where: {
      account_id: userId,
      status: 5,
      is_active: true,
    },
  });

  // =========================
  // CART ITEMS
  // =========================

  const res: any = await prisma.$queryRaw`
    SELECT
      iu.item_code,

      sc.is_expiry_deal_item,

      name =
        CASE
          WHEN sc.is_expiry_deal_item = 1
          THEN i.description + ' (Expiry Deal)'
          ELSE i.description
        END,

      barcode = sc.barcode,

      description = i.alt_description,

      currency_code = ipl.currency_code,

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

      originalPrice =
        CONVERT(DECIMAL(18,2), ipl.price),

      discountedPrice =
        CASE
          -- EXPIRY DEAL PRICE
          WHEN sc.is_expiry_deal_item = 1
          THEN CONVERT(
            DECIMAL(18,2),
            ipl.price -
            (
              ipl.price *
              ISNULL(ied.discount_percentage, 0) / 100.0
            )
          )

          -- NORMAL DEFAULT DISCOUNT
          WHEN ipl.default_discount > 0
          THEN CONVERT(
            DECIMAL(18,2),
            ipl.price -
            (
              0.01 *
              ipl.default_discount *
              ipl.price
            )
          )

          ELSE NULL
        END,

      quantity = SUM(sc.quantity),

      category = vi.[Category],

      subCategory = vi.[SubCategory],

      cat_code = vi.[CategoryCode],

      expiryDiscountPercentage = ied.discount_percentage

    FROM dbo.shopping_cart AS sc

    CROSS APPLY (
      SELECT TOP 1 *
      FROM dbo.item_uom iu
      WHERE iu.barcode = sc.barcode
      ORDER BY
        CASE WHEN iu.uom_code = 'P' THEN 0 ELSE 1 END
    ) iu

    JOIN dbo.item AS i
      ON i.item_code = iu.item_code

    JOIN dbo.item_price_list AS ipl
      ON ipl.item_code = iu.item_code
      AND ipl.is_active = 1

    LEFT JOIN dbo.v_items AS vi
      ON vi.Code = iu.item_code

    LEFT JOIN dbo.item_expiry_deal AS ied
      ON ied.item_code = iu.item_code
      AND ied.is_active = 1

    WHERE
      sc.account_id = ${userId}
      AND sc.is_active = 1
      AND sc.status = 5
      AND iu.is_active = 1

    GROUP BY
      iu.item_code,
      sc.is_expiry_deal_item,
      i.description,
      sc.barcode,
      i.alt_description,
      ipl.price,
      ipl.default_discount,
      ipl.currency_code,
      vi.[Category],
      vi.[SubCategory],
      vi.[CategoryCode],
      ied.discount_percentage

    ORDER BY iu.item_code

    OFFSET ${skip || 0} ROWS
    FETCH NEXT ${take || 999999} ROWS ONLY
  `;

  // =========================
  // FORMAT RESULT
  // =========================

  const finalResult: CartItem[] = await Promise.all(
    res.map(async (item) => {
      const images = item.images?.split(",") || [];

      const stock = item.is_expiry_deal_item
        ? await getExpiryItemStock(item.item_code)
        : await getItemStock(item.item_code);

      return {
        item_code: item.is_expiry_deal_item
          ? `${item.item_code}__expiry`
          : item.item_code,

        parent_item_code: item.is_expiry_deal_item ? item.item_code : null,

        name: item.name,

        barcode: item.barcode,

        description: item.description,

        currency_code: item.currency_code,

        price: item.originalPrice?.toString(),

        discountedPrice: item.discountedPrice
          ? item.discountedPrice.toString()
          : null,

        quantity: Number(item.quantity),

        stock,

        images,

        image: images[0],

        category: item.category,

        subCategory: item.subCategory,

        cat_code: item.cat_code,

        tags: [item.category, item.subCategory],

        isExpiryDeal: Boolean(item.is_expiry_deal_item),

        expiryDiscountPercentage: item.expiryDiscountPercentage
          ? Number(item.expiryDiscountPercentage)
          : null,
      };
    }),
  );

  return {
    items_count: count,
    products: finalResult,
  };
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
    CROSS APPLY (
      SELECT TOP 1 *
      FROM dbo.item_uom iu
      WHERE iu.item_code = i.item_code
      ORDER BY
        CASE WHEN iu.uom_code = 'P' THEN 0 ELSE 1 END
    ) iu
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

export {
  removeItemFromCart,
  addItemToCart,
  getCartItems,
  updateItemInCart,
  addItemToFavorite,
  getFavoriteItems,
  removeItemFromFavorite,
};
