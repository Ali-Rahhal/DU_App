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
  alternatives: string[],
) => {
  return await prisma.$transaction(async (tx) => {
    // remove old
    await tx.item_alternatives.updateMany({
      where: { item_code: itemCode },
      data: { is_active: false },
    });

    // insert new
    const created = await Promise.all(
      alternatives.map((alt, index) =>
        tx.item_alternatives.create({
          data: {
            item_code: itemCode,
            alternative_item_code: alt,
            priority: index + 1,
            is_active: true,
          },
        }),
      ),
    );

    return created;
  });
};

const getRestockConfig = async (itemCode: string) => {
  return await prisma.item_restock_config.findUnique({
    where: { item_code: itemCode },
  });
};

const upsertRestockConfig = async (
  itemCode: string,
  data: {
    min_stock: number;
    reorder_quantity: number;
    auto_trigger?: boolean;
  },
) => {
  return await prisma.item_restock_config.upsert({
    where: { item_code: itemCode },
    update: {
      min_stock: data.min_stock,
      reorder_quantity: data.reorder_quantity,
      auto_trigger: data.auto_trigger ?? false,
      is_active: true,
    },
    create: {
      item_code: itemCode,
      min_stock: data.min_stock,
      reorder_quantity: data.reorder_quantity,
      auto_trigger: data.auto_trigger ?? false,
      is_active: true,
    },
  });
};

const restockItem = async (itemCode: string) => {
  return await prisma.$transaction(async (tx) => {
    const config = await tx.item_restock_config.findUnique({
      where: { item_code: itemCode },
    });

    if (!config) throw new Error("Restock config not found");

    // add stock
    const stock = await tx.warehouse_current_stock.findFirst({
      where: { item_code: itemCode },
    });

    if (!stock) throw new Error("Stock record not found");

    const updatedStock = await tx.warehouse_current_stock.update({
      where: { warehouse_current_stock_id: stock.warehouse_current_stock_id },
      data: {
        quantity: {
          increment: config.reorder_quantity,
        },
      },
    });

    // (optional) log order / history
    // you can insert into purchase_order table here

    return updatedStock;
  });
};

export {
  getItemAlternatives,
  replaceItemAlternatives,
  getRestockConfig,
  upsertRestockConfig,
  restockItem,
};
