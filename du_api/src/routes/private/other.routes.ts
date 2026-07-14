import { Hono } from "hono";
import { getDashboardData } from "../../crud/otherController";
import { getExpiryItemStock, getItemStock, getUserId } from "../../lib/utils";
const router = new Hono();

router.get(`/dashboard_data`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);

    const result = await getDashboardData(userId, companyId);

    return c.json({
      message: "Order placed",
      result: result,
    });
  } catch (e) {
    console.log(e.message);
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.get(`/get_item_stock/:itemCode`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);
    const itemCode = c.req.param("itemCode");
    const result = await getItemStock(itemCode, companyId);

    return c.json({
      message: "Stock fetched successfully",
      result: result,
    });
  } catch (e) {
    console.log(e.message);
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.get(`/get_expiry_item_stock/:itemCode`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const userId = await getUserId(c);
    const itemCode = c.req.param("itemCode");
    const result = await getExpiryItemStock(itemCode, companyId);

    return c.json({
      message: "ExpiryDeal Stock fetched successfully",
      result: result,
    });
  } catch (e) {
    console.log(e.message);
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
