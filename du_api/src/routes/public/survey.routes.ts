import { Hono } from "hono";
import { getProductsSurvey } from "../../crud/surveyController";
import { getUserId } from "../../lib/utils";
const router = new Hono();

router.get(`/get-products`, async (c) => {
  try {
    const userId = await getUserId(c);
    const { skip, take, search } = c.req.query();
    const result = await getProductsSurvey({
      skip: parseInt(skip as string) || 0,
      take: parseInt(take as string) || 25,
      search: search,
    });
    return c.json({
      message: "Fetched Products",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
export default router;
