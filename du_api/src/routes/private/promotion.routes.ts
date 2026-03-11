import { Hono } from "hono";
import { getShoppingCartPromotions } from "../../crud/PromotionController";
import { getUserId } from "../../lib/utils";
const router = new Hono();

router.get(`/get_shopping_cart_promotions`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getShoppingCartPromotions(userId);
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
