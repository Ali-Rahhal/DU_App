import { Hono } from "hono";
import {
  getExpiryDeal,
  upsertExpiryDeal,
} from "../../crud/expiryDealController";
import { getUserId } from "../../lib/utils";
const router = new Hono();

router.get(`/:code`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const itemCode = c.req.param("code");
    if (!itemCode) throw new Error("Item code is required");

    const result = await getExpiryDeal(itemCode, companyId);

    return c.json({ message: "Fetched expiry deal", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.post(`/:code`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const itemCode = c.req.param("code");
    const body = await c.req.json();

    const { expiry_threshold_months, discount_percentage } = body;

    if (!itemCode) throw new Error("Item code is required");
    if (expiry_threshold_months === undefined)
      throw new Error("Missing expiry_threshold_months");
    if (discount_percentage === undefined)
      throw new Error("Missing discount_percentage");

    const result = await upsertExpiryDeal(
      itemCode,
      expiry_threshold_months,
      discount_percentage,
      companyId,
    );

    return c.json({ message: "Expiry deal updated", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
