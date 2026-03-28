import { Hono } from "hono";
import { getDashboardData } from "../../crud/otherController";
import { getUserId } from "../../lib/utils";
const router = new Hono();

router.get(`/dashboard_data`, async (c) => {
  try {
    const userId = await getUserId(c);

    const result = await getDashboardData(userId);

    return c.json({
      message: "Order placed",
      result: result,
    });
  } catch (e) {
    console.log(e.message);
    return c.json({ message: e.message, result: null }, 400);
  }
});
export default router;
