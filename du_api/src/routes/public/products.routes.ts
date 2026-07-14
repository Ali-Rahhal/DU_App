import { Hono } from "hono";
import { getUserIdFromToken } from "../../lib/utils";
import { getProductInfo, getProducts } from "../../crud/productsController";
const router = new Hono();

router.post(`/get_products`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const skip = c.req.query("skip");
    const take = c.req.query("take");

    const {
      category_code,
      sub_category_code,
      sort_by,
      sort_direction,
      show_only_best_deals,
      min_price,
      max_price,
      search,
      onPromotionOnly,
      containExpiryDealProducts,
    } = await c.req.json();

    const result = await getUserIdFromToken(c)
      .then(async (res) => {
        return await getProducts(
          {
            skip: parseInt(skip as string) || 0,
            take: parseInt(take as string) || 10,

            category_code:
              !category_code || (category_code as string[]).includes("all")
                ? []
                : category_code,

            sort_by: sort_by || "date",
            sort_direction: sort_direction || "DESC",
            show_only_best_deals,
            min_price: min_price || null,
            max_price: max_price || null,
            user_id: res,
            search,
            onPromotionOnly: onPromotionOnly || false,

            containExpiryDealProducts: containExpiryDealProducts || false,
          },
          companyId,
        );
      })
      .catch(async () => {
        return await getProducts(
          {
            skip: parseInt(skip as string) || 0,
            take: parseInt(take as string) || 10,

            category_code:
              !category_code || (category_code as string[]).includes("all")
                ? []
                : category_code,

            sort_by: sort_by || "date",
            sort_direction: sort_direction || "DESC",
            show_only_best_deals,
            min_price: min_price || null,
            max_price: max_price || null,
            search,
            onPromotionOnly: onPromotionOnly || false,

            containExpiryDealProducts: containExpiryDealProducts || false,
          },
          companyId,
        );
      });

    return c.json(
      {
        message: "Fetched Products",
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

router.post(`/get_product/:item_code`, async (c) => {
  try {
    const companyId = String(
      c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
    );
    const item_code = c.req.param("item_code");
    let { isExpiryDealProduct } = await c.req.json();
    isExpiryDealProduct = Boolean(isExpiryDealProduct);

    const result: any = await getUserIdFromToken(c)
      .then(async (res) => {
        const result = await getProductInfo(
          item_code,
          res,
          companyId,
          isExpiryDealProduct,
        );
        return result;
      })
      .catch(async (e) => {
        const result = await getProductInfo(
          item_code,
          null,
          companyId,
          isExpiryDealProduct,
        );
        return result;
      });

    // const result = await getProductInfo(item_code);
    return c.json({ message: "Fetched Product", result: result }, 200);
  } catch (e) {
    console.error(e);
    console.log(e.message);
    return c.json({ message: e.message, result: null }, 400);
  }
});
export default router;
