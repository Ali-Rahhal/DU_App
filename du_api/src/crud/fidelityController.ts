import { Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";

const getFidelityPoints = async (userId: number, companyId: string) => {
  const prisma = getPrisma(companyId);
  // =========================
  // Get user account
  // =========================
  const user = await prisma.web_accounts.findFirst({
    where: {
      id: userId,
    },
    select: {
      code: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // =========================
  // Currency rates to USD
  // =========================
  const currencyRates: Record<string, number> = {
    USD: 1,
    LBP: 1 / 89500,
    EUR: 1.16,
    TND: 0.34,
  };

  // =========================
  // Get delivered invoices
  // transaction_type = 4
  // transaction_status = 8
  // =========================
  const invoices = await prisma.transaction_header.findMany({
    where: {
      destination_code: user.code,
      transaction_type: 4,
      transaction_status: 8,
      is_active: true,
    },
    orderBy: {
      transaction_header_id: "desc",
    },
  });

  // =========================
  // Scan invoices
  // =========================
  for (const invoice of invoices) {
    // =========================
    // Skip already processed invoices
    // =========================
    const exists = await prisma.fidelity_points_ledger.findFirst({
      where: {
        transaction_header_id: BigInt(invoice.transaction_header_id.toString()),
      },
    });

    if (exists) {
      continue;
    }

    // =========================
    // Find related sales order
    // Type = 3
    // =========================
    const salesOrder = await prisma.transaction_header.findFirst({
      where: {
        parent_transaction_header_id: BigInt(
          invoice.transaction_header_id.toString(),
        ),
        transaction_type: 3,
        is_active: true,
      },
    });

    if (!salesOrder) {
      continue;
    }

    // =========================
    // Get purchased items
    // =========================
    const bodies = await prisma.transaction_body.findMany({
      where: {
        transaction_header_id: BigInt(
          salesOrder.transaction_header_id.toString(),
        ),
        is_active: true,
      },
    });

    // =========================
    // Currency conversion
    // =========================
    const currency = invoice.currency_code?.toUpperCase() || "USD";

    const rateToUsd = currencyRates[currency] || 1;

    // =========================
    // Calculate total in USD
    // =========================
    let totalUsd = 0;

    for (const item of bodies) {
      totalUsd += Number(item.total_final_price || 0) * rateToUsd;
    }

    // =========================
    // 1 USD = 5 Point
    // =========================
    const pointsEarned = Math.floor(totalUsd) * 5;

    // =========================
    // Insert ledger row
    // =========================
    await prisma.fidelity_points_ledger.create({
      data: {
        account_id: userId,
        transaction_header_id: BigInt(invoice.transaction_header_id.toString()),
        points_earned: pointsEarned,
        points_redeemed: 0,
        description: `Points earned from invoice ${invoice.transaction_header_code}`,
      },
    });
  }

  // =========================
  // Get ledger
  // =========================
  const ledger = await prisma.fidelity_points_ledger.findMany({
    where: {
      account_id: userId,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  // =========================
  // Calculate totals
  // =========================
  const totalEarned = ledger.reduce((sum, row) => sum + row.points_earned, 0);

  const totalRedeemed = ledger.reduce(
    (sum, row) => sum + row.points_redeemed,
    0,
  );

  const availablePoints = totalEarned - totalRedeemed;

  // =========================
  // Get reward rules
  // =========================
  const rewardRules = await prisma.fidelity_reward_rule.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      required_points: "asc",
    },
  });

  // =========================
  // Grant missing rewards
  // =========================
  for (const rule of rewardRules) {
    // Skip rules user didn't unlock yet
    if (totalEarned < rule.required_points) {
      continue;
    }

    const alreadyGranted = await prisma.fidelity_user_reward.findFirst({
      where: {
        account_id: userId,
        fidelity_reward_rule_id: rule.fidelity_reward_rule_id,
        is_active: true,
      },
    });

    if (!alreadyGranted) {
      await prisma.fidelity_user_reward.create({
        data: {
          account_id: userId,
          fidelity_reward_rule_id: rule.fidelity_reward_rule_id,
          granted_at: new Date(),
          is_active: true,
        },
      });

      // Optional ledger log
      await prisma.fidelity_points_ledger.create({
        data: {
          account_id: userId,
          points_earned: 0,
          points_redeemed: 0,
          description: `Reward unlocked: ${rule.name}`,
        },
      });
    }
  }

  // =========================
  // Get granted rewards
  // =========================
  const userRewards = await prisma.fidelity_user_reward.findMany({
    where: {
      account_id: userId,
      is_active: true,
    },
    include: {
      fidelity_reward_rule: true,
    },
    orderBy: {
      granted_at: "desc",
    },
  });

  return {
    totalEarned,
    totalRedeemed,
    availablePoints,

    rewards: userRewards.map((reward) => ({
      fidelity_user_reward_id: reward.fidelity_user_reward_id.toString(),

      reward_name: reward.fidelity_reward_rule.name,

      reward_type: reward.fidelity_reward_rule.reward_type,

      required_points: reward.fidelity_reward_rule.required_points,

      discount_percentage: reward.fidelity_reward_rule.discount_percentage,

      fixed_discount_amount: reward.fidelity_reward_rule.fixed_discount_amount,

      granted_at: reward.granted_at,
    })),

    ledger: ledger.map((row) => ({
      ...row,
      fidelity_points_ledger_id: row.fidelity_points_ledger_id.toString(),

      transaction_header_id: row.transaction_header_id?.toString(),
    })),
  };
};

const getFidelityGifts = async (skip = 0, take = 20, companyId: string) => {
  const prisma = getPrisma(companyId);
  const gifts = await prisma.fidelity_gift.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      required_points: "asc",
    },
    skip,
    take,
  });

  const total = await prisma.fidelity_gift.count({
    where: {
      is_active: true,
    },
  });

  return {
    items: gifts.map((gift) => ({
      ...gift,
      fidelity_gift_id: gift.fidelity_gift_id.toString(),
    })),
    total,
    hasMore: skip + take < total,
  };
};

const getMilestoneRewards = async (companyId: string) => {
  const prisma = getPrisma(companyId);
  const rewards = await prisma.fidelity_reward_rule.findMany({
    where: {
      is_active: true,
    },
    orderBy: {
      required_points: "asc",
    },
  });

  return rewards.map((reward) => ({
    ...reward,
    fidelity_reward_rule_id: reward.fidelity_reward_rule_id.toString(),
  }));
};

const redeemGift = async (
  userId: number,
  giftId: bigint,
  companyId: string,
) => {
  const prisma = getPrisma(companyId);
  try {
    const result = await prisma.$queryRaw<any[]>(
      Prisma.sql`
        EXEC REDEEM_FIDELITY_GIFT
          @user_id = ${userId},
          @gift_id = ${giftId}
      `,
    );

    return result?.[0];
  } catch (error: any) {
    throw new Error(error?.message || "Redeem failed");
  }
};

export { getFidelityPoints, getFidelityGifts, getMilestoneRewards, redeemGift };
