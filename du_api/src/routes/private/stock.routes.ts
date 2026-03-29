import { Hono } from "hono";
import {
  getItemAlternatives,
  getRestockConfig,
  replaceItemAlternatives,
  restockItem,
  upsertRestockConfig,
} from "../../crud/stockController";
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
    const itemCode = c.req.param("code");

    if (!itemCode) throw new Error("Item code is required");

    const result = await getRestockConfig(itemCode);

    return c.json({ message: "Fetched restock config", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.post(`/:code/restock-config`, async (c) => {
  try {
    const itemCode = c.req.param("code");
    const body = await c.req.json();

    const { min_stock, reorder_quantity, auto_trigger } = body;

    if (!itemCode) throw new Error("Item code is required");
    if (!min_stock || !reorder_quantity)
      throw new Error("Missing required fields");

    const result = await upsertRestockConfig(itemCode, {
      min_stock,
      reorder_quantity,
      auto_trigger,
    });

    return c.json({ message: "Restock config updated", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

router.post(`/:code/restock`, async (c) => {
  try {
    const itemCode = c.req.param("code");

    if (!itemCode) throw new Error("Item code is required");

    const result = await restockItem(itemCode);

    return c.json({ message: "Item restocked", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
