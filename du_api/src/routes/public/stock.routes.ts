import { Hono } from "hono";
import { getItemAlternatives } from "../../crud/stockController";
const router = new Hono();

router.get(`/:code/alternatives`, async (c) => {
  try {
    const itemCode = c.req.param("code");

    if (!itemCode) throw new Error("Item code is required");

    const result = await getItemAlternatives(itemCode);

    return c.json({ message: "Fetched alternatives", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
