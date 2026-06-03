import { Hono } from "hono";
import { getUserId } from "../../lib/utils";
import { getAISuggestedProducts } from "../../crud/aiController";
const router = new Hono();

router.get("/suggested-products", async (c) => {
  try {
    const userId = await getUserId(c);
    if (!userId) {
      return c.json(
        {
          message: "User not found",
          result: null,
        },
        400,
      );
    }

    const result = await getAISuggestedProducts(userId);

    return c.json(
      {
        message: "AI Suggested Products",
        result,
      },
      200,
    );
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

export default router;
