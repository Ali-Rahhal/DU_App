import { Hono } from "hono";
import { getSideBarMenu } from "../../crud/otherController";
const router = new Hono();

router.get(`/get_side_bar`, async (c) => {
  try {
    const result = await getSideBarMenu();
    return c.json({
      message: "Fetched side bar",
      result: result,
    });
  } catch (e) {
    return c.json({ message: e.message, result: null }, 400);
  }
});
export default router;
