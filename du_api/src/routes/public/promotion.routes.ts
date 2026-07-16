import { Hono } from "hono";
import {
  getAllAvailablePromotions,
  getProductPromotions,
} from "../../crud/PromotionController";
import { getUserIdFromToken } from "../../lib/utils";
const router = new Hono();

router.get(`/promotions`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const result = await getAllAvailablePromotions(companyId);

    return c.json({ message: "Promotions fetched", result: result });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.get(`/get_product_promotions`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const item_code = c.req.query("item_code");
    const userId = await getUserIdFromToken(c, companyId)
      .then((res) => {
        return res;
      })
      .catch((e) => {
        return null;
      });
    const result = await getProductPromotions(
      item_code as string,
      userId as number,
      companyId,
    );
    return c.json({
      message: "Fetched Promotions ",
      result: result,
    });
  } catch (e) {
    console.log(e.message);
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
