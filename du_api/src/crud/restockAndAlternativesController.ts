import prisma from "../lib/prisma";

const getItemAlternatives = async (itemCode: string) => {
  return await prisma.item_alternatives.findMany({
    where: {
      item_code: itemCode,
      is_active: true,
    },
    select: {
      alternative_item_code: true,
      priority: true,
    },
    orderBy: {
      priority: "asc",
    },
  });
};

const replaceItemAlternatives = async (
  itemCode: string,
  alternatives: { alternative_item_code: string; priority: number }[],
) => {
  return await prisma.$transaction(async (tx) => {
    // remove old
    await tx.item_alternatives.deleteMany({
      where: { item_code: itemCode },
    });
    // insert new
    const created = await Promise.all(
      alternatives.map((alt) =>
        tx.item_alternatives.create({
          data: {
            item_code: itemCode,
            alternative_item_code: alt.alternative_item_code,
            priority: alt.priority,
            is_active: true,
          },
        }),
      ),
    );

    return created;
  });
};

const getRestockConfig = async (userId: number, itemCode: string) => {
  const config = await prisma.item_restock_config.findUnique({
    where: { client_id_item_code: { client_id: userId, item_code: itemCode } },
  });
  if (!config) return null;
  return {
    ...config,
    min_stock: Number(config.min_stock),
  };
};

const upsertRestockConfig = async (
  userId: number,
  itemCode: string,
  min_stock: number,
) => {
  const config = await prisma.item_restock_config.upsert({
    where: { client_id_item_code: { client_id: userId, item_code: itemCode } },
    update: {
      min_stock: min_stock,
      is_active: true,
    },
    create: {
      item_code: itemCode,
      client_id: userId,
      min_stock: min_stock,
      is_active: true,
    },
  });

  return {
    ...config,
    min_stock: Number(config.min_stock),
  };
};

const restockItem = async (
  userId: number,
  itemCode: string,
  current_stock: number,
) => {
  return await prisma.$transaction(async (tx) => {
    const config = await getRestockConfig(userId, itemCode);
    if (!config) throw new Error("Restock config not found");
    const { min_stock } = config;
    if (min_stock < current_stock)
      throw new Error(
        "Current stock is greater than min stock. Restock is not required",
      );

    const found = await tx.shopping_cart.findFirst({
      where: { account_id: userId, item_code: itemCode },
    });

    if (found) {
      if (found.quantity >= min_stock)
        throw new Error(
          "Item is already restocked in cart. Restock is not required",
        );
      const cart = await tx.shopping_cart.update({
        where: { id: found.id },
        data: {
          quantity: min_stock - current_stock,
        },
      });

      return {
        ...cart,
      };
    }

    const cart = await tx.shopping_cart.create({
      data: {
        account_id: userId,
        item_code: itemCode,
        barcode: itemCode,
        quantity: min_stock - current_stock,
      },
    });

    return {
      ...cart,
    };
  });
};

export {
  getItemAlternatives,
  replaceItemAlternatives,
  getRestockConfig,
  upsertRestockConfig,
  restockItem,
};
