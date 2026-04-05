import { Hono } from "hono";
import {
  getItemAlternatives,
  getRestockConfig,
  replaceItemAlternatives,
  restockItem,
  upsertRestockConfig,
} from "../../crud/restockAndAlternativesController";
import { getUserId } from "../../lib/utils";
const router = new Hono();

router.post(`/:code/alternatives`, async (c) => {
  try {
    const itemCode = c.req.param("code");
    const body = await c.req.json();
    const alternatives = body.alternatives; // array of item_codes

    if (!itemCode) throw new Error("Item code is required");
    if (!Array.isArray(alternatives))
      throw new Error("Alternatives must be an array");

    const result = await replaceItemAlternatives(itemCode, alternatives);

    return c.json({ message: "Alternatives updated", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.get(`/:code/restock-config`, async (c) => {
  try {
    const userId = await getUserId(c);
    const itemCode = c.req.param("code");

    if (!itemCode) throw new Error("Item code is required");

    const result = await getRestockConfig(userId, itemCode);

    return c.json({ message: "Fetched restock config", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.post(`/:code/restock-config`, async (c) => {
  try {
    const userId = await getUserId(c);
    const itemCode = c.req.param("code");
    const body = await c.req.json();

    const { min_stock } = body;

    if (!itemCode) throw new Error("Item code is required");
    if (!min_stock) throw new Error("Missing required min_stock field");

    const result = await upsertRestockConfig(userId, itemCode, min_stock);

    return c.json({ message: "Restock config updated", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.post(`/:code/restock`, async (c) => {
  try {
    const userId = await getUserId(c);

    const itemCode = c.req.param("code");
    if (!itemCode) throw new Error("Item code is required");

    const { current_stock } = await c.req.json();
    if (!current_stock && current_stock !== 0)
      throw new Error("Missing required current_stock field");

    const result = await restockItem(userId, itemCode, current_stock);

    return c.json(
      { message: "Item added to cart successfully for restocking", result },
      200,
    );
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
