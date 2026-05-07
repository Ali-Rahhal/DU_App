import prisma from "../lib/prisma";

const getExpiryDeal = async (itemCode: string) => {
  const config = await prisma.item_expiry_deal.findUnique({
    where: {
      item_code: itemCode,
    },
  });

  if (!config || !config.is_active) return null;

  return {
    ...config,
    expiry_threshold_months: Number(config.expiry_threshold_months),
    discount_percentage: Number(config.discount_percentage),
  };
};

const upsertExpiryDeal = async (
  itemCode: string,
  expiry_threshold_months: number,
  discount_percentage: number,
) => {
  const config = await prisma.item_expiry_deal.upsert({
    where: {
      item_code: itemCode,
    },
    update: {
      expiry_threshold_months,
      discount_percentage,
      is_active: true,
      last_edited: new Date(),
    },
    create: {
      item_code: itemCode,
      expiry_threshold_months,
      discount_percentage,
      is_active: true,
    },
  });

  return {
    ...config,
    expiry_threshold_months: Number(config.expiry_threshold_months),
    discount_percentage: Number(config.discount_percentage),
  };
};

export { getExpiryDeal, upsertExpiryDeal };
