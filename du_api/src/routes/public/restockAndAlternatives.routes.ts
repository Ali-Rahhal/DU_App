import { Hono } from "hono";
import { getItemAlternatives } from "../../crud/restockAndAlternativesController";
const router = new Hono();

router.get(`/:code/alternatives`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const itemCode = c.req.param("code");

    if (!itemCode) throw new Error("Item code is required");

    const result = await getItemAlternatives(itemCode, companyId);

    return c.json({ message: "Fetched alternatives", result }, 200);
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

export default router;
