import { Hono } from "hono";
import { getUserId } from "../../lib/utils";
import {
  getFidelityGifts,
  getFidelityPoints,
  getMilestoneRewards,
  redeemGift,
} from "../../crud/fidelityController";
const router = new Hono();

// =========================
// Get Fidelity Points
// =========================
router.get(`/getPoints`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);

    const result = await getFidelityPoints(userId, companyId);

    return c.json({
      message: "Fidelity points fetched successfully",
      result,
    });
  } catch (e) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

// =========================
// Get Gifts
// =========================
router.get(`/getGifts`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const skip = Number(c.req.query("skip") || 0);
    const take = Number(c.req.query("take") || 20);

    const result = await getFidelityGifts(skip, take, companyId);

    return c.json({
      message: "Fidelity gifts fetched successfully",
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

// =========================
// Get Milestone Rewards
// =========================
router.get(`/getMilestoneRewards`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const result = await getMilestoneRewards(companyId);

    return c.json({
      message: "Milestone rewards fetched successfully",
      result,
    });
  } catch (e) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

// =========================
// Redeem Gift
// =========================
router.post(`/redeemGift`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);

    const body = await c.req.json();

    const giftId = body["giftId"];

    if (!giftId) {
      throw new Error("Gift ID is required");
    }

    const result = await redeemGift(userId, BigInt(giftId), companyId);

    return c.json({
      message: "Gift redeemed successfully",
      result,
    });
  } catch (e) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

export default router;
